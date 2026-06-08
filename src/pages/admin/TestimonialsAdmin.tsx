import React, { useEffect, useState } from 'react';
import { Plus, Trash, Edit, Star, X, Save } from 'lucide-react';

export default function TestimonialsAdmin() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    client_name: '',
    company: '',
    rating: 5,
    review: '',
    photo: ''
  });

  const loadReviews = () => {
    setLoading(true);
    fetch('/api/testimonials')
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      client_name: '',
      company: '',
      rating: 5,
      review: '',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditId(item.id);
    setFormData({
      client_name: item.client_name || '',
      company: item.company || '',
      rating: item.rating || 5,
      review: item.review || '',
      photo: item.photo || ''
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== id));
        // Invalidate testimonials cache
        localStorage.removeItem('testimonials_list_cache');
        localStorage.removeItem('testimonials_list_last_fetch');
      } else {
        console.error("Testimonial delete operation failed.");
      }
    } catch (e) {
      console.error("Error communicating delete:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const method = editId ? 'PUT' : 'POST';
    const endpoint = editId ? `/api/testimonials/${editId}` : '/api/testimonials';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        // Invalidate testimonials cache
        localStorage.removeItem('testimonials_list_cache');
        localStorage.removeItem('testimonials_list_last_fetch');
        setFormOpen(false);
        loadReviews();
      } else {
        alert("Action failed.");
      }
    } catch {
      alert("Database error.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold">Client Review Management</h2>
          <p className="text-neutral-400 text-xs mt-1">Configure client metrics and feedback blocks displaying inside home and reviews list.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} /> RECORD NEW TESTIMONIAL
        </button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 p-8 rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto space-y-6 text-white text-xs">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider">{editId ? 'Repair Testimonial' : 'Register Customer Feedback'}</h3>
              <button onClick={() => setFormOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-neutral-400">Client Name *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.client_name} 
                  onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 text-xs" 
                  placeholder="Sarah Jenkins" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-neutral-400">Company & Title *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.company} 
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 text-xs" 
                  placeholder="CMO, BrightPath Media" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-neutral-400">Rating Stars (1 - 5) *</label>
                <input 
                  type="number" 
                  required 
                  min={1} 
                  max={5}
                  value={formData.rating} 
                  onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 text-xs" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-neutral-400">Profile image Card URL</label>
                <input 
                  type="text" 
                  value={formData.photo} 
                  onChange={e => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono" 
                  placeholder="https://..." 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-neutral-400">Client Review Text *</label>
                <textarea 
                  required 
                  rows={4} 
                  value={formData.review} 
                  onChange={e => setFormData({ ...formData, review: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs focus:outline-none" 
                  placeholder="HA Studio made cinematic adjustments that transforms our layout..." 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-extrabold rounded-xl text-xs uppercase transition-colors"
              >
                Incorporate Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table List */}
      <div className="bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-black/40 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="p-4">Customer</th>
              <th className="p-4">Corporate Info</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Review summary</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((rev) => (
              <tr key={rev.id} className="border-b border-white/5 hover:bg-neutral-900/40">
                <td className="p-4 flex items-center gap-3">
                  <img src={rev.photo} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <span className="font-semibold text-white">{rev.client_name}</span>
                </td>
                <td className="p-4 text-neutral-300">{rev.company}</td>
                <td className="p-4">
                  <div className="flex gap-0.5 text-amber-500 font-bold">
                    {rev.rating} ★
                  </div>
                </td>
                <td className="p-4 text-neutral-400 max-w-xs truncate">{rev.review}</td>
                <td className="p-4 text-right">
                  {pendingDeleteId === rev.id ? (
                    <div className="flex justify-end items-center gap-1">
                      <span className="text-[10px] text-red-500 font-mono">Sure?</span>
                      <button 
                        onClick={() => {
                          handleDelete(rev.id);
                          setPendingDeleteId(null);
                        }} 
                        className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded font-bold"
                      >
                        Yes
                      </button>
                      <button 
                        onClick={() => setPendingDeleteId(null)} 
                        className="px-1.5 py-0.5 text-[10px] bg-neutral-800 text-neutral-400 rounded font-bold"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(rev)}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-neutral-300 inline-block align-middle"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => setPendingDeleteId(rev.id)}
                        className="p-1.5 bg-neutral-900 hover:bg-red-500/10 rounded-lg text-red-500 inline-block align-middle"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-neutral-600 font-mono">
                  No testimonials registered inside database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
