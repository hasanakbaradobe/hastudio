import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, HelpCircle, DollarSign, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ServicesAdmin() {
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // FAQ management state variables
  const [activeFaqService, setActiveFaqService] = useState<any | null>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [faqForm, setFaqForm] = useState({ id: null as number | null, question: '', answer: '' });
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [faqSuccessMessage, setFaqSuccessMessage] = useState<string | null>(null);
  const [faqErrorMessage, setFaqErrorMessage] = useState<string | null>(null);

  // Package/Tier management state variables
  const [activePackageService, setActivePackageService] = useState<any | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packageForm, setPackageForm] = useState({
    id: null as number | null,
    name: '',
    price: '',
    badge: '',
    description: '',
    featuresText: ''
  });
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageSuccessMessage, setPackageSuccessMessage] = useState<string | null>(null);
  const [packageErrorMessage, setPackageErrorMessage] = useState<string | null>(null);

  // Safe inline confirmation states (prevents iframe confirm block issue)
  const [pendingDeleteServiceId, setPendingDeleteServiceId] = useState<number | null>(null);
  const [pendingDeleteFaqId, setPendingDeleteFaqId] = useState<number | null>(null);
  const [pendingDeletePackageId, setPendingDeletePackageId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', pricing: ''
  });

  const fetchServices = () => {
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
        if (Array.isArray(data)) {
          setServices(data);
          // Invalidate public page local cache when admin fetches fresh data
          localStorage.removeItem('services_list_last_fetch');
          localStorage.removeItem('services_list_cache');
          // Purge all stale public service detail caches instantly from disk
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('service_detail_')) {
              localStorage.removeItem(key);
            }
          });
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchFaqs = (serviceId: number) => {
    setLoadingFaqs(true);
    setFaqSuccessMessage(null);
    setFaqErrorMessage(null);
    fetch(`/api/services/${serviceId}/faqs`)
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setFaqs(data);
      })
      .catch(err => {
        console.error(err);
        setFaqErrorMessage("Failed to fetch FAQs.");
      })
      .finally(() => {
        setLoadingFaqs(false);
      });
  };

  const handleOpenFaqs = (service: any) => {
    setActiveFaqService(service);
    setFaqs([]);
    setFaqForm({ id: null, question: '', answer: '' });
    setShowFaqForm(false);
    fetchFaqs(service.id);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFaqService) return;
    const token = localStorage.getItem('adminToken');
    const isEdit = faqForm.id !== null;
    const url = isEdit ? `/api/services/faqs/${faqForm.id}` : `/api/services/${activeFaqService.id}/faqs`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: faqForm.question, answer: faqForm.answer })
      });
      if (res.ok) {
        // Clear public detail caches
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('service_detail_')) {
            localStorage.removeItem(key);
          }
        });
        setFaqSuccessMessage(isEdit ? "FAQ updated successfully!" : "FAQ registered successfully!");
        setFaqForm({ id: null, question: '', answer: '' });
        setShowFaqForm(false);
        fetchFaqs(activeFaqService.id);
      } else {
        const errData = await res.json().catch(() => ({}));
        setFaqErrorMessage(errData.error || "Failed to commit FAQ.");
      }
    } catch (err) {
      setFaqErrorMessage("Network connection details faulted.");
    }
  };

  const handleDeleteFaq = async (faqId: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/services/faqs/${faqId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Clear public detail caches
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('service_detail_')) {
            localStorage.removeItem(key);
          }
        });
        setFaqSuccessMessage("FAQ item removed.");
        fetchFaqs(activeFaqService.id);
      } else {
        setFaqErrorMessage("Failed to delete FAQ.");
      }
    } catch (err) {
      setFaqErrorMessage("Network exception.");
    }
  };

  const handleEditFaqClick = (faq: any) => {
    setFaqForm({ id: faq.id, question: faq.question, answer: faq.answer });
    setShowFaqForm(true);
  };

  const fetchPackages = (serviceId: number, skipClearMessages = false) => {
    setLoadingPackages(true);
    if (!skipClearMessages) {
      setPackageSuccessMessage(null);
      setPackageErrorMessage(null);
    }
    fetch(`/api/services/${serviceId}/packages`)
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setPackages(data);
      })
      .catch(err => {
        console.error(err);
        setPackageErrorMessage("Failed to fetch pricing packages.");
      })
      .finally(() => {
        setLoadingPackages(false);
      });
  };

  const handleOpenPackages = (service: any) => {
    setActivePackageService(service);
    setPackages([]);
    setPackageForm({ id: null, name: '', price: '', badge: '', description: '', featuresText: '' });
    setShowPackageForm(false);
    fetchPackages(service.id);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePackageService) return;
    const token = localStorage.getItem('adminToken');
    const isEdit = packageForm.id !== null;
    const url = isEdit ? `/api/services/packages/${packageForm.id}` : `/api/services/${activePackageService.id}/packages`;
    const method = isEdit ? 'PUT' : 'POST';

    setPackageSuccessMessage(null);
    setPackageErrorMessage(null);

    // Split features list lines and clean empty lines
    const featuresList = packageForm.featuresText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: packageForm.name,
          price: packageForm.price,
          badge: packageForm.badge,
          description: packageForm.description,
          features: featuresList
        })
      });
      if (res.ok) {
        // Clear public detail caches
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('service_detail_')) {
            localStorage.removeItem(key);
          }
        });
        setPackageSuccessMessage(isEdit ? "Pricing package updated successfully!" : "Pricing package registered successfully!");
        setPackageForm({ id: null, name: '', price: '', badge: '', description: '', featuresText: '' });
        setShowPackageForm(false);
        fetchPackages(activePackageService.id, true);
      } else {
        const errData = await res.json().catch(() => ({}));
        setPackageErrorMessage(errData.error || "Failed to commit pricing package.");
      }
    } catch (err) {
      setPackageErrorMessage("Network connection details faulted.");
    }
  };

  const handleDeletePackage = async (packageId: number) => {
    const token = localStorage.getItem('adminToken');
    setPackageSuccessMessage(null);
    setPackageErrorMessage(null);
    try {
      const res = await fetch(`/api/services/packages/${packageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Clear public detail caches
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('service_detail_')) {
            localStorage.removeItem(key);
          }
        });
        setPackageSuccessMessage("Pricing package has been removed.");
        fetchPackages(activePackageService.id, true);
      } else {
        const errData = await res.json().catch(() => ({}));
        setPackageErrorMessage(errData.error || "Failed to delete pricing package.");
      }
    } catch (err) {
      setPackageErrorMessage("Network error.");
    }
  };

  const handleEditPackageClick = (pkg: any) => {
    const listString = Array.isArray(pkg.features) ? pkg.features.join('\n') : '';
    setPackageForm({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      badge: pkg.badge || '',
      description: pkg.description || '',
      featuresText: listString
    });
    setShowPackageForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/services/${editingId}` : '/api/services';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ title: '', slug: '', description: '', pricing: '' });
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (service: any) => {
    setEditingId(service.id);
    setFormData({
      title: service.title,
      slug: service.slug,
      description: service.description || '',
      pricing: service.pricing || ''
    });
    setIsModalOpen(true);
  };

  const handleReorder = async (newOrder: any[]) => {
    setServices(newOrder);

    const reorderedIds = newOrder.map(s => s.id);
    const token = localStorage.getItem('adminToken');
    try {
      await fetch('/api/services/reorder/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reorderedIds })
      });
      localStorage.removeItem('services_list_last_fetch');
      localStorage.removeItem('services_list_cache');
    } catch(e) {
      console.error("Failed to reorder array", e);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...services];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    handleReorder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === services.length - 1) return;
    const newOrder = [...services];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    handleReorder(newOrder);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Services</h2>
          <p className="text-neutral-400 text-sm">Manage your agency offerings.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', slug: '', description: '', pricing: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> <span>Add Service</span>
        </button>
      </div>

      <div className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/50 text-neutral-400 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Pricing</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {services.map((s, index) => (
              <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{s.title}</div>
                  <div className="text-neutral-500 text-xs mt-0.5">{s.slug}</div>
                </td>
                <td className="px-6 py-4 text-neutral-400">
                  {s.pricing || 'Custom'}
                </td>
                <td className="px-6 py-4 flex justify-end items-center gap-1.5">
                  {pendingDeleteServiceId === s.id ? (
                    <div className="flex items-center gap-1 animate-pulse">
                      <span className="text-[10px] text-red-400 font-mono">Confirm?</span>
                      <button 
                        onClick={() => {
                          handleDelete(s.id);
                          setPendingDeleteServiceId(null);
                        }} 
                        className="px-1.5 py-1 text-[10px] bg-red-500/20 text-red-300 hover:bg-red-500/40 rounded transition-colors font-mono font-bold"
                      >
                        Yes
                      </button>
                      <button 
                        onClick={() => setPendingDeleteServiceId(null)} 
                        className="px-1.5 py-1 text-[10px] bg-white/5 text-neutral-400 hover:bg-white/10 rounded transition-colors font-mono font-bold"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col mr-2 space-y-1">
                        <button 
                          onClick={() => moveUp(index)} 
                          disabled={index === 0}
                          className="text-neutral-500 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-500 rounded transition-colors"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button 
                          onClick={() => moveDown(index)} 
                          disabled={index === services.length - 1}
                          className="text-neutral-500 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-500 rounded transition-colors"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleOpenPackages(s)} 
                        title="Manage Pricing Tiers" 
                        className="p-2 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <DollarSign size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenFaqs(s)} 
                        title="Manage FAQs" 
                        className="p-2 text-neutral-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <HelpCircle size={16} />
                      </button>
                      <button onClick={() => openEdit(s)} className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setPendingDeleteServiceId(s.id)} className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                  No services found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/50">
                <h3 className="text-lg font-semibold">{editingId ? 'Edit Service' : 'Add New Service'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Slug</label>
                  <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Pricing (e.g. "From $500")</label>
                  <input value={formData.pricing} onChange={e => setFormData({...formData, pricing: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Description</label>
                  <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none" />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
                    {editingId ? 'Save Changes' : 'Create Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service FAQs Modal */}
      <AnimatePresence>
        {activeFaqService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setActiveFaqService(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/50 shrink-0">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <HelpCircle className="text-blue-500" size={18} />
                    <span>Manage FAQs & Questions</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">Configuring FAQs for: <span className="text-neutral-200 font-medium">{activeFaqService.title}</span></p>
                </div>
                <button onClick={() => setActiveFaqService(null)} className="text-neutral-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {faqSuccessMessage && (
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono">
                    {faqSuccessMessage}
                  </div>
                )}
                {faqErrorMessage && (
                  <div className="p-3.5 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs font-mono">
                    {faqErrorMessage}
                  </div>
                )}

                {showFaqForm ? (
                  <form onSubmit={handleSaveFaq} className="space-y-4 bg-black/30 p-5 border border-white/5 rounded-xl">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-400">
                      {faqForm.id ? "Edit FAQ Item" : "Add FAQ Item"}
                    </h4>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Question Description</label>
                      <input 
                        required 
                        value={faqForm.question || ''} 
                        onChange={e => setFaqForm({...faqForm, question: e.target.value})} 
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                        placeholder="e.g. Do you offer feedback iterations?" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Answer Explanation</label>
                      <textarea 
                        required 
                        rows={3} 
                        value={faqForm.answer || ''} 
                        onChange={e => setFaqForm({...faqForm, answer: e.target.value})} 
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none text-xs resize-none" 
                        placeholder="e.g. Yes, each creative project includes up to three structured revision iterations..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowFaqForm(false);
                          setFaqForm({ id: null, question: '', answer: '' });
                        }} 
                        className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        {faqForm.id ? "Update FAQ" : "Add FAQ"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-center bg-black/20 p-4 border border-white/5 rounded-xl shrink-0">
                    <span className="text-xs text-neutral-400">Do you want to document a new question?</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setFaqForm({ id: null, question: '', answer: '' });
                        setShowFaqForm(true);
                      }} 
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      + Add New FAQ
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 font-mono">Existing FAQs ({faqs.length})</h4>
                  {loadingFaqs ? (
                    <div className="py-8 text-center text-neutral-500 text-xs animate-pulse font-mono">Loading FAQs list...</div>
                  ) : faqs.length === 0 ? (
                    <div className="py-8 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl text-xs">
                      No FAQs specified yet. FAQs entered here will appear in "Got Questions? Read FAQs" on the service detail page.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {faqs.map(faq => (
                        <div key={faq.id} className="p-4 bg-neutral-950/40 border border-white/5 rounded-xl flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-bold text-white text-xs leading-relaxed">{faq.question}</p>
                            <p className="text-neutral-400 text-xs font-light leading-relaxed">{faq.answer}</p>
                          </div>
                          <div className="flex items-center gap-1 shadow-sm shrink-0">
                            {pendingDeleteFaqId === faq.id ? (
                              <div className="flex items-center gap-1.5 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10 animate-pulse">
                                <span className="text-[9px] text-red-400 font-mono tracking-wider">Confirm Delete?</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    handleDeleteFaq(faq.id);
                                    setPendingDeleteFaqId(null);
                                  }} 
                                  className="p-0.5 px-1.5 text-[9px] uppercase font-mono bg-red-500/20 text-red-300 rounded hover:bg-red-500/40 transition-colors font-bold"
                                >
                                  Yes
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => setPendingDeleteFaqId(null)} 
                                  className="p-0.5 px-1.5 text-[9px] uppercase font-mono bg-white/5 text-neutral-400 rounded hover:bg-white/10 transition-colors font-bold"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  type="button"
                                  onClick={() => handleEditFaqClick(faq)} 
                                  className="p-1 px-2 text-[10px] uppercase font-mono text-blue-400 hover:bg-white/5 rounded transition-colors"
                                >
                                  Edit
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setPendingDeleteFaqId(faq.id)} 
                                  className="p-1 px-2 text-[10px] uppercase font-mono text-red-400 hover:bg-white/5 rounded transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service Packages Modal */}
      <AnimatePresence>
        {activePackageService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setActivePackageService(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/50 shrink-0">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="text-emerald-500" size={18} />
                    <span>Manage Pricing Tiers & Packages</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">Configuring tiers for: <span className="text-neutral-200 font-medium">{activePackageService.title}</span></p>
                </div>
                <button onClick={() => setActivePackageService(null)} className="text-neutral-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {packageSuccessMessage && (
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono">
                    {packageSuccessMessage}
                  </div>
                )}
                {packageErrorMessage && (
                  <div className="p-3.5 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs font-mono">
                    {packageErrorMessage}
                  </div>
                )}

                {showPackageForm ? (
                  <form onSubmit={handleSavePackage} className="space-y-4 bg-black/30 p-5 border border-white/5 rounded-xl">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-400">
                      {packageForm.id ? "Edit Package Tier" : "Add Package Tier"}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1">Tier Name *</label>
                        <input 
                          required 
                          value={packageForm.name || ''} 
                          onChange={e => setPackageForm({...packageForm, name: e.target.value})} 
                          className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                          placeholder="e.g. Creator Plus, Deluxe Retainer" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1">Tier Price *</label>
                        <input 
                          required 
                          value={packageForm.price || ''} 
                          onChange={e => setPackageForm({...packageForm, price: e.target.value})} 
                          className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                          placeholder="e.g. $1,500, $4,000/mo" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1">Badge (Optional)</label>
                        <input 
                          value={packageForm.badge || ''} 
                          onChange={e => setPackageForm({...packageForm, badge: e.target.value})} 
                          className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                          placeholder="e.g. Most Popular, Essential" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1">Short Description</label>
                        <input 
                          value={packageForm.description || ''} 
                          onChange={e => setPackageForm({...packageForm, description: e.target.value})} 
                          className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                          placeholder="Perfect if you have assets ready..." 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Deliverables / Features (One per line) *</label>
                      <textarea 
                        required 
                        rows={5} 
                        value={packageForm.featuresText || ''} 
                        onChange={e => setPackageForm({...packageForm, featuresText: e.target.value})} 
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none text-xs resize-none" 
                        placeholder="e.g.&#10;Up to 5 minutes edited output&#10;Color Grading included&#10;2 revision iterations"
                      />
                      <p className="text-[10px] mt-1 text-neutral-500">Press enter to separate benefit lines.</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowPackageForm(false);
                          setPackageForm({ id: null, name: '', price: '', badge: '', description: '', featuresText: '' });
                        }} 
                        className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        {packageForm.id ? "Update Package" : "Add Package"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-center bg-black/20 p-4 border border-white/5 rounded-xl shrink-0">
                    <span className="text-xs text-neutral-400">Add a new pricing tier to offer to your clients?</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setPackageForm({ id: null, name: '', price: '', badge: '', description: '', featuresText: '' });
                        setShowPackageForm(true);
                      }} 
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      + Add New Tier
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 font-mono">Current Tiers ({packages.length})</h4>
                  {loadingPackages ? (
                    <div className="py-8 text-center text-neutral-500 text-xs animate-pulse font-mono">Loading packages list...</div>
                  ) : packages.length === 0 ? (
                    <div className="py-8 text-center text-neutral-400 border border-dashed border-white/10 rounded-xl text-xs font-mono">
                      No pricing tiers configured yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {packages.map(pkg => (
                        <div key={pkg.id} className="p-4 bg-neutral-950/40 border border-white/5 rounded-xl flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-grow">
                            <div className="flex items-center gap-2">
                              {pkg.badge && (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                                  {pkg.badge}
                                </span>
                              )}
                              <p className="font-bold text-white text-xs leading-relaxed">{pkg.name} — <span className="text-emerald-400">{pkg.price}</span></p>
                            </div>
                            {pkg.description && <p className="text-neutral-400 text-xs leading-relaxed">{pkg.description}</p>}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {pkg.features && Array.isArray(pkg.features) && pkg.features.map((feat: string, i: number) => (
                                <span key={i} className="bg-white/5 border border-white/5 text-[9px] text-neutral-300 font-mono px-2 py-0.5 rounded">
                                  • {feat}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shadow-sm shrink-0">
                            {pendingDeletePackageId === pkg.id ? (
                              <div className="flex items-center gap-1.5 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10 animate-pulse">
                                <span className="text-[9px] text-red-400 font-mono tracking-wider">Confirm Delete?</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    handleDeletePackage(pkg.id);
                                    setPendingDeletePackageId(null);
                                  }} 
                                  className="p-0.5 px-1.5 text-[9px] uppercase font-mono bg-red-500/20 text-red-300 rounded hover:bg-red-500/40 transition-colors font-bold"
                                >
                                  Yes
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => setPendingDeletePackageId(null)} 
                                  className="p-0.5 px-1.5 text-[9px] uppercase font-mono bg-white/5 text-neutral-400 rounded hover:bg-white/10 transition-colors font-bold"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  type="button"
                                  onClick={() => handleEditPackageClick(pkg)} 
                                  className="p-1 px-2 text-[10px] uppercase font-mono text-blue-400 hover:bg-white/5 rounded transition-colors"
                                >
                                  Edit
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setPendingDeletePackageId(pkg.id)} 
                                  className="p-1 px-2 text-[10px] uppercase font-mono text-red-400 hover:bg-white/5 rounded transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
