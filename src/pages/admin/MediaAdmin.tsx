import React, { useEffect, useState } from 'react';
import { Upload, Trash, Search, Copy, Check, FileImage, AlertCircle, X } from 'lucide-react';

export default function MediaAdmin() {
  const [media, setMedia] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlertInfo({ message, type });
    setTimeout(() => {
      setAlertInfo(null);
    }, 5000);
  };

  const loadMedia = () => {
    fetch('/api/media')
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setMedia(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("File size cannot exceed 5MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload first.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || "File uploaded successfully!");
        setSelectedFile(null);
        // Clear file input
        const fileInput = document.getElementById('media_file_input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        loadMedia();
      } else {
        setError(data.error || "Failed to upload file.");
      }
    } catch {
      setError("Failed to reach server backend upload APIs.");
    } finally {
      setUploading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMedia(media.filter(item => Number(item.id) !== Number(id)));
        triggerAlert("Media asset permanently deleted successfully.", "success");
      } else {
        const errorData = await response.json().catch(() => ({}));
        triggerAlert(errorData.error || "Failed to delete from backend database.", "error");
      }
    } catch {
      triggerAlert("Network error requesting resource deletion.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCopyLink = (item: any) => {
    const fullUrl = window.location.origin + item.file_url;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 1500);
      })
      .catch(() => {
        triggerAlert(`Please manually select and copy path: ${item.file_url}`, "error");
      });
  };

  const filteredMedia = media.filter(item => 
    item.filename.toLowerCase().includes(search.toLowerCase())
  );

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
          <button onClick={() => setAlertInfo(null)} className="text-neutral-500 hover:text-neutral-300 cursor-pointer">
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
              <span>Confirm Media Deletion</span>
            </h3>
            <p className="text-neutral-300 leading-relaxed font-sans">
              Are you sure you want to permanently delete <strong className="text-white">{deleteTarget.filename}</strong>? Any services or portfolio posts using this URL will show a broken image. This operation cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold">Media Library</h2>
        <p className="text-neutral-400 text-xs mt-1">Upload brand images and copy URL coordinates to paste in Portfolio or Services creation sheets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-white">
        
        {/* Upload Form Area */}
        <div className="lg:col-span-4 bg-neutral-950 border border-white/5 p-6 rounded-2xl h-fit space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-400">File uploader</h3>
          
          <form onSubmit={handleUpload} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/15 rounded-xl flex items-center gap-1.5 leading-snug">
                <AlertCircle size={14} className="shrink-0" /> {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl leading-snug">
                {success}
              </div>
            )}

            <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center space-y-3 bg-neutral-900/40">
              <FileImage className="w-10 h-10 text-neutral-500 mx-auto" />
              <div>
                <input 
                  id="media_file_input"
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('media_file_input')?.click()}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold rounded-lg border border-white/5 cursor-pointer text-[11px]"
                >
                  Select static Image
                </button>
              </div>
              <p className="text-[10px] text-neutral-500">JPG, PNG, WEBP, or GIF (max 5MB)</p>
            </div>

            {selectedFile && (
              <div className="p-3.5 bg-neutral-900 rounded-xl flex justify-between items-center">
                <span className="font-mono text-neutral-300 truncate max-w-[200px]">{selectedFile.name}</span>
                <span className="text-[10px] text-neutral-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={uploading || !selectedFile}
              className="w-full py-3 bg-white hover:bg-neutral-200 disabled:opacity-40 text-black font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase"
            >
              {uploading ? 'Writing files...' : 'Send to Library'} <Upload size={14} />
            </button>
          </form>
        </div>

        {/* Gallery List Area */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search tool */}
          <div className="relative">
            <Search className="absolute top-3 left-3 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search uploads by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-white/5 rounded-2xl focus:border-blue-500 text-xs focus:outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredMedia.map((item) => (
              <div key={item.id} className="group bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all flex flex-col justify-between">
                <div className="aspect-square bg-neutral-900/50 relative overflow-hidden flex items-center justify-center">
                  <img src={item.file_url} alt="" className="w-full h-full object-cover" />
                </div>
                
                <div className="p-3.5 space-y-3 border-t border-white/5 bg-black/40">
                  <div className="font-mono text-[10px] text-neutral-400 truncate tracking-tight">{item.filename}</div>
                  
                  <div className="flex gap-2 justify-between">
                    <button 
                      onClick={() => handleCopyLink(item)}
                      className="p-2 bg-neutral-900 hover:bg-neutral-850 rounded-xl text-neutral-300 hover:text-white flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider font-bold shrink-0 cursor-pointer"
                    >
                      {copiedId === item.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedId === item.id ? 'Copied' : 'Copy link'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-2 bg-neutral-900 hover:bg-red-500/15 rounded-xl text-neutral-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredMedia.length === 0 && (
              <div className="col-span-3 text-center py-20 text-neutral-600 font-mono border border-dashed border-neutral-900 rounded-2xl">
                No uploads found in this library directory.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
