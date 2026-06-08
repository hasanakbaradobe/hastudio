import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, Zap, Award, Sparkles } from 'lucide-react';

export default function About() {
  const [team, setTeam] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    // Clients list
    setClients([
      { company: 'Aether Retail', industry: 'Skincare' },
      { company: 'CyberX Labs', industry: 'Quantum Computing' },
      { company: 'Chronos Wear', industry: 'Logistics' },
      { company: 'Starlight NFT', industry: 'Metaverse' }
    ]);

    // Fetch team members from backend API dynamically
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
        if (Array.isArray(data) && data.length > 0) {
          setTeam(data);
        } else {
          setTeam([
            { name: "Harry Akber", role: "Founder & Creative Director", bio: "With over 12 years of core motion design and video editing authority globally.", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200" },
            { name: "Amelia Dupont", role: "Director of Motion Graphics", bio: "An absolute pioneer in kinetic corporate ads and luxury aesthetic overlays.", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200" }
          ]);
        }
      })
      .catch(() => {
        setTeam([
          { name: "Harry Akber", role: "Founder & Creative Director", bio: "With over 12 years of core motion design and video editing authority globally.", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200" },
          { name: "Amelia Dupont", role: "Director of Motion Graphics", bio: "An absolute pioneer in kinetic corporate ads and luxury aesthetic overlays.", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200" }
        ]);
      });
  }, []);

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-24 relative overflow-hidden bg-dot-matrix">
      {/* Background visual gradients */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        
        {/* Intro Story */}
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
            <Sparkles size={11} className="animate-pulse" /> Our Core Thesis
          </div>
          <h1 className="text-4xl sm:text-7xl font-bold tracking-tighter text-white leading-none">
            Designed to challenge <br />
            <span className="text-gradient-primary">the ordinary.</span>
          </h1>
          <p className="text-neutral-400 text-lg sm:text-xl leading-relaxed font-light max-w-3xl">
            HA Studio is an internationally aligned design partner. We reject boring layouts, stale presets, and standard low-vibe templates. Everything we produce is custom, bespoke, and tailored to evoke deep engagement.
          </p>
        </div>

        {/* Pillars / Value blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 glass-panel rounded-2xl border border-white/5 space-y-4 hover:border-blue-500/20 transition-all duration-300"
          >
            <Zap className="w-10 h-10 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Cinema Pace</h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">
              We match frame rates, sequence durations, and audio transients down to the microsecond level to create flawless momentum.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 glass-panel rounded-2xl border border-white/5 space-y-4 hover:border-emerald-500/20 transition-all duration-300"
          >
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Authentic Styling</h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">
              Your assets should look entirely yours. Custom graphic elements produced from meticulous aesthetic research.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 glass-panel rounded-2xl border border-white/5 space-y-4 hover:border-purple-500/20 transition-all duration-300"
          >
            <Award className="w-10 h-10 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Elite Standards</h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">
              We focus on premium visual metrics that empower fast-scaling business brands to secure key market funding rounds.
            </p>
          </motion.div>
        </div>

        {/* Executive Mindsets */}
        <div className="space-y-16">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-blue-500 uppercase">Meet the Mindset</span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tighter text-white">Executive Leadership</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((mem, index) => (
              <motion.div 
                key={mem.name} 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 glass-card rounded-2xl flex flex-col sm:flex-row gap-8 items-center"
              >
                <img src={mem.photo} alt={mem.name} className="w-24 h-24 rounded-full object-cover shrink-0 border border-white/10 shadow-lg shadow-black/40" />
                <div className="space-y-3 text-center sm:text-left">
                  <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/15">{mem.role}</span>
                  <h3 className="text-2xl font-bold text-white">{mem.name}</h3>
                  <p className="text-neutral-450 text-sm leading-relaxed text-neutral-400 font-light">{mem.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Client Roster list */}
        <div className="space-y-12">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-purple-500 uppercase font-bold">Trusted Network</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white">The Client Roster</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {clients.map((c, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -3, borderColor: 'rgba(255,255,255,0.1)' }}
                className="p-8 bg-neutral-900/30 glass-panel border border-white/5 rounded-2xl text-center space-y-1 transition-all duration-300"
              >
                <div className="font-bold text-white text-lg tracking-tight">{c.company}</div>
                <div className="text-neutral-500 text-xs font-mono uppercase tracking-widest">{c.industry}</div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
