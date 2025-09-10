import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, X, Rss, Zap, Briefcase, Filter, User, Phone, Mail, MapPin, Edit, Trash2, Calendar, 
    MessageSquare, DollarSign, ChevronDown, CheckSquare, Square, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { 
    getLeads, createLead, updateLead, deleteLead, getSalesTasks, updateSalesTask,
    fetchRSSArticles, getAILeadSuggestions, createLeadFromArticle, getLeadScoreColor,
    type LeadWithRelations, type SalesTask, type RSSArticle, type AILeadSuggestion, 
    type LeadFilters
} from '../lib/leads';
import { getCustomers, getTeamMembers, formatDate } from '../lib/database';
import { supabase } from '../lib/supabase';
import type { Customer, UserProfile, LeadStatus } from '../types/database';

import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';
import ConfirmDialog from './ConfirmDialog';

const DEMO_ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

// ====== SUB-COMPONENTS ====== //

// --- Create/Edit Lead Modal ---
const LeadFormModal = ({ isOpen, onClose, onSave, leadToEdit }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    leadToEdit?: LeadWithRelations | null;
}) => {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const [formData, setFormData] = useState({
        title: '', description: '', source: '', status: 'new' as LeadStatus,
        estimated_value: '', customer_id: '', assigned_to_user_id: ''
    });
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: leadToEdit?.title || '',
                description: leadToEdit?.description || '',
                source: leadToEdit?.source || '',
                status: leadToEdit?.status || 'new',
                estimated_value: leadToEdit?.estimated_value?.toString() || '',
                customer_id: leadToEdit?.customer_id || '',
                assigned_to_user_id: leadToEdit?.assigned_to_user_id || user?.id || ''
            });

            const loadModalData = async () => {
                const [customersRes, membersRes] = await Promise.all([getCustomers(DEMO_ORG_ID), getTeamMembers(DEMO_ORG_ID)]);
                if (customersRes.data) setCustomers(customersRes.data);
                if (membersRes.data) setTeamMembers(membersRes.data);
            };
            loadModalData();
        }
    }, [isOpen, leadToEdit, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return showError('Fel', 'Du måste vara inloggad.');
        setLoading(true);

        const dataPayload = {
            organisation_id: DEMO_ORG_ID,
            title: formData.title,
            description: formData.description,
            source: formData.source,
            status: formData.status,
            estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
            customer_id: formData.customer_id || null,
            assigned_to_user_id: formData.assigned_to_user_id || null,
        };

        const result = leadToEdit
            ? await updateLead(leadToEdit.id, dataPayload)
            : await createLead(dataPayload as Omit<LeadWithRelations, 'id' | 'created_at'>);


        if (result.error) {
            showError('Fel', `Kunde inte spara lead: ${result.error.message}`);
        } else {
            success('Framgång', `Lead har ${leadToEdit ? 'uppdaterats' : 'skapats'}!`);
            onSave();
            onClose();
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800">{leadToEdit ? 'Redigera Lead' : 'Skapa Ny Förfrågan'}</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="T.ex. Takrengöring villa..."/>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label>
                           <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ange så mycket detaljer som möjligt..."/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Källa</label>
                                <input type="text" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="T.ex. Hemsidan, Rekommendation..."/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Uppskattat Värde (SEK)</label>
                                <input type="number" value={formData.estimated_value} onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="25000"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Befintlig Kund</label>
                                <select value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Välj kund (om befintlig)...</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tilldela till Säljare</label>
                                <select value={formData.assigned_to_user_id} onChange={(e) => setFormData({ ...formData, assigned_to_user_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Välj säljare...</option>
                                    {teamMembers.filter(tm => tm.role === 'sales' || tm.role === 'admin').map(tm => <option key={tm.id} value={tm.id}>{tm.full_name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all">Avbryt</button>
                        <button type="submit" disabled={loading} className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all">
                            {loading ? <LoadingSpinner size="sm" color="white" /> : (leadToEdit ? 'Spara Ändringar' : 'Skapa Lead')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ====== MAIN COMPONENT ====== //

const LeadManagement: React.FC = () => {
    const { user } = useAuth();
    const { success, error: showError } = useToast();

    const [leads, setLeads] = useState<LeadWithRelations[]>([]);
    const [salesTasks, setSalesTasks] = useState<SalesTask[]>([]);
    const [rssArticles, setRssArticles] = useState<RSSArticle[]>([]);
    const [selectedLead, setSelectedLead] = useState<LeadWithRelations | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leadToEdit, setLeadToEdit] = useState<LeadWithRelations | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [filters, setFilters] = useState<LeadFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState({ leads: true, tasks: true, rss: true, ai: false });
    const [aiSuggestions, setAiSuggestions] = useState<AILeadSuggestion[]>([]);

    useEffect(() => {
        if (!user) return;
        loadInitialData();

        const leadChannel = supabase.channel('public:leads')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => loadLeads())
            .subscribe();
        
        const taskChannel = supabase.channel('public:sales_tasks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_tasks' }, () => loadTasks(user.id))
            .subscribe();
        
        return () => {
            supabase.removeChannel(leadChannel);
            supabase.removeChannel(taskChannel);
        };
    }, [user, filters]);

    useEffect(() => {
        if (selectedLead) loadAISuggestions(selectedLead.id);
        else setAiSuggestions([]);
    }, [selectedLead]);
    
    useEffect(() => {
        // When filters change, refetch leads
        loadLeads();
    }, [filters]);

    const loadInitialData = () => {
        if (!user) return;
        loadLeads();
        loadTasks(user.id);
        loadRssFeed();
    };

    const loadLeads = async () => {
        setLoading(prev => ({ ...prev, leads: true }));
        const { data, error } = await getLeads(DEMO_ORG_ID, filters);
        if (error) showError('Fel', 'Kunde inte ladda leads.');
        else {
            setLeads(data || []);
            if (selectedLead) {
                const updatedSelected = (data || []).find(l => l.id === selectedLead.id);
                setSelectedLead(updatedSelected || null);
            }
        }
        setLoading(prev => ({ ...prev, leads: false }));
    };

    const loadTasks = async (userId: string) => {
        setLoading(prev => ({ ...prev, tasks: true }));
        const { data, error } = await getSalesTasks(userId);
        if (error) showError('Fel', 'Kunde inte ladda säljuppgifter.');
        else setSalesTasks(data || []);
        setLoading(prev => ({ ...prev, tasks: false }));
    };

    const loadRssFeed = async () => {
        setLoading(prev => ({ ...prev, rss: true }));
        const { data, error } = await fetchRSSArticles(DEMO_ORG_ID);
        if (error) showError('Fel', 'Kunde inte ladda RSS-flöde.');
        else setRssArticles(data || []);
        setLoading(prev => ({ ...prev, rss: false }));
    };
    
    const loadAISuggestions = async (leadId: string) => {
        setLoading(prev => ({ ...prev, ai: true }));
        const { data, error } = await getAILeadSuggestions(leadId);
        if (error) showError('Fel', 'Kunde inte hämta AI-förslag.');
        else setAiSuggestions(data || []);
        setLoading(prev => ({ ...prev, ai: false }));
    };

    const handleCreateLead = () => {
        setLeadToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditLead = (lead: LeadWithRelations) => {
        setLeadToEdit(lead);
        setIsModalOpen(true);
    };

    const handleDeleteLead = async () => {
        if (!selectedLead) return;
        const { error } = await deleteLead(selectedLead.id);
        if (error) {
            showError('Fel', 'Kunde inte ta bort lead.');
        } else {
            success('Framgång', 'Lead har tagits bort.');
            setSelectedLead(null);
        }
        setShowDeleteDialog(false);
    };
    
    const handleCreateFromArticle = async (article: RSSArticle) => {
        if (!user) return;
        const { error } = await createLeadFromArticle(article, DEMO_ORG_ID, user.id);
        if (error) showError('Fel', 'Kunde inte skapa lead från artikel.');
        else success('Framgång', 'Nytt lead har skapats från artikeln!');
    };

    const handleTaskToggle = async (task: SalesTask) => {
        const { error } = await updateSalesTask(task.id, { is_completed: !task.is_completed });
        if (error) showError('Fel', 'Kunde inte uppdatera uppgiften.');
    };

    return (
        <>
            <LeadFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={loadLeads} leadToEdit={leadToEdit} />
            <ConfirmDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={handleDeleteLead} title="Ta bort Lead" message={`Är du säker på att du vill ta bort "${selectedLead?.title}"?`} type="danger"/>

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center"><Briefcase className="w-8 h-8 mr-3 text-primary-600"/>Förfrågningar</h1>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"><Filter className="w-4 h-4 mr-2"/>Filter</button>
                        <button onClick={handleCreateLead} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all"><Plus className="w-4 h-4 mr-2"/>Skapa Förfrågan</button>
                    </div>
                </div>

                {showFilters && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           <input type="text" placeholder="Sök på titel..." onChange={e => setFilters({...filters, search: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                           <select onChange={e => setFilters({...filters, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="all">Alla Statusar</option>
                                <option value="new">Ny</option>
                                <option value="contacted">Kontaktad</option>
                                <option value="qualified">Kvalificerad</option>
                                <option value="won">Vunnen</option>
                                <option value="lost">Förlorad</option>
                            </select>
                            <input type="number" placeholder="Minsta lead score..." onChange={e => setFilters({...filters, minScore: parseInt(e.target.value) || undefined})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                            <button onClick={() => setFilters({})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Återställ</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 lg:col-span-1 xl:col-span-1 flex flex-col">
                        <h2 className="text-xl font-semibold mb-4 px-2">Förfrågningar ({leads.length})</h2>
                        {loading.leads ? <LoadingSpinner /> : (
                            <div className="space-y-2 overflow-y-auto pr-2">
                               {leads.map(lead => (
                                   <div key={lead.id} onClick={() => setSelectedLead(lead)} className={`p-3 border-l-4 rounded-r-lg cursor-pointer transition-all ${selectedLead?.id === lead.id ? 'bg-blue-50 border-blue-500 shadow-md' : 'border-transparent hover:bg-gray-50 hover:border-gray-300'}`}>
                                       <div className="flex justify-between items-start">
                                           <p className="font-semibold text-gray-800">{lead.title}</p>
                                           <span className={`text-xs font-bold flex items-center px-2 py-0.5 rounded-full ${getLeadScoreColor(lead.lead_score || 0)}`}>
                                               <Zap className="w-3 h-3 mr-1"/>{lead.lead_score || 'N/A'}
                                           </span>
                                       </div>
                                       <p className="text-sm text-gray-500 capitalize">{lead.status} &bull; {lead.estimated_value ? `${lead.estimated_value.toLocaleString('sv-SE')} SEK` : 'Okänt värde'}</p>
                                   </div>
                               ))}
                            </div>
                        )}
                    </div>

                    <div className="xl:col-span-2 lg:col-span-2 space-y-6 overflow-y-auto pr-2">
                        {selectedLead ? (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedLead.title}</h2>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEditLead(selectedLead)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><Edit className="w-5 h-5"/></button>
                                        <button onClick={() => setShowDeleteDialog(true)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"><Trash2 className="w-5 h-5"/></button>
                                    </div>
                                </div>
                                {selectedLead.customer && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-6 bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center"><User className="w-4 h-4 mr-2 text-gray-400"/> {selectedLead.customer.name}</div>
                                        <div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400"/> {selectedLead.customer.email || 'N/A'}</div>
                                        <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400"/> {selectedLead.customer.phone_number || 'N/A'}</div>
                                        <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400"/> {selectedLead.customer.city || 'N/A'}</div>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div><strong className="font-semibold text-gray-600">Beskrivning:</strong> <p className="text-gray-800 mt-1">{selectedLead.description || 'Ingen beskrivning.'}</p></div>
                                    <div><strong className="font-semibold text-gray-600">Senaste aktivitet:</strong> <p className="text-gray-800 mt-1">{formatDate(selectedLead.last_activity_at || selectedLead.created_at || '')}</p></div>
                                </div>
                                <div className="border-t pt-4 mt-6">
                                    <h3 className="text-lg font-semibold mb-2 flex items-center"><Zap className="w-5 h-5 mr-2 text-purple-500" /> AI-Assistent: Nästa Steg</h3>
                                    {loading.ai ? <LoadingSpinner /> : (aiSuggestions.length > 0 ? aiSuggestions.map(suggestion => (
                                        <div key={suggestion.title} className="p-3 bg-purple-50 text-purple-800 rounded-lg text-sm mb-2 border border-purple-100">
                                            <p><strong>{suggestion.title}</strong> <span className="text-xs opacity-70">({suggestion.priority})</span></p>
                                            <p className="text-xs">{suggestion.reasoning}</p>
                                        </div>
                                    )) : <p className="text-sm text-gray-500">Inga specifika förslag just nu.</p>)}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                                <Briefcase className="w-16 h-16 text-gray-300 mb-4"/>
                                <h3 className="text-xl font-semibold text-gray-700">Välj ett lead</h3>
                                <p className="text-gray-500 mt-1">Välj ett lead från listan till vänster för att se detaljer och AI-förslag.</p>
                            </div>
                        )}
                    </div>

                    <div className="hidden xl:block space-y-6 overflow-y-auto pr-2">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                           <h3 className="text-lg font-semibold mb-3 flex items-center"><Rss className="w-5 h-5 mr-2 text-orange-500"/>Nya Affärsmöjligheter</h3>
                           {loading.rss ? <LoadingSpinner/> : (
                               <div className="space-y-3">
                                   {rssArticles.slice(0, 5).map(item => (
                                       <div key={item.link} className="p-2 border-l-4 border-orange-200 hover:bg-orange-50 transition-colors">
                                           <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm hover:underline text-gray-800">{item.title}</a>
                                           <button onClick={() => handleCreateFromArticle(item)} className="text-xs text-primary-600 hover:underline mt-1 font-semibold">Skapa lead av detta &rarr;</button>
                                       </div>
                                   ))}
                               </div>
                           )}
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                           <h3 className="text-lg font-semibold mb-3 flex items-center"><CheckSquare className="w-5 h-5 mr-2 text-green-500"/>Mina Uppgifter</h3>
                           {loading.tasks ? <LoadingSpinner/> : (
                               <div className="space-y-2">
                                   {salesTasks.filter(t => !t.is_completed).slice(0, 5).map(task => (
                                       <div key={task.id} className="flex items-center group">
                                           <button onClick={() => handleTaskToggle(task)} className="p-1">
                                               <Square className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors"/>
                                           </button>
                                           <label className="ml-2 text-sm text-gray-700">{task.title}</label>
                                       </div>
                                   ))}
                                   {salesTasks.filter(t => !t.is_completed).length === 0 && <p className="text-sm text-gray-400 p-2">Inga aktiva uppgifter. Bra jobbat!</p>}
                               </div>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeadManagement;

