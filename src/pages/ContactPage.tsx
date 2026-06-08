import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, AlertCircle, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  useEffect(() => {
    const initialService = searchParams.get('service');
    const initialPackage = searchParams.get('package');
    if (initialService || initialPackage) {
      setFormData(prev => ({
        ...prev,
        subject: initialService ? `${initialService} Engagement` : 'General Inquiry',
        message: initialPackage 
          ? `Hello, I'm reaching out to inquire about the "${initialPackage}" pricing bracket/package for your "${initialService || 'Service'}" deliverables. Here is our project context:\n\n` 
          : prev.message
      }));
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState(() => {
    return {
      email: localStorage.getItem('company_email') || 'contact@hastudio.com',
      phone: localStorage.getItem('company_phone') || '+1 (800) 555-0100',
      address: localStorage.getItem('company_address') || 'Silicon Valley, California'
    };
  });

  useEffect(() => {
    const lastFetch = localStorage.getItem('settings_last_fetch');
    const now = Date.now();
    // Use cached values if fetched within the last 5 minutes (300000ms), avoiding redundant API calls
    if (lastFetch && now - parseInt(lastFetch) < 300000) {
      const email = localStorage.getItem('company_email');
      const phone = localStorage.getItem('company_phone');
      const address = localStorage.getItem('company_address');
      if (email && phone && address) {
        setSettings(prev => ({
          email: email || prev.email,
          phone: phone || prev.phone,
          address: address || prev.address
        }));
        return;
      }
    }

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
        if (data && typeof data === 'object') {
          setSettings(prev => ({
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            address: data.address || prev.address
          }));
          localStorage.setItem('settings_last_fetch', now.toString());
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to submit project inquiry.");
      }
      setSuccess(resData.message || "Your project brief has been received!");
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Let's try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-24 relative overflow-hidden bg-dot-matrix">
      {/* Background visual layers */}
      <div className="absolute top-1/4 right-[5%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[130px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-5 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] -z-10 animate-pulse-medium" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Title / Header */}
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
            <Sparkles size={11} className="text-emerald-400 animate-spin-slow" /> Start Sprints
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-white leading-none">
            Secure Consultation & <br />
            <span className="text-gradient-rainbow">Initiate Live Brief.</span>
          </h1>
          <p className="text-neutral-400 text-lg sm:text-xl font-light leading-relaxed max-w-3xl">
            Ready to design or edit the next big cinematic benchmark? Give our principal studio directors a complete brief outlining target channels, raw deliverables, and deadlines.
          </p>
        </div>

        {/* Split info column & form column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Info Panels Column */}
          <div className="lg:col-span-5 space-y-8">
            
            <div className="p-8 backdrop-blur-md bg-neutral-900/40 glass-panel rounded-2xl border border-white/5 space-y-8 shadow-xl">
              <h3 className="text-xl font-bold tracking-tight text-white border-b border-white/5 pb-4">Studio Coordinates</h3>
              
              <div className="space-y-6 text-sm">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-neutral-950 rounded-xl flex items-center justify-center text-blue-400 border border-white/10 shrink-0 shadow-md">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Secure Email</span>
                    <a href={`mailto:${settings.email}`} className="hover:text-blue-400 font-semibold transition-colors text-white">{settings.email}</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-neutral-950 rounded-xl flex items-center justify-center text-blue-400 border border-white/10 shrink-0 shadow-md">
                    <Phone className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Direct Lines</span>
                    <a href={`tel:${settings.phone}`} className="hover:text-blue-400 font-semibold transition-colors text-white">{settings.phone}</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-neutral-950 rounded-xl flex items-center justify-center text-blue-400 border border-white/10 shrink-0 shadow-md">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Headquarters</span>
                    <span className="text-neutral-300 font-medium">{settings.address}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 backdrop-blur-md bg-neutral-900/40 glass-panel rounded-2xl border border-white/5 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-white">Campaign Checklist</h3>
              <ul className="space-y-3.5 text-neutral-400 text-xs leading-relaxed font-mono">
                <li className="flex items-center gap-2 text-neutral-300">
                  <span className="text-emerald-400 font-bold">✓</span> Vector brand assets & logo templates
                </li>
                <li className="flex items-center gap-2 text-neutral-300">
                  <span className="text-emerald-400 font-bold">✓</span> Real raw footages uploaded on cloud servers
                </li>
                <li className="flex items-center gap-2 text-neutral-300">
                  <span className="text-emerald-400 font-bold">✓</span> Concept guidelines and visual mood boards
                </li>
              </ul>
            </div>

          </div>

          {/* Form Card */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="p-10 bg-neutral-900/40 glass-card rounded-2xl space-y-8 border border-white/5 shadow-2xl relative">
              <h3 className="text-2xl font-bold tracking-tight text-white pb-4 border-b border-white/5">Project Specifications</h3>
              
              {success && (
                <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono rounded-xl animate-fade-in">
                  {success}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono rounded-xl flex items-center gap-2">
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="contact_name" className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Your Full name *</label>
                  <input 
                    id="contact_name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 bg-neutral-950/70 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all text-sm text-white"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contact_email" className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Direct Email *</label>
                  <input 
                    id="contact_email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3.5 bg-neutral-950/70 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all text-sm text-white"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact_subject" className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Campaign Scope</label>
                <select
                  id="contact_subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3.5 bg-neutral-950/70 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-sm text-white"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Video Editing Proposal">Video Editing Proposal</option>
                  <option value="Motion Graphics Concept">Motion Graphics Concept</option>
                  <option value="Custom Software Stack">Custom Software Stack</option>
                  <option value="Other Campaign">Other Campaign</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact_message" className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Specific Goals & Brief *</label>
                <textarea
                  id="contact_message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3.5 bg-neutral-950/70 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all text-sm text-white font-light leading-relaxed"
                  placeholder="Outline media length details, style directions, cloud folder references, budgets, or desired timeline goals..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 bg-white hover:bg-neutral-200 text-neutral-950 font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-white/5 active:scale-[0.99]"
              >
                {loading ? 'Transmitting brief...' : 'Transmit Project Brief'} <Send size={13} />
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
