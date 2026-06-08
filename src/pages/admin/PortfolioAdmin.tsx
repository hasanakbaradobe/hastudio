import React, { useEffect, useState } from 'react';
import { Plus, Trash, Edit, Star, Image, X, Check } from 'lucide-react';

export default function PortfolioAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Video Editing',
    client_name: '',
    description: '',
    challenge: '',
    solution: '',
    result: '',
    thumbnail: '',
    video_url: '',
    featured_status: 1
  });

  const loadItems = () => {
    setLoading(true);
    fetch('/api/portfolio')
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      title: '',
      category: 'Video Editing',
      client_name: '',
      description: '',
      challenge: '',
      solution: '',
      result: '',
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
      video_url: '',
      featured_status: 1
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditId(item.id);
    setFormData({
      title: item.title || '',
      category: item.category || 'Video Editing',
      client_name: item.client_name || '',
      description: item.description || '',
      challenge: item.challenge || '',
      solution: item.solution || '',
      result: item.result || '',
      thumbnail: item.thumbnail || '',
      video_url: item.video_url || '',
      featured_status: item.featured_status ? 1 : 0
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setItems(items.filter(i => i.id !== id));
        // Invalidate portfolio cache
        localStorage.removeItem('portfolio_list_cache');
        localStorage.removeItem('portfolio_list_last_fetch');
      } else {
        console.error("Failed to delete case study.");
      }
    } catch (e) {
      console.error("Error transmitting delete operation:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const method = editId ? 'PUT' : 'POST';
    const endPoint = editId ? `/api/portfolio/${editId}` : '/api/portfolio';

    try {
      const response = await fetch(endPoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        // Invalidate portfolio cache
        localStorage.removeItem('portfolio_list_cache');
        localStorage.removeItem('portfolio_list_last_fetch');
        setFormOpen(false);
        loadItems();
      } else {
        alert("Operation failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error syncing database query.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold">Portfolio Management</h2>
          <p className="text-neutral-400 text-xs mt-1">Add, update, or erase visual studies in Home and Portfolios sections.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} /> ADD CASE SHOWCASE
        </button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto space-y-6 text-white">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold">{editId ? 'Repair Case study' : 'Add Creative Project'}</h3>
              <button onClick={() => setFormOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400">Project Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-xs" 
                    placeholder="CyberX Identity Upgrade" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400">Category *</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-xs text-white"
                  >
                    <option value="Video Editing">Video Editing</option>
                    <option value="Motion Graphics">Motion Graphics</option>
                    <option value="Branding Design">Branding Design</option>
                    <option value="Graphic Design">Graphic Design</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400">Client / Company Label *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.client_name} 
                    onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-xs" 
                    placeholder="CyberX Digital" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400">Thumbnail URL / Image *</label>
                  <input 
                    type="text" 
                    value={formData.thumbnail} 
                    onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-xs font-mono" 
                    placeholder="https://..." 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-mono text-neutral-400">Brief Overview *</label>
                <textarea 
                  required 
                  rows={2} 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-xs focus:ring-1 focus:ring-blue-500" 
                  placeholder="Outline high-level campaign summary..." 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-400">The Challenge</label>
                  <textarea 
                    rows={3} 
                    value={formData.challenge} 
                    onChange={e => setFormData({ ...formData, challenge: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-[11px] focus:outline-none" 
                    placeholder="E.g. condense raw files..." 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-400">Our Solution</label>
                  <textarea 
                    rows={3} 
                    value={formData.solution} 
                    onChange={e => setFormData({ ...formData, solution: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-[11px] focus:outline-none" 
                    placeholder="E.g. sync speed curves..." 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-400">The Outcome Metric</label>
                  <textarea 
                    rows={3} 
                    value={formData.result} 
                    onChange={e => setFormData({ ...formData, result: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-[11px] focus:outline-none" 
                    placeholder="E.g. 240% pre-order conversion lift..." 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400">Showreel Video URL / YT Anchor</label>
                  <input 
                    type="text" 
                    value={formData.video_url} 
                    onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-xs font-mono" 
                    placeholder="https://youtube.com/..." 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400">Promotion Status</label>
                  <select 
                    value={formData.featured_status} 
                    onChange={e => setFormData({ ...formData, featured_status: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-xs text-white"
                  >
                    <option value={1}>Promoted to Homepage Showcase</option>
                    <option value={0}>Standard Portfolio only</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-extrabold rounded-xl text-xs uppercase transition-colors"
              >
                {editId ? 'Apply Case Study Repairs' : 'Incorporate Creative Case'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-black/40 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="p-4">Showcase Info</th>
              <th className="p-4">Category</th>
              <th className="p-4">Client label</th>
              <th className="p-4 text-center">Home Promoted</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-neutral-900/40">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-12 h-8 rounded bg-neutral-900 overflow-hidden shrink-0">
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-semibold text-white">{item.title}</span>
                </td>
                <td className="p-4 text-neutral-300 font-mono uppercase text-[10px]">{item.category}</td>
                <td className="p-4 text-neutral-400">{item.client_name}</td>
                <td className="p-4 text-center">
                  {item.featured_status ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded-full uppercase">
                      <Check size={10} /> PROMOTED
                    </span>
                  ) : (
                    <span className="text-neutral-600 font-mono text-[10px]">—</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {pendingDeleteId === item.id ? (
                    <div className="flex justify-end items-center gap-1">
                      <span className="text-[10px] text-red-500 font-mono">Sure?</span>
                      <button 
                        onClick={() => {
                          handleDelete(item.id);
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
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-neutral-300 inline-block align-middle"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => setPendingDeleteId(item.id)}
                        className="p-1.5 bg-neutral-900 hover:bg-red-500/10 rounded-lg text-red-500 inline-block align-middle"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-neutral-600 font-mono">
                  No portfolio records inside database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
