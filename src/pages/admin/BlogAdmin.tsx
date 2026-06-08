import React, { useEffect, useState } from 'react';
import { Plus, Trash, Edit, X, Save, AlertCircle } from 'lucide-react';

export default function BlogAdmin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: 'Design Trends',
    tags: '',
    featured_image: '',
    seo_title: '',
    seo_description: '',
    publish_status: 'draft'
  });

  const loadPosts = () => {
    setLoading(true);
    fetch('/api/blog')
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      category: 'Design Trends',
      tags: 'Design, Motion',
      featured_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600',
      seo_title: '',
      seo_description: '',
      publish_status: 'draft'
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (post: any) => {
    let tagString = '';
    try {
      const parsed = typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []);
      tagString = Array.isArray(parsed) ? parsed.join(', ') : '';
    } catch {
      tagString = '';
    }

    setEditId(post.id);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      content: post.content || '',
      category: post.category || 'Design Trends',
      tags: tagString,
      featured_image: post.featured_image || '',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      publish_status: post.publish_status || 'draft'
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id));
      } else {
        console.error("Deletion failed.");
      }
    } catch (e) {
      console.error("Error transmitting request:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const method = editId ? 'PUT' : 'POST';
    const endpoint = editId ? `/api/blog/${editId}` : '/api/blog';

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const postPayload = {
      ...formData,
      tags: tagsArray
    };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postPayload)
      });
      if (response.ok) {
        setFormOpen(false);
        loadPosts();
      } else {
        alert("Operation encountered issues.");
      }
    } catch (err) {
      console.error(err);
      alert("Database mapping error.");
    }
  };

  // Auto compile slug on title change
  const handleTitleChange = (title: string) => {
    const rawSlug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setFormData(prev => ({ ...prev, title, slug: rawSlug }));
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold">Journal Management</h2>
          <p className="text-neutral-400 text-xs mt-1">Write, revise, or change slugs of articles matching the Studio Blog section.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} /> WRITE JOURNAL POST
        </button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto space-y-6 text-white">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold">{editId ? 'Revise Journal Draft' : 'Add Studio Journal Article'}</h3>
              <button onClick={() => setFormOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs uppercase font-mono text-neutral-400">Post Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={e => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-xs" 
                    placeholder="E.g. How Motion Graphics Drive Conversions" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400">Dynamic Slug (Auto-generated) *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.slug} 
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-xs font-mono" 
                    placeholder="pacing-reels" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400">Category Tag *</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 text-xs text-white"
                  >
                    <option value="Design Trends">Design Trends</option>
                    <option value="Motion & Graphics">Motion & Graphics</option>
                    <option value="Branding Strategy">Branding Strategy</option>
                    <option value="Client Sprints">Client Sprints</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400">Image Cover Path *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.featured_image} 
                    onChange={e => setFormData({ ...formData, featured_image: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono" 
                    placeholder="https://..." 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-mono text-neutral-400">Comma tags lists (comma-separated)</label>
                  <input 
                    type="text" 
                    value={formData.tags} 
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs" 
                    placeholder="Motion, Color, Grade" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-mono text-neutral-400">Content Body Writeup *</label>
                <textarea 
                  required 
                  rows={6} 
                  value={formData.content} 
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-blue-500" 
                  placeholder="Draft your deep structural thoughts here..." 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-400">SEO Meta Title</label>
                  <input 
                    type="text" 
                    value={formData.seo_title} 
                    onChange={e => setFormData({ ...formData, seo_title: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-white/10 rounded-xl text-[10px]" 
                    placeholder="Custom Index Titles" 
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] uppercase font-mono text-neutral-400">SEO Meta Description</label>
                  <input 
                    type="text" 
                    value={formData.seo_description} 
                    onChange={e => setFormData({ ...formData, seo_description: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-white/10 rounded-xl text-[10px]" 
                    placeholder="Index snippets description..." 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-mono text-neutral-400">Publish State</label>
                <select 
                  value={formData.publish_status} 
                  onChange={e => setFormData({ ...formData, publish_status: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="published">Published (Visible instantly on Journal)</option>
                  <option value="draft">Draft (Visible inside admin panel only)</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-extrabold rounded-xl text-xs uppercase transition-colors"
              >
                Sync Article to Database
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Posts panel */}
      <div className="bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-black/40 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="p-4">Article</th>
              <th className="p-4">Slug Tracker</th>
              <th className="p-4">Tag</th>
              <th className="p-4">State</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-white/5 hover:bg-neutral-900/40">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-neutral-900">
                    <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">{post.title}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">{new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-neutral-400 text-[11px] font-medium">{post.slug}</td>
                <td className="p-4 text-neutral-300 font-mono text-[10px] uppercase">{post.category}</td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                    post.publish_status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {post.publish_status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {pendingDeleteId === post.id ? (
                    <div className="flex justify-end items-center gap-1">
                      <span className="text-[10px] text-red-500 font-mono">Sure?</span>
                      <button 
                        onClick={() => {
                          handleDelete(post.id);
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
                        onClick={() => handleOpenEdit(post)}
                        className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-neutral-300 inline-block align-middle"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => setPendingDeleteId(post.id)}
                        className="p-1.5 bg-neutral-900 hover:bg-red-500/10 rounded-lg text-red-500 inline-block align-middle"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-neutral-600 font-mono">
                  No blog entries currently registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
