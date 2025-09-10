import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';  

const LandingPage = () => {
  const navigate = useNavigate(); // <-- ADD THIS LINE
  const [leads, setLeads] = useState(50);
  const [conversion, setConversion] = useState(15);
  const [orderValue, setOrderValue] = useState(25000);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);

  // ROI Calculator logic
  const currentRevenue = leads * (conversion / 100) * orderValue;
  const newConversion = Math.min(conversion * 1.5, 100);
  const newRevenue = leads * (newConversion / 100) * orderValue;
  const increase = newRevenue - currentRevenue;

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.animation = 'bounceGentle 0.6s ease-in-out';
};

const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  const button = e.currentTarget;
  const listener = () => {
    if (button) { // <-- This check prevents the error
      button.style.animation = '';
    }
  };

  button.addEventListener('animationend', listener, { once: true });
};

  // Scroll progress and navbar effects
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setScrollProgress(scrolled);
      setIsNavbarScrolled(window.scrollY > 50);

      const parallaxElements = document.querySelectorAll('.parallax');
        parallaxElements.forEach((element, index) => {
            const speed = 0.3 + (index * 0.05); // Adjust speed factor as you like
            (element as HTMLElement).style.transform = `translateY(${window.pageYOffset * speed}px)`;
        });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Counter animation
  const [counters, setCounters] = useState({
    customers: 0,
    increase: 0,
    uptime: 0,
    support: 0
  });

  const animateCounters = () => {
    const targets = { customers: 1000, increase: 50, uptime: 99, support: 24 };
    const duration = 2000;
    
    Object.keys(targets).forEach(key => {
      const target = targets[key];
      const step = target / (duration / 16);
      let current = 0;
      
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          setCounters(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, 16);
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target.id === 'testimonials') {
            animateCounters();
          }
        });
      },
      { threshold: 0.1 }
    );

    const testimonialsSection = document.getElementById('testimonials');
    if (testimonialsSection) {
      observer.observe(testimonialsSection);
    }

    return () => observer.disconnect();
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const button = e.target.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.innerHTML = '✅ Tack! Vi kontaktar dig inom 24h';
    button.disabled = true;
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
      e.target.reset();
    }, 3000);
  };

const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div 
        className="scroll-indicator" 
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isNavbarScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <span className={`text-2xl font-bold ${
                isNavbarScrolled ? 'text-gray-900' : 'text-white'
              }`} style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
                Momentum
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features"
                onClick={(e) => scrollToSection(e,'features')}
                className={`transition-colors ${
                  isNavbarScrolled 
                    ? 'text-gray-900 hover:text-gray-900' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                Funktioner
              </a>
              <a href="#benefits"
                onClick={(e) => scrollToSection(e,'benefits')}
                className={`transition-colors ${
                  isNavbarScrolled 
                    ? 'text-gray-900 hover:text-gray-900' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                Fördelar
              </a>
              <a href="#pricing"
                onClick={(e) => scrollToSection(e,'pricing')}
                className={`transition-colors ${
                  isNavbarScrolled 
                    ? 'text-gray-900 hover:text-gray-900' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                Priser
              </a>
              <a href="#testimonials"
                onClick={(e) => scrollToSection(e,'testimonials')}
                className={`transition-colors ${
                  isNavbarScrolled 
                    ? 'text-gray-900 hover:text-gray-900' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                Kunder
              </a>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                className={`hidden sm:inline-flex items-center px-4 py-2 border rounded-full transition-colors ${
                  isNavbarScrolled
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                onClick={() => navigate('/login')} // <-- ADD THIS LINE
              >
                Logga in
              </button>
              <button className={`px-6 py-2 rounded-full font-semibold transition-all hover:scale-105 shadow-lg ${
                isNavbarScrolled 
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              }`}     onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                Starta gratis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 gradient-bg"></div>
        
        {/* Floating Elements */}
<div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float parallax" style={{animationDelay: '0s'}}></div>
    <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-float parallax" style={{animationDelay: '2s'}}></div>
    <div className="absolute bottom-40 left-20 w-12 h-12 bg-white/10 rounded-full animate-float parallax" style={{animationDelay: '4s'}}></div>
    <div className="absolute bottom-20 right-40 w-24 h-24 bg-white/10 rounded-full animate-float parallax" style={{animationDelay: '1s'}}></div>
</div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {/* Change the className on this span from "block" to "inline-block" */}
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse-glow">
                  Revolutionera din
                  <br />
                  försäljning
                med Momentum CRM
                  </span>
              </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Det första CRM-systemet designat specifikt för svenska småföretag. 
              Öka din försäljning med 50% och automatisera dina processer.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="group bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl hover:shadow-white/25 animate-pulse-glow"
                    onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                <span className="flex items-center">
                   Starta gratis provperiod
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </span>
              </button>
              <button className="group border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all hover:scale-105"
                    onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                <span className="flex items-center">
                  📅 Boka demo
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </span>
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="glass-effect rounded-2xl p-6 max-w-4xl mx-auto">
              <p className="text-white/80 text-sm mb-4">Över 1000+ svenska företag litar på Momentum</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
                <div className="text-white font-semibold">ACME AB</div>
                <div className="text-white font-semibold">TechCorp</div>
                <div className="text-white font-semibold">Nordic Solutions</div>
                <div className="text-white font-semibold">Svenska Företag AB</div>
                <div className="text-white font-semibold">Innovation Group</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
              Kraftfulla funktioner för
              <span className="text-gradient"> moderna företag</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Allt du behöver för att hantera leads, kunder och försäljning på ett ställe
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Lead Management */}
            <div className="feature-card rounded-3xl p-8 hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>Lead Management</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Fånga, organisera och konvertera leads automatiskt. Intelligent lead-scoring och automatisk uppföljning.
              </p>
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-blue-800 font-semibold">✨ Nyhet: AI-driven lead-prioritering</div>
              </div>
              <button className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition-all"
                    onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                Läs mer
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
            
            {/* Sales Pipeline */}
            <div className="feature-card rounded-3xl p-8 hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>Sales Pipeline</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Visualisera din försäljningsprocess med Kanban-boards. Dra och släpp affärer mellan stadier.
              </p>
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-purple-800 font-semibold">📊 Genomsnittlig ökning: 35% snabbare deals</div>
              </div>
              <button className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 group-hover:translate-x-2 transition-all"
                    onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                Läs mer
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
            
            {/* Customer Insights */}
            <div className="feature-card rounded-3xl p-8 hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>Customer Insights</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Djupa kundinsikter och analytics. Förstå dina kunder bättre och öka kundnöjdheten.
              </p>
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-green-800 font-semibold">📈 Öka kundnöjdhet med 40%</div>
              </div>
              <button className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 group-hover:translate-x-2 transition-all"
                    onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                Läs mer
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* CRM Interface Preview */}
          <div className="mt-20 animate-scale-in">
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="ml-4 text-sm text-gray-600">momentum.se/dashboard</div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <div className="text-3xl font-bold text-blue-600 mb-2">247</div>
                      <div className="text-sm text-blue-800">Aktiva Leads</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6">
                      <div className="text-3xl font-bold text-green-600 mb-2">1.2M kr</div>
                      <div className="text-sm text-green-800">Pipeline Värde</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6">
                      <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
                      <div className="text-sm text-purple-800">Kundnöjdhet</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
                Från kaos till
                <span className="text-gradient"> kontroll</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Sluta förlora potentiella kunder i Excel-ark och e-postkedjor. 
                Momentum ger dig full kontroll över din försäljningsprocess.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold">❌</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Förut: Förlorade leads och missade möjligheter</h4>
                    <p className="text-gray-600">Leads försvinner i e-postkedjor, uppföljning glöms bort, ingen överblick över pipeline</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Nu: Automatiserad försäljningsmaskin</h4>
                    <p className="text-gray-600">Alla leads fångas, automatisk uppföljning, full pipeline-överblick, 50% högre konvertering</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                  <div className="text-3xl font-bold text-blue-600 mb-2">50%</div>
                  <div className="text-sm text-blue-800 font-medium">Ökning av försäljning</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">3x</div>
                  <div className="text-sm text-green-800 font-medium">Snabbare lead-hantering</div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Kundframgång: TechCorp AB</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Leads per månad</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500 line-through">45</span>
                      <span className="text-green-600 font-bold">127</span>
                      <span className="text-green-600 text-sm">+182%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Konverteringsgrad</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500 line-through">12%</span>
                      <span className="text-green-600 font-bold">28%</span>
                      <span className="text-green-600 text-sm">+133%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Månadsomsättning</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500 line-through">450k</span>
                      <span className="text-green-600 font-bold">890k</span>
                      <span className="text-green-600 text-sm">+98%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                  <p className="text-sm text-gray-700 italic">
                    "Momentum har revolutionerat vår försäljningsprocess. Vi har nästan fördubblat vår omsättning på 6 månader!"
                  </p>
                  <p className="text-sm text-gray-600 mt-2 font-semibold">- Anna Andersson, VD TechCorp AB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
              Över 1000+ svenska företag
              <span className="block text-yellow-400">litar på Momentum</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Från startups till etablerade företag - alla växer snabbare med Momentum
            </p>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{counters.customers}</div>
              <div className="text-white/80">Nöjda kunder</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">{counters.increase}</div>
              <div className="text-white/80">% ökning försäljning</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">{counters.uptime}</div>
              <div className="text-white/80">% uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">{counters.support}</div>
              <div className="text-white/80">Timmar support</div>
            </div>
          </div>
          
          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="testimonial-card rounded-2xl p-8 hover-lift">
              <div className="flex items-center mb-6">
                <img src="https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" alt="Maria Nilsson" className="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                  <div className="font-semibold text-gray-900">Maria Nilsson</div>
                  <div className="text-sm text-gray-600">VD, Nordic Solutions</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Momentum har gjort det möjligt för oss att skala vår försäljning utan att anställa fler säljare. ROI på 300% första året!"
              </p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
            
            <div className="testimonial-card rounded-2xl p-8 hover-lift">
              <div className="flex items-center mb-6">
                <img src="https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" alt="Erik Johansson" className="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                  <div className="font-semibold text-gray-900">Erik Johansson</div>
                  <div className="text-sm text-gray-600">Säljchef, Acme AB</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Fantastiskt system! Vi har minskat vår sales cycle med 40% och vårt team är mycket mer produktivt."
              </p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
            
            <div className="testimonial-card rounded-2xl p-8 hover-lift">
              <div className="flex items-center mb-6">
                <img src="https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" alt="Lisa Andersson" className="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                  <div className="font-semibold text-gray-900">Lisa Andersson</div>
                  <div className="text-sm text-gray-600">Grundare, StartupTech</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Som startup behövde vi ett system som växer med oss. Momentum är perfekt - enkelt att komma igång men kraftfullt nog för framtiden."
              </p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
              Transparent prissättning för
              <span className="text-gradient"> alla företagsstorlekar</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Börja gratis och skala upp när ditt företag växer. Inga dolda kostnader.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Starter Plan */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover-lift border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="text-5xl font-bold text-gray-900 mb-2">Gratis</div>
                <p className="text-gray-600">För små team upp till 3 användare</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Upp till 100 leads
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Grundläggande pipeline
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  E-postsupport
                </li>
              </ul>
              <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                    onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                Kom igång gratis
              </button>
            </div>
            
            {/* Professional Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl hover-lift transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">POPULÄRAST</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <div className="text-5xl font-bold text-white mb-2">
                  499 kr
                  <span className="text-lg font-normal text-white/80">/månad</span>
                </div>
                <p className="text-white/80">För växande företag upp till 10 användare</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Obegränsade leads
                </li>
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Avancerad analytics
                </li>
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Automatisering
                </li>
                <li className="flex items-center text-white">
                  <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Prioriterad support
                </li>
              </ul>
              <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors animate-pulse-glow"
                    onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                Starta 14 dagars gratis test
              </button>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover-lift border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-5xl font-bold text-gray-900 mb-2">Anpassad</div>
                <p className="text-gray-600">För stora organisationer 25+ användare</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Allt i Professional
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Anpassade integrationer
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Dedikerad success manager
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  SLA-garanti
                </li>
              </ul>
              <button className="w-full border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-900 hover:text-white transition-colors"
                    onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                Kontakta oss
              </button>
            </div>
          </div>
          
          {/* ROI Calculator Widget */}
          <div className="roi-calculator rounded-3xl p-8 text-white max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">🧮 Beräkna din ROI</h3>
              <p className="text-white/90">Se hur mycket Momentum kan öka din försäljning</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Antal leads per månad</label>
                <input 
                  type="number" 
                  value={leads} 
                  onChange={(e) => setLeads(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Nuvarande konverteringsgrad (%)</label>
                <input 
                  type="number" 
                  value={conversion} 
                  onChange={(e) => setConversion(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Genomsnittligt ordervärde (kr)</label>
                <input 
                  type="number" 
                  value={orderValue} 
                  onChange={(e) => setOrderValue(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white/60 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-white/20 rounded-2xl backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{currentRevenue.toLocaleString('sv-SE')} kr</div>
                  <div className="text-white/80 text-sm">Nuvarande månadsintäkt</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{newRevenue.toLocaleString('sv-SE')} kr</div>
                  <div className="text-white/80 text-sm">Med Momentum</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">+{increase.toLocaleString('sv-SE')} kr</div>
                  <div className="text-white/80 text-sm">Månadsökning</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full animate-float" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-purple-500/10 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-yellow-500/10 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
              Redo att revolutionera
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                din försäljning?
              </span>
            </h2>
            
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Gå med i över 1000+ svenska företag som redan ökat sin försäljning med Momentum CRM.
              Starta din gratis provperiod idag - ingen kreditkort krävs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-full font-bold text-xl hover:from-yellow-300 hover:to-orange-400 transition-all hover:scale-110 shadow-2xl animate-pulse-glow"
                    onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                <span className="flex items-center">
                   Starta gratis provperiod
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </span>
              </button>
              <button className="group border-2 border-white text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-gray-900 transition-all hover:scale-110"
                    onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                <span className="flex items-center">
                  📞 Boka personlig demo
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </span>
              </button>
            </div>
            
            {/* Trust Symbols */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/60">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <span className="text-sm">GDPR-kompatibel</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <span className="text-sm">SSL-krypterat</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-sm">Svenskt företag</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                <span className="text-sm">30 dagars pengarna tillbaka</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
              Få en personlig demo
            </h2>
            <p className="text-xl text-gray-600">
            Låt oss visa hur Momentum kan transformera ditt företag
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Namn *</label>
              <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-post *</label>
              <input type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Företag</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Berätta om ditt företag</label>
              <textarea rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Antal anställda, bransch, nuvarande utmaningar..."></textarea>
            </div>
            <div className="md:col-span-2 text-center">
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 shadow-2xl animate-pulse-glow"
                    onMouseEnter={handleButtonHover}
    onMouseLeave={handleButtonLeave}>
                📅 Boka min demo nu
              </button>
              <p className="text-sm text-gray-600 mt-4">
                Vi kontaktar dig inom 24 timmar för att boka en tid som passar dig
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <span className="text-2xl font-display font-bold">Momentum</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Det första CRM-systemet designat specifikt för svenska småföretag.
              Revolutionera din försäljning med AI-driven automation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="text-lg">📧</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="text-lg">📱</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="text-lg">💼</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Produkt</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')}className="hover:text-white transition-colors">Funktioner</a></li>
              <li><a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-white transition-colors">Priser</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrationer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Hjälpcenter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kontakta oss</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Momentum CRM AB. Alla rättigheter förbehållna.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Integritetspolicy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Användarvillkor</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  </>
);
}

export default LandingPage;