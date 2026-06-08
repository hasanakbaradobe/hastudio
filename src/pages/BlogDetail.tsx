import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Sparkles } from 'lucide-react';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/blog/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        setPost(data);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center text-white font-mono">
        <div className="animate-pulse tracking-widest text-xs uppercase font-bold text-neutral-450 text-blue-400">Unpacking journal thoughts...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-neutral-950 min-h-screen text-center py-32 text-white bg-dot-matrix">
        <h2 className="text-3xl font-black mb-4">Post Not Found</h2>
        <Link to="/blog" className="text-blue-500 hover:underline">Return to journal index</Link>
      </div>
    );
  }

  let tags: string[] = [];
  try {
    tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []);
  } catch {
    tags = [];
  }

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-24 relative overflow-hidden bg-dot-matrix">
      {/* Background gradients */}
      <div className="absolute top-1/4 right-[10%] w-[350px] h-[350px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/3 left-5 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-4xl mx-auto px-4 space-y-12">
        
        {/* Back Link */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-neutral-400 hover:text-white transition-colors uppercase">
          <ArrowLeft className="w-4 h-4" /> &lt; Journal Index
        </Link>

        {/* Header Block and Metadata */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-500">
            <span className="flex items-center gap-1.5"><Calendar size={13} className="text-blue-500" /> {new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><Clock size={13} className="text-blue-500" /> 5 Min Reading Time</span>
            <span className="flex items-center gap-1.5"><User size={13} className="text-blue-500" /> By HA Studio Lead</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter leading-tight text-white">{post.title}</h1>
        </div>

        {/* Featured Image */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
          <img src={post.featured_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200'} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-neutral-950/20" />
        </div>

        {/* Editorial Body */}
        <article className="prose prose-invert max-w-none text-neutral-300 text-base leading-relaxed space-y-8 font-light">
          <p className="border-l-2 border-blue-500 pl-5 italic text-neutral-400 text-lg">
            Establishing structural pacing isn't just about fast editing sequences; it is about carefully managing visual focus points and negative space across modern displays.
          </p>
          <div className="whitespace-pre-wrap leading-relaxed text-neutral-300 space-y-4">{post.content}</div>
        </article>

        {/* Tag blocks */}
        {tags.length > 0 && (
          <div className="pt-8 border-t border-white/5 flex flex-wrap gap-2">
            {tags.map((tg) => (
              <span key={tg} className="px-4 py-1 bg-neutral-900/50 border border-white/10 rounded-full text-xs text-neutral-400 font-mono tracking-wider uppercase">
                #{tg}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
