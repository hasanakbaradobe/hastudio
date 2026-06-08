import React, { useEffect, useState } from 'react';
import { Plus, Trash, Edit, X, Save, Users, Mail, Link2, Globe } from 'lucide-react';

export default function TeamAdmin() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Custom modal/alert state to avoid browser prompt blocking
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    photo: '',
    email: '',
    instagram: '',
    github: '',
    linkedin: ''
  });

  const loadTeamMembers = () => {
    setLoading(true);
    fetch('/api/team')
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
          setMembers(data);
        }
      })
      .catch((err) => {
        console.error(err);
        triggerAlert("Failed to load team members from the repository database.", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const triggerAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlertInfo({ message, type });
    setTimeout(() => {
      setAlertInfo(null);
    }, 5000);
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      name: '',
      role: '',
      bio: '',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
      email: '',
      instagram: '',
      github: '',
      linkedin: ''
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditId(item.id);
    
    // Parse social links if present
    const socials = item.social_links || {};
    
    setFormData({
      name: item.name || '',
      role: item.role || '',
      bio: item.bio || '',
      photo: item.photo || '',
      email: item.email || '',
      instagram: socials.instagram || socials.instagram_url || '',
      github: socials.github || socials.github_url || '',
      linkedin: socials.linkedin || socials.linkedin_url || ''
    });
    setFormOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    const token = localStorage.getItem('adminToken');
    console.log(`[TeamAdmin] Requesting DELETE for team member ID: ${id}`);
    try {
      const response = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        console.log(`[TeamAdmin] DELETE succeeded for ID: ${id}`);
        setMembers(members.filter(m => Number(m.id) !== Number(id)));
        triggerAlert(`Representative ${name} has been removed from system directory.`, "success");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[TeamAdmin] DELETE failed (status: ${response.status}):`, errorData);
        triggerAlert(errorData.error || errorData.details || "Operation failed to delete team member.", "error");
      }
    } catch (err) {
      console.error("[TeamAdmin] Error sending DELETE request:", err);
      triggerAlert("Error executing delete command.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const method = editId ? 'PUT' : 'POST';
    const endpoint = editId ? `/api/team/${editId}` : '/api/team';

    // Pack social links
    const social_links = {
      instagram: formData.instagram.trim(),
      github: formData.github.trim(),
      linkedin: formData.linkedin.trim()
    };

    const payload = {
      name: formData.name,
      role: formData.role,
      bio: formData.bio,
      photo: formData.photo,
      email: formData.email,
      social_links
    };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setFormOpen(false);
        loadTeamMembers();
        triggerAlert(`Saved details for ${formData.name} successfully.`, "success");
      } else {
        const errData = await response.json().catch(() => ({}));
        triggerAlert(errData.error || "Action failed.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Database error occured while saving.", "error");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Custom Alerts Banner */}
      {alertInfo && (
        <div className={`p-4 rounded-xl text-xs font-mono border flex items-center justify-between transition-all ${
          alertInfo.type === 'error' 
            ? 'bg-red-950/40 border-red-500/30 text-red-400' 
            : 'bg-green-950/40 border-green-500/30 text-green-400'
        }`}>
          <span>{alertInfo.message}</span>
          <button onClick={() => setAlertInfo(null)} className="text-neutral-500 hover:text-neutral-300">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full space-y-4 text-white text-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <Trash size={16} />
              <span>Confirm Permanent Deletion</span>
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              Are you sure you want to permanently erase <strong className="text-white">{deleteTarget.name}</strong> from the database rosters?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl"
              >
                No, Keep
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Header */}
      <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="text-blue-500 w-5 h-5" />
            <span>Team Members Hub</span>
          </h2>
          <p className="text-neutral-400 text-xs mt-1">Design, enlist, and manage HA Studio specialists visible across the customer portfolio platform.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus size={15} /> INTRODUCE COLLEAGUE
        </button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 p-6 sm:p-8 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto space-y-6 text-white text-xs">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {editId ? 'Modify Officer Details' : 'Onboard New Architect'}
              </h3>
              <button onClick={() => setFormOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-400">FullName *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 text-xs text-white" 
                    placeholder="Harry Akber" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-400">Expertise / Role *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.role} 
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 text-xs text-white" 
                    placeholder="Founder & Director" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-400">Representative Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 text-xs text-white" 
                    placeholder="harry@hastudio.com" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-400">Avatar Image Link</label>
                  <input 
                    type="text" 
                    value={formData.photo} 
                    onChange={e => setFormData({ ...formData, photo: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl focus:border-blue-500 text-xs text-white font-mono" 
                    placeholder="https://images.unsplash.com/..." 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-neutral-400">Short Bio / Career Background</label>
                <textarea 
                  rows={3} 
                  value={formData.bio} 
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs focus:border-blue-500 text-white" 
                  placeholder="Tell us about their background..." 
                />
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-blue-400 tracking-wider font-mono">Social Link Profiles</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-mono text-neutral-500">Instagram</label>
                    <input 
                      type="text" 
                      value={formData.instagram} 
                      onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                      className="w-full px-2 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-[11px] font-mono text-white" 
                      placeholder="https://instagram.com/..." 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-mono text-neutral-500">GitHub</label>
                    <input 
                      type="text" 
                      value={formData.github} 
                      onChange={e => setFormData({ ...formData, github: e.target.value })}
                      className="w-full px-2 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-[11px] font-mono text-white" 
                      placeholder="https://github.com/..." 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-mono text-neutral-500">LinkedIn</label>
                    <input 
                      type="text" 
                      value={formData.linkedin} 
                      onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full px-2 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-[11px] font-mono text-white" 
                      placeholder="https://linkedin.com/..." 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-black font-extrabold rounded-xl text-xs uppercase transition-colors"
                >
                  Save Team Member Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table List / Team grid */}
      <div className="bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="text-center py-16 text-xs text-neutral-500 font-mono">
            Fetching active practitioners...
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-black/40 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="p-4 pl-6">Specialist</th>
                <th className="p-4">Corporate Role</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Social Accounts</th>
                <th className="p-4 text-right pr-6">Management</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-white/5 hover:bg-neutral-950/80 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150'} 
                        alt={member.name} 
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10" 
                      />
                      <div>
                        <div className="font-bold text-white text-sm">{member.name}</div>
                        <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5 font-medium max-w-[280px]">
                          {member.bio || 'No career summary specified.'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-neutral-300 font-semibold">{member.role}</td>
                  <td className="p-4">
                    {member.email ? (
                      <a href={`mailto:${member.email}`} className="text-blue-400 hover:underline flex items-center gap-1">
                        <Mail size={12} />
                        <span>{member.email}</span>
                      </a>
                    ) : (
                      <span className="text-neutral-600 font-mono">--</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {member.social_links?.instagram && (
                        <a href={member.social_links.instagram} target="_blank" rel="noreferrer" className="p-1 bg-neutral-900 rounded text-neutral-400 hover:text-white" title="Instagram">
                          <Globe size={12} />
                        </a>
                      )}
                      {member.social_links?.github && (
                        <a href={member.social_links.github} target="_blank" rel="noreferrer" className="p-1 bg-neutral-900 rounded text-neutral-400 hover:text-white" title="GitHub">
                          <Link2 size={12} />
                        </a>
                      )}
                      {member.social_links?.linkedin && (
                        <a href={member.social_links.linkedin} target="_blank" rel="noreferrer" className="p-1 bg-neutral-900 rounded text-neutral-400 hover:text-white" title="LinkedIn">
                          <Users size={12} />
                        </a>
                      )}
                      {!member.social_links?.instagram && !member.social_links?.github && !member.social_links?.linkedin && (
                        <span className="text-neutral-600 font-mono">Offline</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right pr-6 space-x-2">
                    <button 
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-neutral-300 transition-colors"
                      title="Edit details"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => setDeleteTarget(member)}
                      className="p-1.5 bg-neutral-900 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                      title="Remove entry"
                    >
                      <Trash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-neutral-600 font-mono">
                    No specialists found matching system directories.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
