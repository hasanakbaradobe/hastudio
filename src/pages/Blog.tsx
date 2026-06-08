import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
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
      .catch(err => console.warn("Fetch blog warning:", err.message));
  }, []);

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-24 relative overflow-hidden bg-dot-matrix bg-grid">
      {/* Dynamic ambient lights */}
      <div className="absolute top-1/4 right-[5%] w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[140px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/3 left-0 w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[110px] -z-10 animate-pulse-medium" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Editorial Header */}
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
            <Sparkles size={11} className="text-blue-400" /> Editorial Insights
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-white leading-none">
            HA Studio Journal & <br />
            <span className="text-gradient-rainbow">Technical Deep Dives.</span>
          </h1>
          <p className="text-neutral-400 text-lg sm:text-xl font-light leading-relaxed max-w-3xl">
            Sincere deep-dives into raw motion graphics engines, color grading algorithms, typography pairings, and modern web graphics. Written directly by our design leads.
          </p>
        </div>

        {/* Editorial Journal list Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 border-t border-white/5">
          {posts.map((post) => {
            let tags: string[] = [];
            try {
              tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []);
            } catch {
              tags = [];
            }

            return (
              <div key={post.id} className="group bg-neutral-900/30 glass-card rounded-2xl overflow-hidden hover:border-white/10 transition-all flex flex-col justify-between border border-white/5">
                <div>
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img 
                      src={post.featured_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600'} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-neutral-950/20" />
                  </div>

                  <div className="p-7 space-y-4">
                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tg) => (
                          <span key={tg} className="inline-flex items-center text-[9px] font-mono tracking-widest font-bold bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-full border border-white/5 uppercase">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className="text-xl font-bold leading-snug text-white group-hover:text-blue-400 transition-colors duration-350">
                      {post.title}
                    </h2>
                    
                    <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3 font-light">
                      {post.content}
                    </p>
                  </div>
                </div>

                <div className="p-7 pt-0">
                  <Link 
                    to={`/blog/${post.slug}`} 
                    className="inline-flex items-center text-xs font-bold tracking-wider text-white group-hover:text-blue-400 transition-colors font-mono uppercase gap-2"
                  >
                    READ ARTICLE <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            );
          })}

          {posts.length === 0 && (
            <div className="col-span-3 text-center py-20 text-neutral-500 border border-dashed border-neutral-900 rounded-2xl bg-neutral-900/10">
              No journal articles posted yet. Connect Admin to start publishing.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
