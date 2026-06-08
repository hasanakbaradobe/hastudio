import React, { useEffect, useState } from 'react';
import { Save, Check, RefreshCw, KeyRound, Mail, Lock, Image, Type, Upload, AlertCircle } from 'lucide-react';

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<Record<string, string>>({
    logo: 'HA Studio',
    logo_type: 'text',
    logo_image: '',
    logo_height: '32',
    email: 'contact@hastudio.com',
    phone: '+1 (800) 555-0100',
    address: 'Silicon Valley, California',
    seo_description: 'Creative design partner editing video showreels, motion clips and web assets.'
  });

  const [loading, setLoading] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  // Logo uploader state variables
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFileError, setLogoFileError] = useState<string | null>(null);
  const [logoFileSuccess, setLogoFileSuccess] = useState<string | null>(null);

  // Admin Account Credentials State
  const [adminEmail, setAdminEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [credError, setCredError] = useState<string | null>(null);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);
  const [updatingCreds, setUpdatingCreds] = useState(false);

  const loadSettings = () => {
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadSettings();

    // Fetch administrator email from /api/auth/me
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        if (data && data.user && data.user.email) {
          setAdminEmail(data.user.email);
        }
      })
      .catch(console.error);
    }
  }, []);

  const handleSave = async (key: string, value: string) => {
    setLoading(true);
    setSavedKey(null);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key, value })
      });
      if (response.ok) {
        setSavedKey(key);
        // Sync with localStorage cached logo details instantly
        if (key === 'logo') {
          localStorage.setItem('logo_text', value);
        } else if (key === 'logo_type' || key === 'logo_image' || key === 'logo_height') {
          localStorage.setItem(key, value);
        } else if (key === 'email') {
          localStorage.setItem('company_email', value);
        } else if (key === 'phone') {
          localStorage.setItem('company_phone', value);
        } else if (key === 'address') {
          localStorage.setItem('company_address', value);
        }
        // Fade save indicator after 2s
        setTimeout(() => setSavedKey(null), 2000);
      } else {
        alert("Failed to modify key settings.");
      }
    } catch {
      alert("Error.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDirect = async (key: string, value: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key, value })
      });
      // Sync with localStorage cached logo details instantly
      if (key === 'logo') {
        localStorage.setItem('logo_text', value);
      } else if (key === 'logo_type' || key === 'logo_image' || key === 'logo_height') {
        localStorage.setItem(key, value);
      } else if (key === 'email') {
        localStorage.setItem('company_email', value);
      } else if (key === 'phone') {
        localStorage.setItem('company_phone', value);
      } else if (key === 'address') {
        localStorage.setItem('company_address', value);
      }
    } catch (e) {
      console.error("Failed to update logo property synchronously:", e);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoFileError(null);
    setLogoFileSuccess(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setLogoFileError("Logo image size cannot exceed 2MB.");
        return;
      }
      setUploadingLogo(true);
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const data = await response.json();
        if (response.ok && data.file_url) {
          // Update setting state
          setSettings(prev => ({ ...prev, logo_image: data.file_url }));
          // Instantly save this configuration to db
          await handleSaveDirect('logo_image', data.file_url);
          setLogoFileSuccess("Logo image uploaded and updated successfully!");
        } else {
          setLogoFileError(data.error || "Failed to upload logo.");
        }
      } catch (err) {
        setLogoFileError("Error connection to uploader APIs.");
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);

    if (!adminEmail) {
      setCredError("Admin email cannot be empty.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setCredError("New password and confirm password do not match.");
      return;
    }

    if (!currentPassword) {
      setCredError("Please enter your current password to authorize changes.");
      return;
    }

    setUpdatingCreds(true);
    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch('/api/auth/update-credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: adminEmail,
          password: newPassword || undefined,
          currentPassword
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to upgrade administrator credentials.");
      }

      setCredSuccess(resData.message || "Administrator credentials upgraded successfully.");

      // Store the upgraded authorization token
      if (resData.token) {
        localStorage.setItem('adminToken', resData.token);
      }

      // Reset sensitive fields
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      setCredError(err.message || "Server error submitting changes.");
    } finally {
      setUpdatingCreds(false);
    }
  };

  return (
    <div className="space-y-10 max-w-3xl">
      
      {/* SECTION 1: GENERAL SYSTEM SETTINGS */}
      <div className="space-y-6">
        <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold">General Studio Settings</h2>
          <p className="text-neutral-400 text-xs mt-1">Configure global branding variables dynamically persisted in website settings SQL table.</p>
        </div>

        <div className="p-8 bg-neutral-950 border border-white/5 rounded-2xl space-y-6 text-xs text-white">
          
          {/* Brand Logo Configuration */}
          <div className="space-y-4 border-b border-white/5 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                Brand Logo Identity Type
              </label>
              
              {/* Choice Selectors */}
              <div className="flex bg-neutral-900 p-1 rounded-xl border border-white/5 w-fit">
                <button
                  type="button"
                  onClick={async () => {
                    setSettings(prev => ({ ...prev, logo_type: 'text' }));
                    await handleSaveDirect('logo_type', 'text');
                  }}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                    (settings.logo_type || 'text') === 'text'
                      ? 'bg-blue-500 text-neutral-950 font-black shadow-md shadow-blue-500/15'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Type size={12} />
                  Text Logo
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setSettings(prev => ({ ...prev, logo_type: 'image' }));
                    await handleSaveDirect('logo_type', 'image');
                  }}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                    settings.logo_type === 'image'
                      ? 'bg-blue-500 text-neutral-950 font-black shadow-md shadow-blue-500/15'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Image size={12} />
                  Picture Logo
                </button>
              </div>
            </div>

            {/* If Text Logo type is active */}
            {(settings.logo_type || 'text') === 'text' && (
              <div className="space-y-2 bg-neutral-900/40 p-5 rounded-2xl border border-white/5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">Header Typography Logo Text</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={settings.logo || ''}
                    placeholder="e.g. HA.STUDIO"
                    onChange={e => setSettings({ ...settings, logo: e.target.value })}
                    className="px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-blue-500 text-xs max-w-sm w-full font-bold text-white focus:outline-none placeholder-neutral-600" 
                  />
                  <button 
                    onClick={() => handleSave('logo', settings.logo)}
                    className="px-4 py-2.5 bg-white text-black font-extrabold rounded-xl text-xs hover:bg-neutral-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={13} /> {savedKey === 'logo' ? 'Updated!' : 'Save text logo'}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500 leading-relaxed font-light font-sans">
                  Tip: Inserting a dot (e.g. <span className="font-mono text-neutral-450">HA.STUDIO</span> or <span className="font-mono text-neutral-450">DESIGN.CO</span>) will automatically style the extension text with a striking <span className="text-blue-500 font-bold">blue highlights hue</span> on your public layouts.
                </p>
              </div>
            )}

            {/* If Picture Logo type is active */}
            {settings.logo_type === 'image' && (
              <div className="space-y-4 bg-neutral-900/40 p-5 rounded-2xl border border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Direct Upload Zone */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">Upload Logo Graphic File</label>
                    <div className="border border-dashed border-white/15 rounded-xl p-4 text-center space-y-2 bg-neutral-950/20 hover:border-white/20 transition-all">
                      <Upload className="w-6 h-6 text-neutral-500 mx-auto" />
                      <div>
                        <input 
                          id="logo_image_uploader"
                          type="file" 
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden" 
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('logo_image_uploader')?.click()}
                          disabled={uploadingLogo}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 disabled:opacity-50 text-neutral-300 font-semibold rounded-lg border border-white/5 cursor-pointer text-[10px] uppercase tracking-wider font-mono font-bold"
                        >
                          {uploadingLogo ? 'Writing File...' : 'Select File'}
                        </button>
                      </div>
                      <p className="text-[9px] text-neutral-500">Supports PNG, SVG, JPG, WEBP (max 2MB)</p>
                    </div>

                    {logoFileError && (
                      <p className="text-[10px] text-red-400 font-mono flex items-center gap-1 leading-snug"><AlertCircle size={10} className="shrink-0" /> {logoFileError}</p>
                    )}
                    {logoFileSuccess && (
                      <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 leading-snug"><Check size={10} className="shrink-0" /> {logoFileSuccess}</p>
                    )}
                  </div>

                  {/* Right Column: Custom URL or Current Image Preview */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">Direct URL Address / Value</label>
                      <div className="flex gap-2 mt-1">
                        <input 
                          type="text" 
                          placeholder="e.g. /uploads/image.png"
                          value={settings.logo_image || ''}
                          onChange={e => setSettings({ ...settings, logo_image: e.target.value })}
                          className="px-2.5 py-2 bg-neutral-900 border border-white/10 rounded-xl focus:border-blue-500 text-xs flex-1 focus:outline-none font-mono text-neutral-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleSave('logo_image', settings.logo_image)}
                          className="px-3 bg-white text-black font-extrabold rounded-xl text-xs hover:bg-neutral-200 cursor-pointer flex items-center shrink-0"
                          title="Save Custom URL"
                        >
                          <Save size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-950 border border-white/5 rounded-xl space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-neutral-500 block font-mono">Active Stamp Preview</label>
                      {settings.logo_image ? (
                        <div className="bg-neutral-900 rounded-lg p-2 flex items-center justify-center border border-white/5 h-16">
                          <img 
                            src={settings.logo_image} 
                            alt="Logo preview" 
                            style={{ height: `${Number(settings.logo_height || 32)}px` }}
                            className="max-h-14 max-w-full object-contain" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="text-[10px] text-neutral-600 font-mono flex items-center justify-center h-16 border border-dashed border-neutral-900 rounded-lg">
                          No Image Logo Selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sizing controller slider block */}
                <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">
                      Logo Height Size (in pixels)
                    </label>
                    <span className="font-mono text-[10px] bg-neutral-900 border border-white/10 px-2.5 py-0.5 rounded text-blue-400 font-extrabold font-mono">
                      {settings.logo_height || '32'}px
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range"
                      min="16"
                      max="80"
                      step="2"
                      value={settings.logo_height || '32'}
                      onChange={e => {
                        const val = e.target.value;
                        setSettings(prev => ({ ...prev, logo_height: val }));
                      }}
                      onMouseUp={() => handleSaveDirect('logo_height', settings.logo_height || '32')}
                      onTouchEnd={() => handleSaveDirect('logo_height', settings.logo_height || '32')}
                      className="flex-1 accent-blue-500 h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer"
                    />
                    <button 
                      type="button"
                      onClick={() => handleSave('logo_height', settings.logo_height || '32')}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-semibold rounded-lg border border-white/5 cursor-pointer text-[10px] uppercase tracking-wider font-mono font-bold shrink-0 flex items-center gap-1"
                    >
                      <Save size={10} /> {savedKey === 'logo_height' ? 'Saved' : 'Save Size'}
                    </button>
                  </div>
                  <p className="text-[9px] text-neutral-500 font-sans tracking-wide">
                    Slide helper bar to adjust and click Save or release cursor to apply your desired sizing inside branding areas.
                  </p>
                </div>

              </div>
            )}
          </div>

          {/* Support email */}
          <div className="space-y-2 border-b border-white/5 pb-6">
            <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Contact Email</label>
            <div className="flex gap-4">
              <input 
                type="email" 
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-blue-500 text-xs max-w-sm w-full focus:outline-none font-mono" 
              />
              <button 
                onClick={() => handleSave('email', settings.email)}
                className="px-4 py-2.5 bg-white text-black font-extrabold rounded-xl text-xs hover:bg-neutral-200 cursor-pointer flex items-center gap-1.5"
              >
                <Save size={13} /> {savedKey === 'email' ? 'Updated!' : 'Save changes'}
              </button>
            </div>
          </div>

          {/* Marketing support calls phone */}
          <div className="space-y-2 border-b border-white/5 pb-6">
            <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Customer phone Line</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-blue-500 text-xs max-w-sm w-full focus:outline-none font-mono" 
              />
              <button 
                onClick={() => handleSave('phone', settings.phone)}
                className="px-4 py-2.5 bg-white text-black font-extrabold rounded-xl text-xs hover:bg-neutral-200 cursor-pointer flex items-center gap-1.5"
              >
                <Save size={13} /> {savedKey === 'phone' ? 'Updated!' : 'Save phone'}
              </button>
            </div>
          </div>

          {/* Corporate Physical Address */}
          <div className="space-y-2 border-b border-white/5 pb-6">
            <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Corporate Physical Address / Headquarters</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={settings.address || ''}
                placeholder="e.g. Silicon Valley, California"
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-blue-500 text-xs max-w-sm w-full focus:outline-none font-mono" 
              />
              <button 
                onClick={() => handleSave('address', settings.address || '')}
                className="px-4 py-2.5 bg-white text-black font-extrabold rounded-xl text-xs hover:bg-neutral-200 cursor-pointer flex items-center gap-1.5"
              >
                <Save size={13} /> {savedKey === 'address' ? 'Updated!' : 'Save address'}
              </button>
            </div>
          </div>

          {/* Global SEO indexing descriptor */}
          <div className="space-y-2 pb-2">
            <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Corporate Google SEO description snippet</label>
            <div className="flex gap-4 items-start">
              <textarea 
                rows={3}
                value={settings.seo_description}
                onChange={e => setSettings({ ...settings, seo_description: e.target.value })}
                className="px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl focus:border-blue-500 text-xs flex-1 text-white focus:outline-none leading-relaxed" 
              />
              <button 
                onClick={() => handleSave('seo_description', settings.seo_description)}
                className="px-4 py-2.5 bg-white text-black font-extrabold rounded-xl text-xs hover:bg-neutral-200 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Save size={13} /> {savedKey === 'seo_description' ? 'Updated!' : 'Save Changes'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: ADMINISTRATOR LOGIN CREDENTIALS SECURITY */}
      <div className="space-y-6">
        <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold flex items-center gap-2"><KeyRound className="text-blue-500 w-5 h-5" /> Admin Security Settings</h2>
        </div>

        <form onSubmit={handleUpdateCredentials} className="p-8 bg-neutral-950 border border-white/15 rounded-2xl space-y-6 text-xs text-white">
          
          {credSuccess && (
            <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono rounded-xl">
              {credSuccess}
            </div>
          )}

          {credError && (
            <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono rounded-xl">
              {credError}
            </div>
          )}

          {/* Admin Email Input */}
          <div className="space-y-2 border-b border-white/5 pb-6">
            <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Administrator email address *</label>
            <div className="relative max-w-sm">
              <input 
                type="email" 
                required
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-blue-500 text-xs w-full focus:outline-none font-mono text-white font-bold" 
                placeholder="admin@hastudio.com"
              />
            </div>
          </div>

          {/* Passwords Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-white/5 pb-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">New password (optional)</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-blue-500 text-xs w-full focus:outline-none font-mono text-white" 
                placeholder="••••••••"
              />
              <span className="text-[9px] text-neutral-500 block font-light">Leave blank to keep existing password</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Confirm new password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-blue-500 text-xs w-full focus:outline-none font-mono text-white" 
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Current Password validation */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-wider text-red-400 block font-bold">Verify Identity: Current password *</label>
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="px-3 py-2.5 bg-neutral-900 border border-red-500/30 rounded-xl focus:border-red-500 text-xs max-w-sm w-full focus:outline-none font-mono text-white" 
                placeholder="Enter current password"
              />
            </div>

            <button 
              type="submit"
              disabled={updatingCreds}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-neutral-900 hover:text-black font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 duration-300 shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {updatingCreds ? 'Authenticating & Saving...' : 'Save credentials'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
