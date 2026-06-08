import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Target, KeyRound, ThumbsUp, Play, Sparkles } from 'lucide-react';

export default function PortfolioDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/portfolio`)
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
          const found = data.find(p => p.id == id);
          setProject(found || null);
        }
      })
      .catch(err => console.warn("Fetch portfolio item error:", err.message))
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center text-white font-mono">
        <div className="animate-pulse tracking-widest text-xs uppercase text-purple-400">Decompressing Case Study Specs...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-neutral-950 min-h-screen text-center py-32 text-white bg-dot-matrix">
        <h2 className="text-3xl font-black mb-4">Case Study Not Found</h2>
        <Link to="/portfolio" className="text-blue-500 hover:underline">Return to portfolio index</Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-24 relative overflow-hidden bg-dot-matrix bg-grid">
      {/* Background gradients */}
      <div className="absolute top-1/4 right-[5%] w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[140px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/3 left-5 w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-5xl mx-auto px-4 space-y-12">
        
        {/* Back Link */}
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-neutral-400 hover:text-white transition-colors uppercase">
          <ArrowLeft className="w-4 h-4" /> &lt; Exit to portfolio
        </Link>

        {/* Categories Pill / Subtitle */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/5 pb-6">
          <span className="px-4 py-1 bg-purple-500/10 text-purple-400 text-xs font-mono rounded-full border border-purple-500/20 uppercase tracking-widest font-bold">
            {project.category}
          </span>
          <span className="text-xs text-neutral-400 font-mono">Partner: <span className="text-white font-semibold">{project.client_name}</span></span>
        </div>

        {/* Main Title Block */}
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-7xl font-bold tracking-tighter text-white leading-none">{project.title}</h1>
          <p className="text-neutral-450 text-lg leading-relaxed text-neutral-400 font-light max-w-4xl">{project.description}</p>
        </div>

        {/* Thumbnail Screen Container */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 relative bg-neutral-900 shadow-2xl">
          <img 
            src={project.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200'} 
            alt={project.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-neutral-950/30" />
          
          {project.video_url && (
            <a 
              href={project.video_url} 
              target="_blank" 
              rel="noreferrer"
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] hover:bg-black/55 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 bg-white text-neutral-950 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl duration-300">
                <Play className="w-5 h-5 fill-neutral-950 text-neutral-950 ml-1" />
              </div>
            </a>
          )}
        </div>

        {/* Challenge, Solution, Outcome bento boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Challenge Box */}
          <div className="p-8 backdrop-blur-md bg-neutral-900/40 glass-panel rounded-2xl border border-white/5 space-y-4 hover:border-red-500/20 transition-all duration-300">
            <div className="w-11 h-11 bg-red-500/10 border border-red-500/15 text-red-400 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">The Challenge</h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">{project.challenge || "Establish a distinct visual identity matching elite global design tiers."}</p>
          </div>

          {/* Solution Box */}
          <div className="p-8 backdrop-blur-md bg-neutral-900/40 glass-panel rounded-2xl border border-white/5 space-y-4 hover:border-blue-500/20 transition-all duration-300">
            <div className="w-11 h-11 bg-blue-500/10 border border-blue-500/15 text-blue-400 rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">Our Solution</h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">{project.solution || "Formulate cinematic speed curves combined with neon vector grids."}</p>
          </div>

          {/* Result Box */}
          <div className="p-8 backdrop-blur-md bg-neutral-900/40 glass-panel rounded-2xl border border-white/5 space-y-4 hover:border-emerald-500/20 transition-all duration-300">
            <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 rounded-xl flex items-center justify-center">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">The Outcome</h3>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">{project.result || "Achieved immediate funding success due to enhanced investor attention."}</p>
          </div>

        </div>

        {/* Small Project Footer CTA */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h4 className="text-xl font-bold text-white tracking-tight">Inspired by this case study?</h4>
            <p className="text-neutral-500 text-sm">Let HA Studio designers engineer custom matching deliverables for your venture.</p>
          </div>
          <Link to="/contact" className="px-8 py-3.5 bg-white text-neutral-950 font-bold rounded-full hover:bg-neutral-200 transition-all shadow-xl shadow-white/5 hover:scale-105 active:scale-95 duration-300 uppercase text-xs tracking-wider">
            Start Project Sprints
          </Link>
        </div>

      </div>
    </div>
  );
}
