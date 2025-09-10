import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Package, Plus, Users, Edit, Trash2, X, User, Calendar, DollarSign, 
    FileText, Search, List, Archive
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getOrders, updateOrder, createOrder, deleteOrder, type OrderWithRelations } from '../lib/orders';
import { getUserProfiles, getCustomers } from '../lib/database';
import { getProductLibrary, type ProductLibraryItem, UNIT_DESCRIPTIONS } from '../lib/quoteTemplates';
import type { UserProfile, Customer, OrderStatus } from '../types/database';
import PageHeader from './PageHeader';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../hooks/useToast';
import OrderStatusBadge from './OrderStatusBadge';
import { getTeams, type TeamWithRelations } from '../lib/teams';

// ==================================
// TYPES & CONSTANTS
// ==================================

type ViewMode = 'list' | 'archive';

const STATUS_OPTIONS: OrderStatus[] = [
  'öppen_order', 'bokad_bekräftad', 'pågående', 'slutförd', 'fakturerad', 'arkiverad'
];

type OrderFiltersState = {
  searchTerm: string;
  status: OrderStatus | 'all';
  customer: string | 'all';
  user: string | 'all';
  team: string | 'all';
  dateFrom: string;
  dateTo: string;
};

// ==================================
// MAIN COMPONENT
// ==================================

export function Ordermanagement() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);

  // Data state
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<ProductLibraryItem[]>([]);
  const [teams, setTeams] = useState<TeamWithRelations[]>([]); // Add this line

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);

  // Filtering and Sorting
  const [filters, setFilters] = useState<OrderFiltersState>({
    searchTerm: '',
    status: 'all',
    customer: 'all',
    user: 'all',
    team: 'all',
    dateFrom: '',
    dateTo: '',
  });

  

  // Fetch initial data
  const fetchData = useCallback(async (profile: UserProfile) => {
    try {
      setLoading(true);
      setError(null);
      if (!profile.organisation_id) throw new Error("Organisation not found");

      const [ordersResult, usersResult, customersResult, productsResult, teamsResult] = await Promise.all([
        getOrders(profile.organisation_id),
        getUserProfiles(profile.organisation_id),
        getCustomers(profile.organisation_id),
        getProductLibrary(profile.organisation_id),
        getTeams(profile.organisation_id),
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (usersResult.error) throw usersResult.error;
      if (customersResult.error) throw customersResult.error;
      if (productsResult.error) throw productsResult.error;
      if (teamsResult.error) throw teamsResult.error;

      setOrders(ordersResult.data || []);
      setUsers(usersResult.data || []);
      setCustomers(customersResult.data || []);
      setProducts(productsResult.data || []);
      setTeams(teamsResult.data || []);

    } catch (err: any) {
      setError(`Kunde inte ladda orderdata: ${err.message}`);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (user) {
      getUserProfiles('', { userId: user.id }).then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else if (data && data[0]) {
          setCurrentUserProfile(data[0]);
          fetchData(data[0]);
        }
      });
    }
  }, [user, fetchData]);

  // Memoized filtering logic
  const filteredOrders = useMemo(() => {
    let result = orders;
    
    if (viewMode === 'archive') {
      result = result.filter(order => order.status === 'arkiverad');
    } else {
      result = result.filter(order => order.status !== 'arkiverad');
    }
    
    if (filters.searchTerm) {
      const lowercasedTerm = filters.searchTerm.toLowerCase();
      result = result.filter(order =>
        order.title.toLowerCase().includes(lowercasedTerm) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(lowercasedTerm)) ||
        `#${order.id}`.includes(lowercasedTerm)
      );
    }

    if (filters.status !== 'all' && viewMode !== 'archive') {
      result = result.filter(order => order.status === filters.status);
    }
    
    if (filters.customer !== 'all') {
        result = result.filter(order => order.customer_id === filters.customer);
    }

    if (filters.user !== 'all') {
      result = result.filter(order => order.assigned_to_user_id === filters.user);
    }

    if (filters.team !== 'all') {
      result = result.filter(order => order.assigned_to_team_id === filters.team);
    }

    if (filters.dateFrom) {
        result = result.filter(order => new Date(order.created_at) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999); // Include the whole day
        result = result.filter(order => new Date(order.created_at) <= endDate);
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, filters, viewMode]);

  const orderStats = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(new Date().setDate(now.getDate() - 30));
    const last6Months = new Date(new Date().setDate(now.getDate() - 180));

    const activeOrders = orders.filter(o => o.status !== 'arkiverad');

    const totalFilteredValue = filteredOrders.reduce((sum, order) => sum + (order.value || 0), 0);
    const totalAllTimeValue = activeOrders.reduce((sum, order) => sum + (order.value || 0), 0);
    
    const totalLastMonthValue = activeOrders
      .filter(o => new Date(o.created_at) > lastMonth)
      .reduce((sum, order) => sum + (order.value || 0), 0);
      
    const totalLast6MonthsValue = activeOrders
      .filter(o => new Date(o.created_at) > last6Months)
      .reduce((sum, order) => sum + (order.value || 0), 0);

    return { totalFilteredValue, totalAllTimeValue, totalLastMonthValue, totalLast6MonthsValue };
  }, [orders, filteredOrders]);

  // Handlers
  const handleOpenDetailModal = (order: OrderWithRelations) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleOpenEditModal = (order: OrderWithRelations | null) => {
    setSelectedOrder(order); 
    setIsEditModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleOpenDeleteConfirm = (order: OrderWithRelations) => {
    setSelectedOrder(order);
    setIsConfirmDeleteOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleSaveOrder = async (formData: any) => {
    if (!currentUserProfile?.organisation_id) return;
    
    const { line_items, notes, ...orderData } = formData;

    // FIX: Convert empty strings to null for foreign key fields
    if (orderData.assigned_to_user_id === '') {
        orderData.assigned_to_user_id = null;
    }
    if (orderData.assigned_team_id === '') {
        orderData.assigned_team_id = null;
    }

    try {
        if (selectedOrder) { // Update
            const { data, error } = await updateOrder(selectedOrder.id, orderData, line_items, notes);
            if (error) throw error;
            setOrders(prev => prev.map(o => (o.id === selectedOrder.id ? data! : o)));
            addToast("Order uppdaterad!", 'success');
        } else { // Create
            const { data, error } = await createOrder(orderData, line_items, notes, currentUserProfile.organisation_id);
            if (error) throw error;
            setOrders(prev => [data!, ...prev]);
            addToast("Ny order skapad!", 'success');
        }
        setIsEditModalOpen(false);
        setSelectedOrder(null);
    } catch (error: any) {
        addToast(`Kunde inte spara order: ${error.message}`, 'error');
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    const { error } = await deleteOrder(selectedOrder.id);
    if (error) {
      addToast(`Kunde inte ta bort order: ${error.message}`, 'error');
    } else {
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      addToast("Order borttagen.", 'success');
    }
    setIsConfirmDeleteOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" text="Laddar ordrar..." /></div>;
  }
  
  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orderhantering"
        subtitle={`${filteredOrders.length} av ${orders.length} ordrar visas`}
        icon={Package}
        actions={<button onClick={() => handleOpenEditModal(null)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Skapa ny order</button>}
      />

      <OrderStats stats={orderStats} />
      
      <OrderFilters 
        filters={filters}
        onFiltersChange={setFilters}
        customers={customers}
        users={users}
        teams={teams}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {filteredOrders.length === 0 ? (
        <EmptyState
            icon={Package}
            title="Inga ordrar hittades"
            message={Object.values(filters).some(v => v && v !== 'all') ? "Prova att justera dina filter." : "Skapa en ny order för att komma igång."}
        />
      ) : (
        <OrderListView orders={filteredOrders} onOpenDetail={handleOpenDetailModal} onOpenEdit={handleOpenEditModal} />
      )}
      
      {isDetailModalOpen && selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setIsDetailModalOpen(false)} onOpenEdit={handleOpenEditModal} onOpenDelete={handleOpenDeleteConfirm} />}
      {isEditModalOpen && <OrderEditModal order={selectedOrder} customers={customers} users={users} teams={teams} products={products} onClose={() => { setIsEditModalOpen(false); setSelectedOrder(null); }} onSave={handleSaveOrder} />}
      {isConfirmDeleteOpen && selectedOrder && <ConfirmDialog title="Ta bort order?" message={`Är du säker på att du vill ta bort ordern "${selectedOrder.title}"? Denna åtgärd kan inte ångras.`} onConfirm={handleDeleteOrder} onCancel={() => setIsConfirmDeleteOpen(false)} confirmText="Ja, ta bort" />}
    </div>
  );
}

// ==================================
// SUB-COMPONENTS
// ==================================

function OrderFilters({ filters, onFiltersChange, customers, users, teams, viewMode, onViewModeChange }: {
    filters: OrderFiltersState;
    onFiltersChange: React.Dispatch<React.SetStateAction<OrderFiltersState>>;
    customers: Customer[];
    users: UserProfile[];
    teams: TeamWithRelations[];
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFiltersChange(prev => ({ ...prev, [name]: value }));
    };

    const statusOptions = STATUS_OPTIONS.filter(s => s !== 'arkiverad');

    return (
        <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1 space-x-1">
                    {(['list', 'archive'] as const).map(mode => (
                        <button key={mode} onClick={() => onViewModeChange(mode)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 capitalize flex items-center gap-2 ${viewMode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-white/60'}`}
                        >
                        {mode === 'list' ? <List size={16} /> : <Archive size={16} />}
                        {mode === 'list' ? 'Aktiva' : 'Arkiv'}
                        </button>
                    ))}
                </div>
                <div className="relative flex-grow w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="searchTerm" placeholder="Sök på titel, kund eller ID..." value={filters.searchTerm} onChange={handleInputChange}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <select name="status" value={filters.status} onChange={handleInputChange} disabled={viewMode === 'archive'} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100">
                    <option value="all">Alla Statusar</option>
                    {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
                <select name="customer" value={filters.customer} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">Alla Kunder</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select name="user" value={filters.user} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">Alla Användare</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
              <select name="team" value={filters.team} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="all">Alla Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
                <div className="grid grid-cols-2 gap-2">
                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
            </div>
        </div>
    );
}

function OrderListView({ orders, onOpenDetail, onOpenEdit }: {
    orders: OrderWithRelations[];
    onOpenDetail: (order: OrderWithRelations) => void;
    onOpenEdit: (order: OrderWithRelations) => void;
}) {
  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return 'N/A';
    return `${value.toLocaleString('sv-SE')} SEK`;
  }
  
  return (
    <div className="overflow-x-auto bg-white rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kund</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ansvarig</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordervärde</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skapad</th>
            <th className="relative px-6 py-3"><span className="sr-only">Åtgärder</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map(order => (
            <tr key={order.id} onClick={() => onOpenDetail(order)} className="hover:bg-gray-50 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{order.title}</div>
                <div className="text-sm text-gray-500">#{order.id}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customer?.name || 'Okänd kund'}</td>
              <td className="px-6 py-4 whitespace-nowrap"><OrderStatusBadge status={order.status} /></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
  {order.assigned_to ? (
    <div className="flex items-center">
      <User className="w-4 h-4 mr-2 text-gray-400" />
      {order.assigned_to.full_name}
    </div>
  ) : order.assigned_team ? (
    <div className="flex items-center font-medium text-purple-700">
      <Users className="w-4 h-4 mr-2 text-purple-400" />
      {order.assigned_team.name}
    </div>
  ) : (
    'Ej tilldelad'
  )}
</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{formatCurrency(order.value)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(order.created_at).toLocaleDateString('sv-SE')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={(e) => { e.stopPropagation(); onOpenEdit(order); }} className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-gray-100">
                  <Edit className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onOpenEdit, onOpenDelete }: {
    order: OrderWithRelations;
    onClose: () => void;
    onOpenEdit: (order: OrderWithRelations) => void;
    onOpenDelete: (order: OrderWithRelations) => void;
}) {
    const formatCurrency = (value: number | null | undefined) => {
        if (value == null) return 'N/A';
        return `${value.toLocaleString('sv-SE')} SEK`;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                        <Package className="text-blue-600" />
                        {order.title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <OrderStatusBadge status={order.status} large />
                        <div className="text-sm text-gray-500">ID: #{order.id}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoItem icon={User} label="Kund" value={order.customer?.name || 'N/A'} />
                        <InfoItem icon={User} label="Ansvarig" value={order.assigned_to?.full_name || 'Ej tilldelad'} />
                        <InfoItem icon={Calendar} label="Skapad" value={new Date(order.created_at).toLocaleString('sv-SE')} />
                        <InfoItem icon={DollarSign} label="Totalt Ordervärde" value={formatCurrency(order.value)} />
                    </div>

                    {order.description && <InfoItem icon={FileText} label="Beskrivning" value={<p className="whitespace-pre-wrap">{order.description}</p>} />}

                    <div>
                        <h4 className="font-medium text-gray-800 mb-2">Orderrader</h4>
                        <div className="border rounded-md">
                            <table className="min-w-full divide-y">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produkt/Tjänst</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Antal</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pris</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Summa</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y">
                                  {/* Corrected to map over quote line items */}
                                  {order.quote?.quote_line_items?.map(item => (
                                      <tr key={item.id}>
                                          <td className="px-4 py-2 text-sm">{item.name || 'Ingen produkt'}</td>
                                          <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                                          <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                                          <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(item.quantity * (item.unit_price || 0))}</td>
                                      </tr>
                                  ))}
                              </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 mt-auto">
                    <button onClick={() => onOpenEdit(order)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"><Edit className="w-4 h-4 mr-2" />Redigera</button>
                    <button onClick={() => onOpenDelete(order)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"><Trash2 className="w-4 h-4 mr-2" />Ta bort</button>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) {
    return (
        <div className="flex items-start">
            <Icon className="w-5 h-5 mr-3 mt-1 text-gray-400 flex-shrink-0" />
            <div>
                <h4 className="font-medium text-gray-800">{label}</h4>
                <div className="text-gray-600">{value}</div>
            </div>
        </div>
    );
}

function OrderEditModal({ order, customers, users, teams, products, onClose, onSave }: {
    order: OrderWithRelations | null;
    customers: Customer[];
    users: UserProfile[];
    teams: TeamWithRelations[];
    products: ProductLibraryItem[];
    onClose: () => void;
    onSave: (data: any) => void;
  
}) {
    const [formData, setFormData] = useState({
        title: order?.title || '',
        customer_id: order?.customer_id || '',
        assigned_to_user_id: order?.assigned_to_user_id || '',
        status: order?.status || 'öppen_order',
        description: order?.description || '',
        assigned_to_team_id: order?.assigned_to_team_id || '',
    });
  
    const [lineItems, setLineItems] = useState(
        order?.order_line_items?.map(item => ({
            product_id: item.product_id || '', 
            quantity: item.quantity,
            unit_price: item.unit_price || 0,
            unit: item.unit || '',
            name: item.name,
            description: item.description,
        })) || [{ product_id: '', quantity: 1, unit_price: 0, name: '', description: '', unit: '' }]
    );

    const [notes] = useState(order?.notes || [{ content: '' }]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
  
    const handleLineItemChange = (index: number, field: string, value: any) => {
        const updated = [...lineItems];
        const currentItem = { ...updated[index], [field]: value };

        if (field === 'product_id') {
            const product = products.find(p => p.id === value);
            currentItem.unit_price = product?.unit_price || 0;
            currentItem.name = product?.name || '';
            currentItem.description = product?.description || '';
          currentItem.unit = product?.unit || '';
        }
        updated[index] = currentItem;
        setLineItems(updated);
    };
  
    const addLineItem = () => setLineItems([...lineItems, { product_id: '', quantity: 1, unit_price: 0, name: '', description: '', unit: '' }]);
    const removeLineItem = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));

    const totalValue = useMemo(() => 
        lineItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0),
    [lineItems]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            value: totalValue,
            line_items: lineItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                name: item.name,
                description: item.description,
            })),
            notes: notes.filter(n => n.content.trim() !== ''),
        });
    };

    const formatCurrency = (value: number) => `${value.toLocaleString('sv-SE')} SEK`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">{order ? 'Redigera Order' : 'Skapa Ny Order'}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Titel" required><input type="text" name="title" value={formData.title} onChange={handleFormChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></FormField>
                        <FormField label="Kund" required>
                            <select name="customer_id" value={formData.customer_id} onChange={handleFormChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                <option value="" disabled>Välj kund</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </FormField>
                       <FormField label="Ansvarig">
                          <div className="flex gap-2">
                            <select 
                              className="form-input flex-grow"
                              value={formData.assigned_to_user_id || ''}
                              onChange={(e) => {
                                handleFormChange(e);
                                // Clear team when user is selected
                                const event = { target: { name: 'assigned_to_team_id', value: '' } } as any;
                                handleFormChange(event);
                              }}
                              name="assigned_to_user_id"
                            >
                              <option value="">Välj Användare</option>
                              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                            </select>
                            <select 
                              className="form-input flex-grow"
                              value={formData.assigned_to_team_id || ''}
                              onChange={(e) => {
                                handleFormChange(e);
                                // Clear user when team is selected
                                const event = { target: { name: 'assigned_to_user_id', value: '' } } as any;
                                handleFormChange(event);
                              }}
                              name="assigned_to_team_id"
                            >
                              <option value="">Välj Team</option>
                              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                          </div>
                        </FormField>
                        <FormField label="Status">
                            <select name="status" value={formData.status} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <FormField label="Beskrivning"><textarea name="description" value={formData.description} onChange={handleFormChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></FormField>
                    <div>
                        <h4 className="font-medium text-gray-800 mb-2">Orderrader</h4>
                        <div className="space-y-2">
                            {lineItems.map((item, index) => (
                              <div key={index} className="grid grid-cols-12 gap-x-2 items-center">
                                  {/* Product/Service Dropdown */}
                                  <select 
                                      value={item.product_id} 
                                      onChange={e => handleLineItemChange(index, 'product_id', e.target.value)} 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 col-span-5"
                                  >
                                      <option value="" disabled>Välj produkt</option>
                                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                  </select>
                          
                                  {/* Quantity Input */}
                                  <input 
                                      type="number" 
                                      placeholder="Antal" 
                                      value={item.quantity} 
                                      onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 1)} 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 col-span-2 text-right" 
                                      step="0.1" 
                                  />
                                  
                                  {/* Unit Dropdown */}
                                  <select 
                                      value={item.unit} 
                                      onChange={(e) => handleLineItemChange(index, "unit", e.target.value)} 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 col-span-2"
                                  >
                                      {Object.entries(UNIT_DESCRIPTIONS).map(([value, label]) => (
                                          <option key={value} value={value}>{label}</option>
                                      ))}
                                  </select>
                          
                                  {/* Price Input */}
                                  <input 
                                      type="number" 
                                      placeholder="Pris" 
                                      value={item.unit_price} 
                                      onChange={e => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)} 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 col-span-2 text-right" 
                                      step="0.01" 
                                  />
                                  
                                  {/* Delete Button */}
                                  <div className="col-span-1 flex justify-center">
                                      <button 
                                          type="button" 
                                          onClick={() => removeLineItem(index)} 
                                          className="text-red-500 hover:text-red-700 p-1"
                                          title="Ta bort rad"
                                      >
                                          <Trash2 size={18} />
                                      </button>
                                  </div>
                              </div>
                          ))}
                        </div>
                        <button type="button" onClick={addLineItem} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"><Plus size={16} className="mr-1" /> Lägg till rad</button>
                        <div className="text-right font-bold text-lg mt-2">Totalt: {formatCurrency(totalValue)}</div>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 mt-auto">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Avbryt</button>
                    <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Spara Order</button>
                </div>
            </form>
        </div>
        </div>
    );
}

const FormField = ({ label, children, required = false }: { label: string, children: React.ReactNode, required?: boolean }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
        {children}
    </div>
);

function OrderStats({ stats }: { stats: { totalFilteredValue: number, totalAllTimeValue: number, totalLastMonthValue: number, totalLast6MonthsValue: number } }) {
  const formatCurrency = (value: number) => `${Math.round(value).toLocaleString('sv-SE')} SEK`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Totalt Värde (Filtrerat)" value={formatCurrency(stats.totalFilteredValue)} />
      <StatCard title="Senaste Månaden" value={formatCurrency(stats.totalLastMonthValue)} />
      <StatCard title="Senaste 6 Månaderna" value={formatCurrency(stats.totalLast6MonthsValue)} />
      <StatCard title="Totalt Värde (Alla)" value={formatCurrency(stats.totalAllTimeValue)} />
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default Ordermanagement