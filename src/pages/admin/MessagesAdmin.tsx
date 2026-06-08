import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle, Trash, ExternalLink, Calendar, X } from 'lucide-react';

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlertInfo({ message, type });
    setTimeout(() => {
      setAlertInfo(null);
    }, 5000);
  };

  const loadMessages = () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    fetch('/api/messages', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
          return new Promise<never>(() => {});
        }
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
          window.dispatchEvent(new Event('messages-updated'));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleFlagRead = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/messages/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, is_read: 1 } : m));
        window.dispatchEvent(new Event('messages-updated'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMessages(messages.filter(m => Number(m.id) !== Number(id)));
        window.dispatchEvent(new Event('messages-updated'));
        triggerAlert("Project brief was permanently deleted from archives.", "success");
      } else {
        triggerAlert("Operation failed to delete the selected project brief.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Error communicating deletion command with backend structures.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Alert toast display */}
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
              <Trash size={16} />
              <span>Confirm Permanent Deletion</span>
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete the incoming project brief from <strong className="text-white">{deleteTarget.name}</strong>? This structural record cannot be restored.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl"
              >
                Cancel
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

      {/* Title */}
      <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold">Inbound Contact Messages</h2>
        <p className="text-neutral-400 text-xs mt-1">Review, flag as processed/read, or purge inbound submissions from the home and page leads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`p-6 bg-neutral-950 border rounded-2xl space-y-4 relative overflow-hidden transition-all ${
              msg.is_read ? 'border-white/5 opacity-70' : 'border-blue-500/30 shadow-lg shadow-blue-500/5'
            }`}
          >
            {!msg.is_read && (
              <span className="absolute top-4 right-4 text-[9px] font-mono font-bold bg-blue-500 text-neutral-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Unread Alert
              </span>
            )}

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 flex items-center gap-1">
                <Calendar size={12} /> {new Date(msg.created_at || Date.now()).toLocaleString()}
              </span>
              <h3 className="text-base font-bold text-white">{msg.name}</h3>
              <a href={`mailto:${msg.email}`} className="text-xs text-blue-400 hover:underline">{msg.email}</a>
            </div>

            <div className="p-4 bg-neutral-905 border border-white/5 rounded-xl text-neutral-300 text-xs space-y-2">
              <div className="font-semibold text-white uppercase text-[10px] font-mono text-neutral-400">Subject: {msg.subject}</div>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
            </div>

            <div className="flex gap-2">
              {!msg.is_read && (
                <button 
                  onClick={() => handleFlagRead(msg.id)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold font-mono text-[10px] uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle size={12} /> processed / Mark read
                </button>
              )}
              <button 
                onClick={() => setDeleteTarget(msg)}
                className="px-4 py-2 bg-neutral-900 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 font-mono text-[10px] uppercase rounded-lg flex items-center gap-1 cursor-pointer ml-auto"
              >
                <Trash size={12} /> Delete Brief
              </button>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="col-span-2 text-center py-20 text-neutral-600 font-mono border border-dashed border-neutral-900 rounded-2xl">
            No contacts inbox data found.
          </div>
        )}
      </div>

    </div>
  );
}
