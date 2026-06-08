import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquareCode, ArrowUpRight, Sparkles, Quote, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TestimonialsPage() {
  const [reviews, setReviews] = useState<any[]>([
    {
      id: 1,
      client_name: "Sarah Jenkins",
      company: "CMO, BrightPath Media",
      rating: 5,
      review: "HA Studio transformed our complex visual guidelines into beautiful modern interactive assets. Their attention to sound pacing, transitions, and general digital detail is stellar.",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150"
    },
    {
      id: 2,
      client_name: "Alexander Wright",
      company: "Founder, CyberX Labs",
      rating: 5,
      review: "The rebranding identity delivered exceeded our expectations. The custom layout styles and motion graphics completely elevated our platform launch.",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150"
    },
    {
      id: 3,
      client_name: "Marcus Vance",
      company: "Director of Product, Aether Inc",
      rating: 5,
      review: "Working with HA Studio was a masterclass in collaboration. Their motion layouts and responsive asset designs brought our cosmetic product presentation to life.",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150"
    },
    {
      id: 4,
      client_name: "Elena Rostova",
      company: "VP of Design, Chroma Global",
      rating: 5,
      review: "The fidelity, speed, and timing of the deliverable sequences are second to none. We had tight commercial schedules, and their pipeline handled it flawlessly.",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"
    }
  ]);

  const [activeTestIndex, setActiveTestIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isTestHovered, setIsTestHovered] = useState<boolean>(false);

  // Slideshow auto-advance timer for reviews (2 or more items)
  useEffect(() => {
    if (reviews.length < 2 || isTestHovered) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveTestIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length, isTestHovered]);

  useEffect(() => {
    const lastFetch = localStorage.getItem('testimonials_list_last_fetch');
    const now = Date.now();
    const CACHE_TTL = 300000; // 5 minutes cache TTL

    if (lastFetch && now - parseInt(lastFetch) < CACHE_TTL) {
      const cached = localStorage.getItem('testimonials_list_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReviews(parsed);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached testimonials list");
        }
      }
    }

    fetch('/api/testimonials')
      .then(res => {
        if (!res.ok) throw new Error("Fetch failed with status: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Invalid response content type");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
          localStorage.setItem('testimonials_list_cache', JSON.stringify(data));
          localStorage.setItem('testimonials_list_last_fetch', now.toString());
        }
      })
      .catch(err => console.warn("Fetch testimonials warning:", err.message));
  }, []);

  return (
    <div className="bg-neutral-950 text-white min-h-screen py-24 relative overflow-hidden bg-dot-matrix">
      {/* Background gradients */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[130px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[110px] -z-10 animate-pulse-medium" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Approvals Header */}
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
            <Sparkles size={11} className="text-emerald-400 animate-spin-slow" /> Aesthetic Approvals
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-white leading-none">
            Voice of Our <br />
            <span className="text-gradient-rainbow">Strategic Partners.</span>
          </h1>
          <p className="text-neutral-400 text-lg sm:text-xl font-light leading-relaxed max-w-3xl">
            See feedback highlights from digital founders, corporate creative officers, and high-performance product teams who let HA Studio deliver high-contrast premium results.
          </p>
        </div>

        {/* Testimonials list Grid / Slideshow */}
        <div className="pt-4 border-t border-white/5">
          {reviews.length > 0 ? (
            <div 
              className="relative max-w-6xl mx-auto"
              onMouseEnter={() => setIsTestHovered(true)}
              onMouseLeave={() => setIsTestHovered(false)}
            >
              {/* Testimonial Active Slide Container */}
              <div className="relative min-h-[420px] sm:min-h-[320px] md:min-h-[290px] overflow-hidden w-full">
                <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                  <motion.div
                    key={activeTestIndex}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({
                        x: dir > 0 ? "100%" : "-100%",
                        opacity: 0,
                      }),
                      center: {
                        x: 0,
                        opacity: 1,
                      },
                      exit: (dir: number) => ({
                        x: dir < 0 ? "100%" : "-100%",
                        opacity: 0,
                      })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 150, damping: 22 },
                      opacity: { duration: 0.25 }
                    }}
                    className={`w-full grid gap-6 p-1 ${
                      reviews.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-xl mx-auto"
                    }`}
                  >
                    {/* First Testimonial */}
                    {reviews[activeTestIndex] && (() => {
                      const test = reviews[activeTestIndex];
                      return (
                        <div className="group p-8 sm:p-10 bg-neutral-900/25 hover:bg-neutral-900/45 border border-white/5 rounded-3xl flex flex-col justify-between space-y-6 h-full transition-all duration-300 backdrop-blur-sm shadow-xl">
                          <div className="space-y-4">
                            {/* Minimal Rating Header */}
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3.5 h-3.5 ${
                                    i < (test?.rating || 5) 
                                      ? 'text-amber-400 fill-amber-400' 
                                      : 'text-neutral-850'
                                  }`} 
                                />
                              ))}
                            </div>

                            {/* Elegant Quote */}
                            <p className="text-zinc-200 text-base sm:text-lg leading-relaxed font-light">
                              "{test?.review}"
                            </p>
                          </div>

                          {/* Client Card info */}
                          <div className="flex items-center gap-4 pt-6 border-t border-white/[0.04]">
                            <img 
                              src={test?.photo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200'} 
                              alt={test?.client_name} 
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="text-left font-sans">
                              <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                                {test?.client_name}
                              </h4>
                              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                                {test?.company}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Second Testimonial (Desktop/Tablet) */}
                    {reviews.length > 1 && (() => {
                      const nextIndex = (activeTestIndex + 1) % reviews.length;
                      const test = reviews[nextIndex];
                      return (
                        <div className="hidden md:flex group p-8 sm:p-10 bg-neutral-900/25 hover:bg-neutral-900/45 border border-white/5 rounded-3xl flex-col justify-between space-y-6 h-full transition-all duration-300 backdrop-blur-sm shadow-xl">
                          <div className="space-y-4">
                            {/* Minimal Rating Header */}
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3.5 h-3.5 ${
                                    i < (test?.rating || 5) 
                                      ? 'text-amber-400 fill-amber-400' 
                                      : 'text-neutral-850'
                                  }`} 
                                />
                              ))}
                            </div>

                            {/* Elegant Quote */}
                            <p className="text-zinc-200 text-base sm:text-lg leading-relaxed font-light">
                              "{test?.review}"
                            </p>
                          </div>

                          {/* Client Card info */}
                          <div className="flex items-center gap-4 pt-6 border-t border-white/[0.04]">
                            <img 
                              src={test?.photo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200'} 
                              alt={test?.client_name} 
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="text-left font-sans">
                              <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                                {test?.client_name}
                              </h4>
                              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                                {test?.company}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slider controls: discrete pill indicators & discrete next/prev buttons */}
              <div className="flex justify-between items-center mt-8 px-4">
                {/* Dots indicators */}
                <div className="flex gap-2 items-center">
                  {reviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDirection(idx > activeTestIndex ? 1 : -1);
                        setActiveTestIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === activeTestIndex 
                          ? 'w-6 bg-white' 
                          : 'w-1.5 bg-neutral-800 hover:bg-neutral-600'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Left/Right circle action buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setDirection(-1);
                      setActiveTestIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
                    }}
                    className="w-10 h-10 rounded-full border border-white/5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all duration-300 select-none cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setDirection(1);
                      setActiveTestIndex((prev) => (prev + 1) % reviews.length);
                    }}
                    className="w-10 h-10 rounded-full border border-white/5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all duration-300 select-none cursor-pointer"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-neutral-550 border border-dashed border-neutral-850 rounded-2xl bg-neutral-900/10">
              No client reviews are registered inside this section yet.
            </div>
          )}

          {reviews.length === 0 && (
            <div className="col-span-2 text-center py-24 text-neutral-500 border border-dashed border-neutral-900 rounded-2xl bg-neutral-900/10 w-full">
              No client reviews are registered inside this section yet.
            </div>
          )}
        </div>

        {/* Small Testimonials footer CTA block */}
        <div className="mt-24 p-10 glass-panel rounded-2xl text-center space-y-5 max-w-4xl mx-auto shadow-2xl relative border border-white/5">
          <MessageSquareCode className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
          <h3 className="text-2xl font-bold text-white tracking-tight">Collaborated with HA Studio before?</h3>
          <p className="text-neutral-450 text-neutral-400 text-sm max-w-lg mx-auto font-light leading-relaxed">
            Let HA design directors know your genuine thoughts on our project delivery and quality guidelines. Reach out with key ratings and updates.
          </p>
          <div className="pt-2">
            <Link to="/contact" className="inline-flex items-center text-xs font-bold font-mono tracking-widest text-white hover:text-blue-400 transition-colors gap-1.5 uppercase">
              LET'S CONVERSE <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
