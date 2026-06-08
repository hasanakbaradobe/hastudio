import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, ArrowRight, Sparkles } from 'lucide-react';

export default function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState<any | null>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const now = Date.now();
    const CACHE_TTL = 300000; // 5 minutes cache TTL
    const lastFetchStr = localStorage.getItem(`service_detail_slug_last_fetch_${slug}`);
    
    // Attempt instant retrieval from disk cache
    if (lastFetchStr && now - parseInt(lastFetchStr) < CACHE_TTL) {
      const cachedStr = localStorage.getItem(`service_detail_slug_cache_${slug}`);
      if (cachedStr) {
        try {
          const cachedData = JSON.parse(cachedStr);
          if (cachedData && cachedData.slug === slug) {
            setService(cachedData);
            if (cachedData.faqs && Array.isArray(cachedData.faqs) && cachedData.faqs.length > 0) {
              setFaqs(cachedData.faqs);
            } else {
              setFaqs([
                { id: 1, question: 'What is the standard delivery file type?', answer: 'We deliver ultra-high fidelity raw Apple ProRes, matching H.264/H.265 files, or web-optimized MP4 outputs depending on distribution targets.' },
                { id: 2, question: 'Do you offer feedback iterations?', answer: 'Yes, each creative project includes up to three structured revision iterations to ensure complete alignment with your guidelines.' },
                { id: 3, question: 'What raw specifications do we need to provide?', answer: 'We will send a welcome onboarding checklist requesting raw film reels, brand vector layouts, styling sheets, or references.' }
              ]);
            }
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed parsing cached detail by slug", e);
        }
      }
    }

    fetch(`/api/services/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        setService(data);
        localStorage.setItem(`service_detail_slug_cache_${slug}`, JSON.stringify(data));
        localStorage.setItem(`service_detail_slug_last_fetch_${slug}`, now.toString());

        if (data && data.faqs && Array.isArray(data.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs);
        } else {
          // Default FAQs
          setFaqs([
            { id: 1, question: 'What is the standard delivery file type?', answer: 'We deliver ultra-high fidelity raw Apple ProRes, matching H.264/H.265 files, or web-optimized MP4 outputs depending on distribution targets.' },
            { id: 2, question: 'Do you offer feedback iterations?', answer: 'Yes, each creative project includes up to three structured revision iterations to ensure complete alignment with your guidelines.' },
            { id: 3, question: 'What raw specifications do we need to provide?', answer: 'We will send a welcome onboarding checklist requesting raw film reels, brand vector layouts, styling sheets, or references.' }
          ]);
        }
      })
      .catch(err => {
         console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center text-white font-mono">
        <div className="animate-pulse text-xs tracking-widest uppercase font-bold text-blue-400">Fetching service deliverables...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="bg-neutral-950 min-h-screen text-center py-32 text-white bg-dot-matrix">
        <h2 className="text-3xl font-black mb-4">Service Not Found</h2>
        <Link to="/services" className="text-blue-500 hover:underline">Return to services index</Link>
      </div>
    );
  }

  let features: string[] = [];
  try {
    features = typeof service.features === 'string' ? JSON.parse(service.features) : (service.features || []);
  } catch {
    features = [];
  }

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-24 relative overflow-hidden bg-dot-matrix bg-grid">
      {/* Background radial blurs */}
      <div className="absolute top-1/4 right-[5%] w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[140px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-5 w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[110px] -z-10" />

      <div className="max-w-4xl mx-auto px-4 space-y-12">
        
        {/* Back link button */}
        <Link to="/services" className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-neutral-400 hover:text-white transition-colors uppercase">
          <ArrowLeft className="w-4 h-4" /> &lt; Services Index
        </Link>

        {/* Hero Area header */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono tracking-widest uppercase rounded-full font-bold">
            <Sparkles size={11} className="text-blue-400" /> Deliverables deep-dive
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter text-white leading-none">{service.title}</h1>
          <p className="text-neutral-405 text-lg leading-relaxed text-neutral-400 font-light">{service.description}</p>
        </div>

        {/* Image showcase screen */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl">
          <img 
            src={service.featured_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200'} 
            alt={service.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover" 
          />
          <div className="absolute bottom-6 right-6 px-5 py-2.5 bg-neutral-950/90 backdrop-blur-md rounded-full font-bold font-mono text-xs text-blue-400 border border-white/10 shadow-lg">
            Est. Price: {service.pricing || 'Custom Calculation'}
          </div>
        </div>

        {/* Deliverables specs block */}
        {features.length > 0 && (
          <div className="border border-white/5 bg-neutral-900/30 glass-panel rounded-2xl p-10 space-y-8 shadow-xl">
            <h3 className="text-[10px] font-bold font-mono uppercase tracking-widest text-neutral-400">Core deliverable specs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map((feat) => (
                <div key={feat} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/15">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-neutral-300 text-sm font-mono">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tiered Pricing Packages */}
        {service.packages && service.packages.length > 0 && (
          <div className="space-y-8 pt-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono tracking-widest uppercase rounded-full font-bold">
                Flexible Tiers
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-white font-display">Pricing & Packaging Brackets</h2>
              <p className="text-neutral-400 text-sm max-w-xl font-light leading-relaxed">
                Choose custom creative tiers configured to scale with your delivery constraints, assets, and schedule rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {service.packages.map((pkg: any) => {
                const isPopular = pkg.badge && (pkg.badge.toLowerCase().includes('popular') || pkg.badge.toLowerCase().includes('best value'));
                return (
                  <div 
                    key={pkg.id} 
                    className={`relative bg-neutral-900/40 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 hover:-translate-y-1 ${
                      isPopular 
                        ? 'border-blue-500/50 shadow-2xl shadow-blue-500/10 bg-gradient-to-b from-blue-950/20 to-neutral-900/40' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    {pkg.badge && (
                      <span className={`absolute -top-3 left-6 px-3 py-1 text-[9px] font-mono tracking-widest font-extrabold uppercase rounded-full shadow-lg ${
                        isPopular 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-neutral-800 text-neutral-300 border border-white/5'
                      }`}>
                        {pkg.badge}
                      </span>
                    )}

                    <div className="space-y-5">
                      <div className="pt-2">
                        <h4 className="text-lg font-bold text-white tracking-tight">{pkg.name}</h4>
                        <p className="text-xs text-neutral-400 font-light mt-1.5 leading-relaxed min-h-[36px]">{pkg.description}</p>
                      </div>

                      <div className="border-t border-b border-white/5 py-4 my-2 shrink-0">
                        <span className="text-3xl font-extrabold text-white tracking-tight">{pkg.price}</span>
                        <span className="text-neutral-500 text-[10px] uppercase tracking-wider font-bold ml-1.5">Est.</span>
                      </div>

                      <div className="space-y-2.5">
                        <p className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 font-mono">What's standard</p>
                        <ul className="space-y-2 text-neutral-300 text-xs">
                          {pkg.features && Array.isArray(pkg.features) && pkg.features.map((feat: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 leading-relaxed">
                              <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6 mt-4">
                      <Link 
                        to={`/contact?service=${encodeURIComponent(service.title)}&package=${encodeURIComponent(pkg.name)}`}
                        className={`w-full py-2.5 text-center transition-all flex items-center justify-center gap-1.5 rounded-xl text-[10px] font-bold font-mono tracking-widest uppercase ${
                          isPopular 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                        }`}
                      >
                        Inquire Tier <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQs */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-white font-display">Got Questions? Read FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-8 backdrop-blur-md bg-neutral-900/30 glass-panel rounded-2xl border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-base tracking-tight">{faq.question}</h4>
                <p className="text-neutral-450 text-sm leading-relaxed text-neutral-400 font-light">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Mini Card panel */}
        <div className="border border-blue-500/10 bg-neutral-900/30 glass-panel p-10 rounded-2xl text-center space-y-6 shadow-2xl relative">
          <h3 className="text-2xl font-bold tracking-tight text-white font-display">Inquire about {service.title}</h3>
          <p className="text-neutral-450 text-sm max-w-xl mx-auto font-light text-neutral-400 leading-relaxed">
            Ready to schedule creative sprints or sync up with our team? Drop us an outline or guidelines now.
          </p>
          <div className="pt-2">
            <Link to="/contact" className="px-8 py-3.5 bg-white text-neutral-950 font-extrabold rounded-full hover:bg-neutral-200 transition-all shadow-xl shadow-white/5 hover:scale-105 active:scale-95 duration-300 inline-flex items-center gap-1.5 uppercase text-xs tracking-wider font-mono">
              Book Briefing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
