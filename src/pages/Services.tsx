import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  LayoutGrid, 
  Grid, 
  HelpCircle, 
  DollarSign, 
  Info, 
  Laptop, 
  ArrowUpRight,
  ShieldCheck,
  Check,
  Zap,
  Activity,
  Award,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  features: string | string[];
  pricing: string;
  featured_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

interface ServiceDetailData extends Service {
  packages: any[];
  faqs: any[];
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'hub' | 'grid'>('hub');
  
  // Cache for service sub-details (packages & faqs)
  const [serviceDetails, setServiceDetails] = useState<Record<number, ServiceDetailData>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'specs' | 'packages' | 'faqs'>('specs');

  // Fetch initial basic services
  useEffect(() => {
    const lastFetch = localStorage.getItem('services_list_last_fetch');
    const now = Date.now();
    
    // Use cached values if fetched within the last 5 minutes (300000ms), avoiding redundant API calls
    if (lastFetch && now - parseInt(lastFetch) < 300000) {
      const cachedServicesStr = localStorage.getItem('services_list_cache');
      if (cachedServicesStr) {
        try {
          const cachedServices = JSON.parse(cachedServicesStr);
          if (Array.isArray(cachedServices) && cachedServices.length > 0) {
            setServices(cachedServices);
            setSelectedService(cachedServices[0]);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached services");
        }
      }
    }

    fetch('/api/services')
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
          localStorage.setItem('services_list_cache', JSON.stringify(data));
          localStorage.setItem('services_list_last_fetch', now.toString());
          if (data.length > 0) {
            setSelectedService(data[0]);
          }
        }
      })
      .catch(err => console.warn("Fetch services list warning:", err.message));
  }, []);

  // Lazy-fetch full service details (packages & faqs) for selected service with 5min cache TTL
  useEffect(() => {
    if (!selectedService) return;
    const sId = selectedService.id;

    // Return if already cached dynamically in react state
    if (serviceDetails[sId]) {
      const cached = serviceDetails[sId];
      if (cached && (!cached.packages || cached.packages.length === 0) && activeTab === 'packages') {
        setActiveTab('specs');
      }
      return;
    }

    const now = Date.now();
    const CACHE_TTL = 300000; // 5 minutes cache TTL

    // Direct check of localized cache on disk first
    const lastFetchStr = localStorage.getItem(`service_detail_last_fetch_${sId}`);
    if (lastFetchStr && now - parseInt(lastFetchStr) < CACHE_TTL) {
      const cachedDetailsStr = localStorage.getItem(`service_detail_cache_${sId}`);
      if (cachedDetailsStr) {
        try {
          const cachedData = JSON.parse(cachedDetailsStr);
          if (cachedData && cachedData.id) {
            setServiceDetails(prev => ({ ...prev, [sId]: cachedData }));
            if ((!cachedData.packages || cachedData.packages.length === 0) && activeTab === 'packages') {
              setActiveTab('specs');
            }
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached details for service", sId);
        }
      }
    }

    if (loadingDetails[sId]) return;

    setLoadingDetails(prev => ({ ...prev, [sId]: true }));

    fetch(`/api/services/${selectedService.slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (data && data.id) {
          setServiceDetails(prev => ({ ...prev, [sId]: data }));
          localStorage.setItem(`service_detail_cache_${sId}`, JSON.stringify(data));
          localStorage.setItem(`service_detail_last_fetch_${sId}`, now.toString());
          // If no packages available, reset tab to specs
          if ((!data.packages || data.packages.length === 0) && activeTab === 'packages') {
            setActiveTab('specs');
          }
        }
      })
      .catch(err => {
        console.error("Failed to load nested packages/FAQs", err);
      })
      .finally(() => {
        setLoadingDetails(prev => ({ ...prev, [sId]: false }));
      });
  }, [selectedService, serviceDetails, loadingDetails, activeTab]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Maintain tab selection or default to specs if the service has no loaded packages yet
    const cached = serviceDetails[service.id];
    if (cached && (!cached.packages || cached.packages.length === 0) && activeTab === 'packages') {
      setActiveTab('specs');
    }
  };

  const getSubDetails = (sId: number): ServiceDetailData | null => {
    return serviceDetails[sId] || null;
  };

  const parseFeatures = (featuresVal: string | string[] | null): string[] => {
    if (!featuresVal) return [];
    try {
      return typeof featuresVal === 'string' ? JSON.parse(featuresVal) : (featuresVal || []);
    } catch {
      return [];
    }
  };

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-20 relative overflow-hidden bg-dot-matrix">
      
      {/* Immersive background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] -z-10 animate-pulse-slow" />
      <div className="absolute top-2/3 right-1/4 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 animate-pulse-medium" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Top Header & Visual Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/15 text-blue-400 text-[10px] uppercase font-mono tracking-widest rounded-full">
              <Sparkles size={11} className="text-blue-400 animate-pulse" /> Agency Competence Index
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-none">
              Services & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Tactical Offerings</span>
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed max-w-xl">
              From pixel-perfect interactive application design to custom full-stack solutions. Explore our offerings using our cinematic Hub, or swap to the catalog grid.
            </p>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center bg-neutral-900/80 border border-white/5 p-1 rounded-xl self-start md:self-auto shrink-0 shadow-lg">
            <button
              onClick={() => setViewMode('hub')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium font-mono uppercase tracking-wider rounded-lg transition-all duration-300 ${
                viewMode === 'hub'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid size={13} />
              Interactive Hub
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium font-mono uppercase tracking-wider rounded-lg transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Grid size={13} />
              Catalog Grid
            </button>
          </div>
        </div>

        {/* View Mode content */}
        <AnimatePresence mode="wait">
          {viewMode === 'hub' ? (
            
            /* INTERACTIVE HUB SPLIT VIEW */
            <motion.div
              key="hub-layout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[600px]"
            >
              {/* Left Panel: Services Menu Bar (cols 4) */}
              <div className="lg:col-span-4 bg-neutral-900/20 border border-white/5 rounded-2xl p-4 space-y-2 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto">
                <div className="px-3 py-2 pb-4 mb-2 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-bold">Select Active Wing</span>
                  <span className="text-xs bg-neutral-800 text-neutral-400 px-2.5 py-0.5 rounded-full font-mono">{services.length} Total</span>
                </div>

                <div className="space-y-1.5">
                  {services.map((item, idx) => {
                    const isActive = selectedService?.id === item.id;
                    const isLoaded = !!serviceDetails[item.id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleServiceSelect(item)}
                        className={`w-full text-left p-4 rounded-xl flex items-center justify-between transition-all duration-300 border group ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-950/40 to-neutral-900/60 border-blue-500/40 text-white shadow-xl shadow-blue-950/20'
                            : 'bg-transparent border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Index numbering */}
                          <span className={`text-[10px] font-mono tracking-widest font-bold ${isActive ? 'text-blue-400' : 'text-neutral-500'}`}>
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="text-sm font-bold tracking-tight text-left leading-tight">
                            {item.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                          {isLoaded && (
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Pricing loaded" />
                          )}
                          <ArrowRight 
                            size={14} 
                            className={`transform transition-transform duration-300 ${
                              isActive ? 'translate-x-0 opacity-100 text-blue-400' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 text-neutral-500'
                            }`} 
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {services.length === 0 && (
                  <div className="text-center py-12 text-neutral-500 text-xs font-mono">
                    No services found. Add active offerings inside the Administrator panel.
                  </div>
                )}
              </div>

              {/* Right Panel: Immersive Dynamic Deck (cols 8) */}
              <div className="lg:col-span-8 space-y-6">
                {selectedService ? (
                  <motion.div
                    key={selectedService.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-neutral-900/20 border border-white/5 rounded-2xl overflow-hidden shadow-2xl glass-panel relative"
                  >
                    {/* Upper cover visual screen */}
                    <div className="aspect-[21/9] w-full relative border-b border-white/5 overflow-hidden bg-neutral-900">
                      <img 
                        src={selectedService.featured_image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200'} 
                        alt={selectedService.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover brightness-75"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                      
                      <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-blue-400">Featured Service Deck</span>
                          <h2 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-white">{selectedService.title}</h2>
                        </div>
                        <div className="px-4 py-1.5 bg-neutral-950/80 backdrop-blur-md rounded-full text-xs font-mono font-bold border border-white/10 text-emerald-400 whitespace-nowrap self-start sm:self-auto">
                          Estimated {selectedService.pricing || 'Custom Hourly'}
                        </div>
                      </div>
                    </div>

                    {/* Navigation tabs inside detail card */}
                    <div className="border-b border-white/5 bg-neutral-950/50 px-6 py-2 flex items-center gap-4 overflow-x-auto min-h-[46px]">
                      <button
                        onClick={() => setActiveTab('specs')}
                        className={`py-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                          activeTab === 'specs'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Info size={12} />
                        Core Deliverables
                      </button>

                      <AnimatePresence mode="wait">
                        {loadingDetails[selectedService.id] ? (
                          <motion.div
                            key="pkg-loading"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 0.5, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ duration: 0.25 }}
                            className="py-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 whitespace-nowrap flex items-center gap-1.5 shrink-0 animate-pulse select-none"
                          >
                            <DollarSign size={12} className="animate-spin text-blue-500/60" />
                            Pricing Brackets (...)
                          </motion.div>
                        ) : getSubDetails(selectedService.id)?.packages && getSubDetails(selectedService.id)!.packages.length > 0 ? (
                          <motion.button
                            key="pkg-tab"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setActiveTab('packages')}
                            className={`py-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                              activeTab === 'packages'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-neutral-400 hover:text-white'
                            }`}
                          >
                            <DollarSign size={12} />
                            Pricing Brackets ({getSubDetails(selectedService.id)!.packages.length})
                          </motion.button>
                        ) : null}
                      </AnimatePresence>

                      <AnimatePresence mode="wait">
                        {loadingDetails[selectedService.id] ? (
                          <motion.div
                            key="faq-loading"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 0.5, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ duration: 0.25 }}
                            className="py-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 whitespace-nowrap flex items-center gap-1.5 shrink-0 animate-pulse select-none"
                          >
                            <HelpCircle size={12} className="text-blue-500/60" />
                            Faq Index (...)
                          </motion.div>
                        ) : getSubDetails(selectedService.id)?.faqs && getSubDetails(selectedService.id)!.faqs.length > 0 ? (
                          <motion.button
                            key="faq-tab"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setActiveTab('faqs')}
                            className={`py-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                              activeTab === 'faqs'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-neutral-400 hover:text-white'
                            }`}
                          >
                            <HelpCircle size={12} />
                            Faq Index ({getSubDetails(selectedService.id)!.faqs.length})
                          </motion.button>
                        ) : null}
                      </AnimatePresence>
                    </div>

                    {/* Tab contents panel */}
                    <div className="p-8">
                      <AnimatePresence mode="wait">
                        {activeTab === 'specs' && (
                          <motion.div
                            key="tab-specs"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            <div className="space-y-2">
                              <h3 className="text-[10px] font-bold font-mono text-neutral-500 uppercase tracking-widest">Scope Overview</h3>
                              <p className="text-neutral-300 text-sm font-light leading-relaxed">
                                {selectedService.description}
                              </p>
                            </div>

                            {/* Features list */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                              <h4 className="text-[10px] font-bold font-mono text-neutral-500 uppercase tracking-widest">Typical Execution Milestones</h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {parseFeatures(selectedService.features).map((feat, i) => (
                                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                                      <Check size={11} className="stroke-[3]" />
                                    </div>
                                    <span className="text-xs text-neutral-200 mt-0.5 leading-tight font-mono">{feat}</span>
                                  </div>
                                ))}

                                {parseFeatures(selectedService.features).length === 0 && (
                                  <div className="col-span-2 text-xs text-neutral-500 font-mono italic">
                                    Custom milestones are tailored for each individual engagement schedule.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Premium reassurance badges */}
                            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/5">
                              <div className="flex flex-col items-center text-center p-3.5 bg-neutral-950/40 border border-white/5 rounded-xl">
                                <ShieldCheck size={18} className="text-blue-400 mb-1" />
                                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-white">Full IP Protection</span>
                              </div>
                              <div className="flex flex-col items-center text-center p-3.5 bg-neutral-950/40 border border-white/5 rounded-xl">
                                <Zap size={18} className="text-amber-400 mb-1" />
                                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-white">Continuous Feedback</span>
                              </div>
                              <div className="flex flex-col items-center text-center p-3.5 bg-neutral-950/40 border border-white/5 rounded-xl">
                                <Activity size={18} className="text-emerald-400 mb-1" />
                                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-white">Enterprise Ready</span>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'packages' && (
                          <motion.div
                            key="tab-packages"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            {loadingDetails[selectedService.id] ? (
                              <div className="py-12 flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-blue-500/10 border-t-blue-400 animate-spin" />
                                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Resolving packages from database...</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getSubDetails(selectedService.id)?.packages?.map((pkg) => {
                                  const isPopular = pkg.badge && (pkg.badge.toLowerCase().includes('popular') || pkg.badge.toLowerCase().includes('best value'));
                                  return (
                                    <div 
                                      key={pkg.id}
                                      className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all duration-300 relative ${
                                        isPopular
                                          ? 'border-blue-500/30 bg-blue-500/5 shadow-lg shadow-blue-500/5'
                                          : 'border-white/5 bg-white/5'
                                      }`}
                                    >
                                      {pkg.badge && (
                                        <span className={`absolute -top-2.5 left-4 px-2.5 py-0.5 text-[8px] font-bold font-mono uppercase tracking-widest rounded-full ${
                                          isPopular ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 border border-white/5'
                                        }`}>
                                          {pkg.badge}
                                        </span>
                                      )}

                                      <div className="space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                          <h4 className="text-sm font-bold text-white font-mono tracking-tight">{pkg.name}</h4>
                                          <div className="text-right">
                                            <span className="text-base font-extrabold text-blue-400 font-mono">{pkg.price}</span>
                                          </div>
                                        </div>
                                        <p className="text-[11px] text-neutral-400 leading-relaxed font-light">{pkg.description}</p>
                                      </div>

                                      {/* Sub-features checklist */}
                                      {pkg.features && pkg.features.length > 0 && (
                                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                                          <p className="text-[8px] font-bold tracking-wider font-mono uppercase text-neutral-500">Tier Inclusions</p>
                                          <ul className="grid grid-cols-1 gap-1">
                                            {pkg.features.map((feat: string, i: number) => (
                                              <li key={i} className="flex items-center gap-1.5 text-[10px] text-neutral-300">
                                                <Check size={10} className="text-blue-400 shrink-0" />
                                                <span className="truncate leading-tight font-mono">{feat}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      <Link
                                        to={`/contact?service=${encodeURIComponent(selectedService.title)}&package=${encodeURIComponent(pkg.name)}`}
                                        className={`w-full py-2 text-center rounded-lg text-[9px] font-mono tracking-widest uppercase font-bold transition-all ${
                                          isPopular 
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/10' 
                                            : 'bg-white/5 hover:bg-white/10 text-neutral-200'
                                        }`}
                                      >
                                        Inquire Bracket
                                      </Link>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        )}

                        {activeTab === 'faqs' && (
                          <motion.div
                            key="tab-faqs"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                          >
                            {loadingDetails[selectedService.id] ? (
                              <div className="py-12 flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-blue-500/10 border-t-blue-400 animate-spin" />
                                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Retrieving active FAQs...</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-3">
                                {getSubDetails(selectedService.id)?.faqs?.map((faq, i) => (
                                  <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1.5">
                                    <h5 className="font-bold text-white text-xs font-mono tracking-tight flex items-center gap-2">
                                      <HelpCircle size={12} className="text-blue-400 shrink-0" />
                                      {faq.question}
                                    </h5>
                                    <p className="text-[11px] text-neutral-400 leading-relaxed font-light pl-5">{faq.answer}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Bottom CTA Deck footer */}
                    <div className="p-6 bg-neutral-950/70 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-xs text-white uppercase font-mono tracking-wider font-bold">Have a Custom Project Brief?</p>
                        <p className="text-[10px] text-neutral-400 max-w-sm font-light mt-0.5 leading-tight">
                          We accommodate hyper-scale specifications, specialized deliverables, or unique legal frameworks easily.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link 
                          to={`/services/${selectedService.slug}`}
                          className="px-4 py-2 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white text-[10px] font-bold font-mono tracking-wider uppercase rounded-lg transition-colors flex items-center gap-1"
                        >
                          Deep Dive FAQ <ArrowUpRight size={12} />
                        </Link>
                        <Link 
                          to={`/contact?service=${encodeURIComponent(selectedService.title)}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold font-mono tracking-wider uppercase rounded-lg transition-all shadow-md active:scale-95"
                        >
                          Book Briefing
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl bg-neutral-900/15">
                    <span className="text-xs text-neutral-500 font-mono">No active service selected. Select from the sidebar on the left.</span>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            
            /* CINEMATIC GRID BENTO VIEW */
            <motion.div
              key="grid-layout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {services.map((item, idx) => {
                const subDetail = getSubDetails(item.id);
                const featuresList = parseFeatures(item.features);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05, duration: 0.5 }}
                    className="p-8 bg-neutral-900/40 border border-white/5 rounded-2xl flex flex-col justify-between space-y-8 hover:border-white/10 transition-colors duration-300 relative group overflow-hidden"
                  >
                    {/* Glass backdrop glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] transform translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-125" />

                    <div className="space-y-6">
                      {/* Image frame */}
                      <div className="aspect-[18/10] w-full rounded-xl overflow-hidden relative border border-white/5">
                        <img 
                          src={item.featured_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600'} 
                          alt={item.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 brightness-90 group-hover:brightness-100" 
                        />
                        
                        {/* Cost/badge floating card */}
                        <div className="absolute top-3 left-3 px-3 py-1 bg-neutral-950/90 backdrop-blur-md rounded-full text-[10px] font-mono font-bold text-blue-400 border border-white/5">
                          {item.pricing || 'Custom Calculation'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-500 font-bold">Offer ID: {(idx + 1).toString().padStart(2, '0')}</span>
                        <h2 className="text-2xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">{item.title}</h2>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-light line-clamp-3">{item.description}</p>
                      </div>

                      {/* Execution items checklist subset */}
                      {featuresList.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-white/5">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 font-mono">Specialized Deliverables</p>
                          <div className="grid grid-cols-2 gap-2">
                            {featuresList.slice(0, 4).map((feat: string, i: number) => (
                              <div key={i} className="flex items-center text-[11px] text-neutral-300 gap-2 font-mono truncate">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="truncate">{feat}</span>
                              </div>
                            ))}
                            {featuresList.length > 4 && (
                              <div className="flex items-center text-[10px] text-blue-400 gap-1.5 font-mono">
                                <span>+ {featuresList.length - 4} more items</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                      <Link 
                        to={`/services/${item.slug}`} 
                        className="flex-1 text-center py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 border border-white/5"
                      >
                        Deep Dive Detail
                      </Link>
                      <Link 
                        to={`/contact?service=${encodeURIComponent(item.title)}`}
                        className="flex-1 text-center py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 font-mono text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg shadow-white/5 flex items-center justify-center gap-1.5"
                      >
                        Book brief <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}

              {services.length === 0 && (
                <div className="col-span-2 text-center py-24 text-neutral-500 border border-dashed border-white/10 rounded-2xl bg-neutral-900/10">
                  No services found. Add active offerings inside the secure Admin services portal.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global bottom trust panel */}
        <div className="bg-neutral-900/10 border border-white/5 rounded-2xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5 -z-10" />
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">Need a Fully Custom Project Scope?</h3>
            <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed">
              If your enterprise requires non-disclosure agreements (NDAs), strict target architectures, or collaborative sprints on dedicated Slack/Teams channels, we configure custom schedules.
            </p>
            <div className="pt-4">
              <Link
                to="/contact"
                className="px-6 py-3 bg-white text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-all font-mono inline-flex items-center gap-2 active:scale-95 duration-300 shadow-xl shadow-white/5"
              >
                Inquire Tailored Scope <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
