import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Portfolio() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const lastFetch = localStorage.getItem('portfolio_list_last_fetch');
    const now = Date.now();
    const CACHE_TTL = 300000; // 5 minutes cache TTL
    
    // Check if we can deliver portfolio data instantly from shared cache
    if (lastFetch && now - parseInt(lastFetch) < CACHE_TTL) {
      const cached = localStorage.getItem('portfolio_list_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
            setFilteredProjects(parsed);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached portfolio list");
        }
      }
    }

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
        if (Array.isArray(data)) {
          setProjects(data);
          setFilteredProjects(data);
          localStorage.setItem('portfolio_list_cache', JSON.stringify(data));
          localStorage.setItem('portfolio_list_last_fetch', now.toString());
        }
      })
      .catch(err => console.warn("Fetch portfolio listing warning:", err.message));
  }, []);

  const filters = ['All', 'Video Editing', 'Motion Graphics', 'Branding Design', 'Graphic Design'];

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'All') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.category === filter));
    }
  };

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-24 relative overflow-hidden bg-dot-matrix">
      {/* Dynamic ambient lights */}
      <div className="absolute top-1/4 right-[5%] w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[140px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-0 w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[110px] -z-10 animate-pulse-medium" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Title Block */}
        <div className="max-w-4xl space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
            <Sparkles size={11} className="text-purple-400" /> Interactive Showreels
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-white leading-none">
            Chronicles of Our <br />
            <span className="text-gradient-rainbow">Creative Excellence.</span>
          </h1>
          <p className="text-neutral-400 text-lg sm:text-xl font-light leading-relaxed max-w-3xl">
            Real campaigns, high-impact parameters. Explore our comprehensive portfolio showcasing how we translate standard design rules into beautiful cinematic milestones.
          </p>
        </div>

        {/* Categories / Filter Options */}
        <div className="flex flex-wrap gap-3 max-w-4xl pt-4 border-t border-white/5">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => handleFilter(filter)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-300 border ${
                  isActive 
                    ? 'bg-white border-white text-neutral-950 font-bold shadow-lg shadow-white/5' 
                    : 'bg-neutral-900/40 border-white/5 text-neutral-400 hover:text-white hover:border-white/10 hover:bg-neutral-900/80'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Gallery Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((item, idx) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="group relative bg-neutral-900/30 glass-card rounded-2xl overflow-hidden hover:border-purple-500/30 active:scale-[0.99] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail frame container */}
                  <div className="relative aspect-video overflow-hidden border-b border-white/5">
                    <img 
                      src={item.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600'} 
                      alt={item.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent" />
                    
                    {item.video_url && (
                      <div className="absolute top-4 right-4 w-9 h-9 bg-neutral-950/80 backdrop-blur-md rounded-full flex items-center justify-center text-red-400 shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                      </div>
                    )}
                    
                    {/* Badge Category */}
                    <span className="absolute bottom-4 left-4 px-3 py-1 bg-neutral-950/80 backdrop-blur-md text-[10px] font-mono tracking-widest text-neutral-300 uppercase rounded-full border border-white/5">
                      {item.category}
                    </span>
                  </div>
                  
                  <div className="p-7 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">{item.title}</h3>
                      <div className="text-[11px] text-neutral-450 text-neutral-500 font-mono">Client: <span className="font-semibold text-neutral-300">{item.client_name || 'Studio Partner'}</span></div>
                    </div>
                    <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3 font-light">{item.description}</p>
                  </div>
                </div>

                <div className="p-7 pt-0">
                  <Link to={`/portfolio/${item.id}`} className="inline-flex items-center text-xs font-bold font-mono tracking-wider text-white gap-2 group-hover:text-purple-400 transition-colors">
                    CASE STUDY <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-350" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <div className="col-span-3 text-center py-24 text-neutral-500 border border-dashed border-neutral-900 rounded-2xl bg-neutral-900/10">
              No matching showcase assets found under this filter.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
