import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  Play, 
  Star, 
  Sparkles, 
  Film, 
  Paintbrush, 
  Monitor, 
  Layers, 
  Laptop, 
  Maximize2, 
  MousePointer, 
  Video, 
  Compass,
  Quote,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [services, setServices] = useState<any[]>([
    {
      id: 1,
      title: "Video Editing",
      slug: "video-editing",
      description: "Professional high-end pacing, sequence building, color grading, sound design, and custom cuts for YouTube, commercial, and film campaigns.",
      pricing: "From $1,200",
      featured_image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600"
    },
    {
      id: 2,
      title: "Motion Graphics",
      slug: "motion-graphics",
      description: "Kinetic typography, 2D/3D visual assets, logo animations, explainer narratives, and promotional video overlays.",
      pricing: "From $1,500",
      featured_image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=600"
    },
    {
      id: 3,
      title: "Graphic Design",
      slug: "graphic-design",
      description: "Bespoke digital vectors, media banner collaterals, modern layout styling, and promotional posters designed to captivate your audience.",
      pricing: "From $800",
      featured_image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600"
    },
    {
      id: 4,
      title: "Branding Design",
      slug: "branding-design",
      description: "Complete visual identity guidelines, distinct logomarks, matching palettes, typography pairings, and ready-to-print stationeries.",
      pricing: "From $2,400",
      featured_image: "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=600"
    }
  ]);
  const [portfolios, setPortfolios] = useState<any[]>([
    {
      id: 1,
      title: "Retro Future Branding Suite",
      category: "Branding Design",
      client_name: "CyberX Labs",
      description: "A dark cyberpunk branding identity combining sharp high-contrast glyphs with glowing cybernetic accents, visual badges, and print assets.",
      thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600",
      featured_status: 1
    },
    {
      id: 2,
      title: "Aether Cosmetics Launch Video",
      category: "Video Editing",
      client_name: "Aether Cosmetics",
      description: "An elegant, luxurious commercial highlight reels with smooth editorial flow, custom closeups, soft focus pacing, and ambient sound mapping.",
      thumbnail: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600",
      featured_status: 1
    }
  ]);
  const [testimonials, setTestimonials] = useState<any[]>([
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

  // Interactive Playback State for Video Mockup
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(35);
  // Graphic Vector State
  const [hoveredAnchor, setHoveredAnchor] = useState<number | null>(null);
  const [graphicsStyle, setGraphicsStyle] = useState<'editorial' | 'technical' | 'bold'>('editorial');
  
  // Web Mockup State
  const [webHovered, setWebHovered] = useState<boolean>(false);
  const [webCoords, setWebCoords] = useState({ x: 0, y: 0 });
  const [webPalette, setWebPalette] = useState<'cyan' | 'purple' | 'emerald'>('cyan');
  const [webLayout, setWebLayout] = useState<'grid' | 'split'>('grid');

  // Hero Area Spotlight Hover Tracking
  const [spotlightCoords, setSpotlightCoords] = useState({ x: 0, y: 0 });
  const [isSpotlightVisible, setIsSpotlightVisible] = useState(false);

  // Refs for tracking timeline hover / scrub
  const timelineRef = useRef<HTMLDivElement>(null);
  const webContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Rotating Taglines array for custom subtitle carousel
  const taglines = [
    "High-Performance Web apps crafted with complete pixel precision.",
    "Cinematic video editing with perfect spatial audio rhythm.",
    "Bespoke graphic vector assets designed with timeless symmetry."
  ];
  const [taglineIdx, setTaglineIdx] = useState(0);

  useEffect(() => {
    const textTimer = setInterval(() => {
      setTaglineIdx(prev => (prev + 1) % taglines.length);
    }, 4500);
    return () => clearInterval(textTimer);
  }, []);

  useEffect(() => {
    const now = Date.now();
    const CACHE_TTL = 300000; // 5 minutes cache TTL

    // Helper to validate and extract JSON from fetch response
    const handleJSONResponse = (res: Response) => {
      if (!res.ok) throw new Error(`Fetch status failed: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Did not receive application/json content type");
      }
      return res.json();
    };

    // 1. Services Cache & Retrieval
    const servicesLastFetch = localStorage.getItem('services_list_last_fetch');
    let servicesLoadedFromCache = false;

    if (servicesLastFetch && now - parseInt(servicesLastFetch) < CACHE_TTL) {
      const cached = localStorage.getItem('services_list_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setServices(parsed.slice(0, 4));
            servicesLoadedFromCache = true;
          }
        } catch (_) {}
      }
    }

    if (!servicesLoadedFromCache) {
      fetch('/api/services')
        .then(handleJSONResponse)
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setServices(data.slice(0, 4));
            localStorage.setItem('services_list_cache', JSON.stringify(data));
            localStorage.setItem('services_list_last_fetch', now.toString());
          }
        })
        .catch(err => console.warn("Fetch services warning:", err.message));
    }

    // 2. Portfolios Cache & Retrieval
    const portfolioLastFetch = localStorage.getItem('portfolio_list_last_fetch');
    let portfolioLoadedFromCache = false;

    if (portfolioLastFetch && now - parseInt(portfolioLastFetch) < CACHE_TTL) {
      const cached = localStorage.getItem('portfolio_list_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPortfolios(parsed.slice(0, 3));
            portfolioLoadedFromCache = true;
          }
        } catch (_) {}
      }
    }

    if (!portfolioLoadedFromCache) {
      fetch('/api/portfolio')
        .then(handleJSONResponse)
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setPortfolios(data.slice(0, 3));
            localStorage.setItem('portfolio_list_cache', JSON.stringify(data));
            localStorage.setItem('portfolio_list_last_fetch', now.toString());
          }
        })
        .catch(err => console.warn("Fetch portfolio warning:", err.message));
    }

    // 3. Testimonials Cache & Retrieval
    const testimonialsLastFetch = localStorage.getItem('testimonials_list_last_fetch');
    let testimonialsLoadedFromCache = false;

    if (testimonialsLastFetch && now - parseInt(testimonialsLastFetch) < CACHE_TTL) {
      const cached = localStorage.getItem('testimonials_list_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTestimonials(parsed.slice(0, 8));
            testimonialsLoadedFromCache = true;
          }
        } catch (_) {}
      }
    }

    if (!testimonialsLoadedFromCache) {
      fetch('/api/testimonials')
        .then(handleJSONResponse)
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setTestimonials(data.slice(0, 8));
            localStorage.setItem('testimonials_list_cache', JSON.stringify(data));
            localStorage.setItem('testimonials_list_last_fetch', now.toString());
          }
        })
        .catch(err => console.warn("Fetch testimonials warning:", err.message));
    }
  }, []);

  // Soft automatic progression for the timeline bar
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 45);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Slideshow auto-advance timer for testimonials (2 or more items)
  useEffect(() => {
    if (testimonials.length < 2 || isTestHovered) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveTestIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length, isTestHovered]);

  // Video timeline mouse scrub
  const handleTimelineInteractions = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
      setProgress(pct);
    }
  };

  // Web coordinate track
  const handleWebMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (webContainerRef.current) {
      const rect = webContainerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 8;
      const y = (e.clientY - rect.top - rect.height / 2) / 8;
      setWebCoords({ x, y });
    }
  };

  const stats = [
    { value: '150+', label: 'Campaigns Delivered' },
    { value: '99%', label: 'Positive Response' },
    { value: '45+', label: 'Design Collaborations' },
    { value: '12+', label: 'Global Awards Won' }
  ];

  return (
    <div className="flex flex-col bg-neutral-950 overflow-hidden text-white min-h-screen">
      
      {/* 1. CREATIVE TRIPLE-SHOWCASE HERO SECTION */}
      <section 
        ref={heroRef}
        onMouseMove={(e) => {
          if (heroRef.current) {
            const rect = heroRef.current.getBoundingClientRect();
            setSpotlightCoords({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            });
          }
        }}
        onMouseEnter={() => setIsSpotlightVisible(true)}
        onMouseLeave={() => setIsSpotlightVisible(false)}
        className="relative min-h-[95vh] lg:min-h-[100vh] flex items-center justify-center pt-32 pb-24 px-4 overflow-hidden bg-grid"
      >
        {/* Aesthetic Backdrop Glows */}
        <div className="absolute top-1/4 right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-[5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] -z-10 animate-pulse-medium" />
        <div className="absolute inset-0 bg-radial from-transparent via-neutral-950/30 to-neutral-950 pointer-events-none -z-10" />

        {/* Dynamic spot cursor tracking glow */}
        {isSpotlightVisible && (
          <div 
            className="absolute inset-0 pointer-events-none -z-10 transition-opacity duration-300 opacity-80"
            style={{
              background: `radial-gradient(550px circle at ${spotlightCoords.x}px ${spotlightCoords.y}px, rgba(59, 130, 246, 0.09) 0%, rgba(168, 85, 247, 0.04) 50%, transparent 100%)`
            }}
          />
        )}

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT SIDE: PREMIUM COPYWRITING & INTENTIONAL HEADING */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.05
                }
              }
            }}
            className="lg:col-span-6 text-left space-y-8"
          >
            <div className="space-y-4">
              <motion.div 
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/80 border border-white/10 rounded-full text-xs font-mono text-neutral-300 backdrop-blur-md shadow-lg shadow-black/50"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>Modern Digital Agency Suite</span>
              </motion.div>

              <motion.h1 
                variants={{
                  hidden: { y: 30, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
                }}
                className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.0] text-white"
              >
                Designing <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent select-none pb-2 inline-block">
                  Digital Standards.
                </span>
              </motion.h1>
            </div>

            {/* Premium Interactive Tagline Rotating Board */}
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 }
              }}
              className="h-12 sm:h-10 flex items-center border-l-2 border-blue-500 pl-4 bg-white/[0.01] rounded-r-lg"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={taglineIdx}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="text-xs sm:text-sm font-mono font-semibold text-blue-400 leading-relaxed"
                >
                  {taglines[taglineIdx]}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <motion.p 
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
              className="text-neutral-400 text-sm sm:text-base leading-relaxed font-light max-w-xl"
            >
              We are <span className="text-white font-medium">HA Studio</span>. Elite designers, editors, and engineers constructing visual experiences across three fundamental specialties: high-performance websites, cinematic film, and luxury brand assets. We inject absolute pixel precision into every dimension we design.
            </motion.p>

            {/* Micro-Links targeting the core service tags */}
            <motion.div 
              variants={{
                hidden: { y: 15, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
              className="flex flex-wrap gap-2 text-xs font-mono text-neutral-500 pt-1"
            >
              <span className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-md hover:text-white transition-all duration-300 hover:scale-105 hover:bg-neutral-900 cursor-pointer">/ Website_Design</span>
              <span className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-md hover:text-white transition-all duration-300 hover:scale-105 hover:bg-neutral-900 cursor-pointer">/ Video_Editing</span>
              <span className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-md hover:text-white transition-all duration-300 hover:scale-105 hover:bg-neutral-900 cursor-pointer">/ Graphic_Design</span>
            </motion.div>

            {/* Call to Action Buttons */}
            <motion.div 
              variants={{
                hidden: { y: 25, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 90 } }
              }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Link to="/contact" className="px-6 py-3.5 bg-white text-neutral-950 font-extrabold rounded-xl hover:bg-neutral-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 shadow-xl shadow-white/5 text-xs uppercase tracking-wider font-mono">
                Initiate Project <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/portfolio" className="px-6 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-sm text-xs uppercase tracking-wider font-mono">
                Explore Gallery
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: THE TRIPLE CREATIVE PRESENTATION STAGE - BENTO LAYOUT */}
          <div className="lg:col-span-6 w-full space-y-6">
            
            {/* 1. WEBSITE DESIGN LIVE STAGE */}
            <div 
              ref={webContainerRef}
              onMouseMove={handleWebMouseMove}
              onMouseEnter={() => setWebHovered(true)}
              onMouseLeave={() => {
                setWebHovered(false);
                setWebCoords({ x: 0, y: 0 });
              }}
              className="bg-neutral-950/80 border border-white/10 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-cyan-500/30 shadow-xl group border-l-2 border-l-cyan-500/30"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center mb-4 text-[10px] font-mono text-neutral-400">
                <div className="flex items-center gap-2">
                  <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold uppercase tracking-wider">Web Design Module</span>
                </div>
                
                {/* Embedded Layout Swapper Buttons */}
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 p-0.5 rounded-md">
                  <button 
                    onClick={() => setWebLayout('grid')}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono transition-colors focus:outline-none ${webLayout === 'grid' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    BENTO
                  </button>
                  <button 
                    onClick={() => setWebLayout('split')}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono transition-colors focus:outline-none ${webLayout === 'split' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    SPLIT
                  </button>
                </div>
              </div>

              {/* Browser Window Mockup */}
              <div className="bg-black/60 rounded-xl border border-white/5 overflow-hidden aspect-[12/4.5] p-3 flex flex-col justify-between relative">
                {/* Browser bar with Theme Palette Dots */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setWebPalette('cyan')}
                      title="Cyan Accent"
                      className={`w-3 h-3 rounded-full bg-cyan-400 transition-transform hover:scale-125 focus:outline-none ${webPalette === 'cyan' ? 'ring-2 ring-white scale-110' : 'opacity-60'}`} 
                    />
                    <button 
                      onClick={() => setWebPalette('purple')}
                      title="Purple Accent"
                      className={`w-3 h-3 rounded-full bg-purple-400 transition-transform hover:scale-125 focus:outline-none ${webPalette === 'purple' ? 'ring-2 ring-white scale-110' : 'opacity-60'}`} 
                    />
                    <button 
                      onClick={() => setWebPalette('emerald')}
                      title="Emerald Accent"
                      className={`w-3 h-3 rounded-full bg-emerald-400 transition-transform hover:scale-125 focus:outline-none ${webPalette === 'emerald' ? 'ring-2 ring-white scale-110' : 'opacity-60'}`} 
                    />
                  </div>
                  <div className="bg-white/5 rounded px-4 py-0.5 text-[8px] font-mono text-neutral-500 w-1/2 text-center truncate">
                    hastudio.com/renderer-{webPalette}-{webLayout}
                  </div>
                  <div className="w-8 shrink-0 text-right text-[7px] font-mono text-neutral-600">LIVE</div>
                </div>

                {/* Simulated dynamic elements that adapt in size, layout, text and accent colors */}
                <div className="grid grid-cols-12 gap-3 h-full items-center relative z-10 transition-all duration-300">
                  {webLayout === 'grid' ? (
                    <>
                      <div className="col-span-7 space-y-2">
                        <div className="h-3 w-4/5 bg-white/10 rounded-sm animate-pulse" />
                        <div className="h-2 w-1/2 bg-white/5 rounded-sm" />
                        <div className="flex gap-1.5 pt-1">
                          <span className={`w-10 h-1.5 rounded-full ${webPalette === 'cyan' ? 'bg-cyan-500/30' : webPalette === 'purple' ? 'bg-purple-500/30' : 'bg-emerald-500/30'}`} />
                          <span className="w-12 h-1.5 rounded-full bg-white/5" />
                        </div>
                      </div>
                      
                      {/* Floating interactive card component responding to cursor move */}
                      <div className="col-span-5 flex justify-end">
                        <motion.div 
                          animate={{ 
                            x: webCoords.x, 
                            y: webCoords.y,
                            rotateX: webCoords.y * -0.5,
                            rotateY: webCoords.x * 0.5
                          }}
                          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                          className={`p-2.5 rounded-lg text-center max-w-[110px] shadow-lg shadow-black/80 backdrop-blur-md border transition-colors ${
                            webPalette === 'cyan' 
                              ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-400' 
                              : webPalette === 'purple' 
                              ? 'bg-purple-500/15 border-purple-400/40 text-purple-400' 
                              : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-400'
                          }`}
                        >
                          <div className="text-[9px] font-bold font-mono tracking-tight uppercase">{webPalette} VIEW</div>
                          <div className="text-[7px] text-white/70 font-mono mt-0.5">DYNAMIC ID</div>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Symmetrical split layout view */}
                      <div className="col-span-6 border-r border-white/5 pr-2 py-1 flex flex-col justify-center">
                        <div className="text-[7px] font-mono text-white/50 mb-1 uppercase">Metric Performance</div>
                        <div className={`text-sm font-black font-mono tracking-tight transition-colors ${
                          webPalette === 'cyan' ? 'text-cyan-400' : webPalette === 'purple' ? 'text-purple-400' : 'text-emerald-400'
                        }`}>
                          99.8% FPS RATE
                        </div>
                      </div>
                      <div className="col-span-6 flex flex-col justify-center items-center">
                        <motion.button 
                          animate={{ 
                            scale: webHovered ? 1.05 : 1,
                            rotate: webCoords.x * 1.5
                          }}
                          className={`w-7 h-7 rounded-md flex items-center justify-center border focus:outline-none ${
                            webPalette === 'cyan' 
                              ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-400' 
                              : webPalette === 'purple' 
                              ? 'bg-purple-500/15 border-purple-400/40 text-purple-400' 
                              : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-400'
                          }`}
                        >
                          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                        </motion.button>
                        <span className="text-[6px] font-mono mt-1 text-white/40 uppercase">Interactive pivot</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Subtle mouse hover message */}
                {!webHovered && (
                  <div className="absolute inset-x-0 bottom-1 flex items-center justify-center pointer-events-none z-20">
                    <span className="text-[7px] font-mono text-neutral-450 tracking-wider uppercase bg-neutral-900 border border-white/10 px-1.5 py-0.5 rounded">Move cursor above & switch layout</span>
                  </div>
                )}
              </div>
            </div>

            {/* TWO-COLUMN GRID FOR VIDEO & GRAPHICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* 2. VIDEO EDITING CINEMATIC TIMELINE */}
              <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-300 hover:border-rose-500/30 shadow-xl flex flex-col justify-between border-l-2 border-l-rose-500/30">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-center mb-3 text-[9px] font-mono text-neutral-400">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Film className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="font-bold uppercase tracking-wider truncate">Video Editing</span>
                  </div>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded hover:bg-rose-500/20 transition-all font-mono hover:scale-105 active:scale-95 text-[8px] font-bold shrink-0"
                  >
                    {isPlaying ? 'PAUSE' : 'PLAY'}
                  </button>
                </div>

                {/* Video Timeline Mockup with integrated preview and audio bars */}
                <div className="bg-black/60 rounded-xl border border-white/5 overflow-hidden aspect-[1.3] p-2 flex flex-col justify-between relative text-left">
                  
                  {/* Integrated Preview Monitor and Audio Gain Mixer */}
                  <div className="grid grid-cols-12 gap-1.5 flex-1 mb-1.5 h-[52px]">
                    {/* Viewport Monitor */}
                    <div className="col-span-8 bg-neutral-900 border border-white/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                      {/* Simulated movie frame that reacts instantly to progress */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-all duration-300 pointer-events-none"
                        style={{
                          backgroundImage: `url(${
                            progress < 33 
                              ? 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=400' 
                              : progress < 66
                              ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400' 
                              : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400' 
                          })`
                        }}
                      />
                      <div className="absolute inset-0 bg-black/45 mix-blend-multiply" />
                      
                      {/* Cinema scope bars */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-black" />
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black" />
                      
                      {/* Active diagnosis watermark */}
                      <div className="absolute top-1 left-1.5 text-[5px] font-mono text-rose-450 flex items-center gap-0.5 bg-black/70 px-1 py-0.5 rounded border border-rose-500/10">
                        <span className={`w-1 h-1 rounded-full bg-rose-500 ${isPlaying ? 'animate-ping' : ''}`} />
                        <span>LUT_REC</span>
                      </div>
                      <div className="absolute bottom-1 right-1.5 text-[5px] font-mono text-neutral-350 bg-black/70 px-1 py-0.5 rounded">
                        FR_0{Math.floor(progress * 2.4)}
                      </div>

                      <Play className="w-5 h-5 text-white/55 drop-shadow cursor-pointer hover:scale-115 transition-transform" onClick={() => setIsPlaying(!isPlaying)} />
                    </div>

                    {/* DB Mixer visualizer */}
                    <div className="col-span-4 bg-neutral-900/80 border border-white/5 rounded-lg p-1.5 flex flex-col justify-between shrink-0">
                      <span className="text-[5px] font-mono text-neutral-500 text-center uppercase tracking-wider block">MIXER</span>
                      <div className="flex gap-1 h-7 items-end justify-center">
                        {[1, 2, 3, 4].map((bar) => (
                          <motion.div 
                            key={bar}
                            animate={isPlaying ? {
                              height: [`${15 + (bar * 8)}%`, `${50 + (Math.sin(bar * 2 + progress * 0.1) * 45)}%`, `${10 + (bar * 5)}%`]
                            } : { height: '30%' }}
                            transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }}
                            className="w-1 bg-rose-500/80 rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-[5px] font-mono text-rose-400 text-center font-black uppercase tracking-wider shrink-0">{isPlaying ? "ACTIVE" : "STILL"}</span>
                    </div>
                  </div>

                  {/* Multi-track Timeline Channels optimized for narrow card */}
                  <div 
                    ref={timelineRef}
                    onMouseMove={handleTimelineInteractions}
                    className="space-y-1 my-0.5 cursor-ew-resize relative py-0.5"
                  >
                    {/* Ruler */}
                    <div className="h-1 w-full flex justify-between absolute -top-1 left-0 right-0 opacity-40 pointer-events-none">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <span key={i} className={`w-px bg-white ${i % 2 === 0 ? 'h-1.5' : 'h-1'}`} />
                      ))}
                    </div>

                    {/* Track 1: Video */}
                    <div className="h-2.5 bg-neutral-900 border border-white/5 rounded-sm relative overflow-hidden flex items-center">
                      <div className="absolute top-0 bottom-0 left-[10%] w-[35%] bg-rose-500/20 border-x border-rose-500/40" />
                      <div className="absolute top-0 bottom-0 left-[50%] w-[40%] bg-neutral-800 border-x border-white/10" />
                      <span className="absolute left-[12%] text-[5px] text-rose-300 font-mono">SC_01</span>
                    </div>

                    {/* Track 2: Audio Waves */}
                    <div className="h-2.5 bg-neutral-900 border border-white/5 rounded-sm relative overflow-hidden flex items-center">
                      <div className="absolute top-0 bottom-0 left-[10%] w-[80%] bg-purple-500/15 flex items-center justify-around px-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <span 
                            key={i} 
                            className="w-px bg-purple-400" 
                            style={{ height: `${Math.sin(i * 0.8) * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Red Playhead line */}
                    <div 
                      className="absolute top-0 bottom-0 w-[1.5px] bg-rose-500 z-10 pointer-events-none"
                      style={{ left: `${progress}%` }}
                    >
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full -translate-x-[2px] -translate-y-0.5" />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="flex justify-between text-[6px] font-mono text-neutral-500 border-t border-white/5 pt-0.5">
                    <span>TIME: 01:22</span>
                    <span className="text-rose-450 animate-pulse font-extrabold uppercase">Scrub timeline frame</span>
                  </div>
                </div>
              </div>

              {/* 3. GRAPHIC DESIGN VECTOR BLUEPRINT */}
              <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-300 hover:border-purple-500/30 shadow-xl flex flex-col justify-between border-l-2 border-l-purple-500/30">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-center mb-3 text-[9px] font-mono text-neutral-400">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Paintbrush className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-bold uppercase tracking-wider truncate">Graphic Design</span>
                  </div>
                  
                  {/* Style selectors */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setGraphicsStyle('editorial')}
                      className={`px-1 rounded text-[7px] font-bold transition-all focus:outline-none ${graphicsStyle === 'editorial' ? 'bg-purple-500/25 text-purple-300 border border-purple-500/30' : 'text-neutral-500'}`}
                    >
                      SERIF
                    </button>
                    <button 
                      onClick={() => setGraphicsStyle('technical')}
                      className={`px-1 rounded text-[7px] font-bold transition-all focus:outline-none ${graphicsStyle === 'technical' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30' : 'text-neutral-500'}`}
                    >
                      MONO
                    </button>
                    <button 
                      onClick={() => setGraphicsStyle('bold')}
                      className={`px-1 rounded text-[7px] font-bold transition-all focus:outline-none ${graphicsStyle === 'bold' ? 'bg-pink-500/25 text-pink-300 border border-pink-500/30' : 'text-neutral-500'}`}
                    >
                      BOLD
                    </button>
                  </div>
                </div>

                {/* Vector blueprint display board with squarish aspect */}
                <div className="bg-black/60 rounded-xl border border-white/5 overflow-hidden aspect-[1.3] p-2 flex flex-col justify-between relative text-left">
                  
                  {/* Central Canvas Graphics Composition */}
                  <div className="flex-1 flex items-center justify-around relative overflow-hidden">
                    
                    {/* Blueprint visual guide circles and grids */}
                    <div className="absolute w-12 h-12 rounded-full border border-neutral-800 border-dashed animate-spin-slow" />
                    <div className="absolute w-20 h-20 rounded-full border border-purple-500/5 animate-pulse-slow" />
                    
                    {/* Dynamic Vector guidelines depending on style */}
                    {graphicsStyle === 'technical' && (
                      <div className="absolute inset-2 border border-emerald-500/10 rounded-sm pointer-events-none">
                        <div className="absolute inset-y-0 left-1/2 border-l border-emerald-500/10 border-dashed" />
                        <div className="absolute inset-x-0 top-1/2 border-t border-emerald-500/10 border-dashed" />
                        <span className="absolute top-1 left-1.5 text-[5px] font-mono text-emerald-500/40">X: 122.5 Y: -45.0</span>
                      </div>
                    )}

                    {graphicsStyle === 'bold' && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-violet-500/5 to-transparent flex items-center justify-center">
                        <div className="w-16 h-16 border border-dashed border-pink-500/10 rotate-45" />
                      </div>
                    )}

                    {/* Elegant Typography Frame */}
                    <div className="text-center relative z-10">
                      <h4 className={`text-xl tracking-widest relative select-none uppercase transition-all duration-300 ${
                        graphicsStyle === 'editorial' 
                          ? 'font-serif font-light text-neutral-300 italic' 
                          : graphicsStyle === 'technical' 
                          ? 'font-mono text-emerald-400 font-medium tracking-normal' 
                          : 'font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-[0_2px_8px_rgba(236,72,153,0.3)]'
                      }`}>
                        {graphicsStyle === 'editorial' ? 'Concept' : graphicsStyle === 'technical' ? 'SYS_MESH' : 'HARMONY'}
                        
                        {/* Interactive Vector anchor points surrounding typography */}
                        {[
                          { id: 1, top: '-4px', left: '-4px' },
                          { id: 2, top: '-4px', right: '-4px' },
                          { id: 3, bottom: '-4px', left: '-4px' },
                          { id: 4, bottom: '-4px', right: '-4px' },
                        ].map((p) => (
                          <div 
                            key={p.id}
                            onMouseEnter={() => setHoveredAnchor(p.id)}
                            onMouseLeave={() => setHoveredAnchor(null)}
                            className={`absolute w-1.5 h-1.5 border border-white rounded-xs cursor-crosshair transition-all duration-200 ${
                              hoveredAnchor === p.id 
                                ? graphicsStyle === 'technical'
                                  ? 'bg-emerald-400 border-emerald-300 scale-130 shadow-[0_0_8px_#34d399]'
                                  : 'bg-purple-500 border-purple-400 scale-130 shadow-[0_0_8px_#a855f7]' 
                                : 'bg-black'
                            }`}
                            style={{
                              top: p.top,
                              bottom: p.bottom,
                              left: p.left,
                              right: p.right
                            }}
                          />
                        ))}
                      </h4>
                    </div>

                    {/* Grid labels */}
                    <div className="absolute top-1 right-2 text-[5px] font-mono uppercase text-neutral-600">
                      {graphicsStyle === 'editorial' ? 'KERN: GOLD' : graphicsStyle === 'technical' ? 'GRID: 16X16_M' : 'VECTOR_GUIDE'}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="flex justify-between items-center text-[6px] font-mono text-neutral-500 border-t border-white/5 pt-0.5">
                    <span>ガイドライン : ON</span>
                    <span className="text-purple-450 animate-pulse font-extrabold uppercase">Hover vertex anchor</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Dynamic Scroll Down Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[8px] font-mono tracking-widest uppercase text-neutral-500">Discover mastery</span>
          <motion.div 
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
            className="w-3.5 h-6 rounded-full border border-neutral-700 p-0.5 flex justify-center"
          >
            <span className="w-1 h-1.5 bg-blue-500 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* 2. STATS BAR BENTO CARD ARRAY */}
      <section className="py-16 bg-neutral-950/80 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="text-center space-y-2 group"
              >
                <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight group-hover:text-blue-400 transition-colors duration-400">
                  {stat.value}
                </div>
                <div className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase font-mono">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICES GRID (GLASSY CARDS) */}
      <section className="py-28 bg-neutral-950 w-full relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-blue-500 uppercase">Disciplines & Mastery</span>
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter text-white">Bespoke Creator Services</h2>
            </div>
            <Link to="/services" className="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors group">
              Explore all disciplines <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="glass-card group p-8 rounded-2xl flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-center mb-8 text-blue-400 group-hover:bg-blue-500/15 group-hover:border-blue-500/30 transition-all duration-300 group-hover:scale-105">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors duration-300">{service.title}</h3>
                  <p className="text-neutral-450 text-sm leading-relaxed mb-6 text-neutral-400 line-clamp-3 font-light">{service.description}</p>
                </div>
                <Link to={`/services/${service.slug}`} className="inline-flex items-center text-xs font-mono font-bold tracking-wider text-white gap-1.5 group-hover:text-blue-400 transition-colors mt-4">
                  EXPLORE <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CHRONICLES OF EXCELLENCE - FEATURED PORTFOLIO GRID */}
      <section className="py-28 bg-neutral-950 w-full relative border-t border-white/5 bg-dot-matrix">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-purple-500 uppercase">Selected Masterpieces</span>
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter text-white">Interactive Portfolios</h2>
            </div>
            <Link to="/portfolio" className="inline-flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group">
              Explore full gallery <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {portfolios.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative bg-neutral-900/40 rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/20 active:scale-[0.99] transition-all hover:bg-neutral-900/80 shadow-md"
              >
                <div className="relative aspect-video overflow-hidden border-b border-white/5">
                  <img 
                    src={item.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600'} 
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-100 transition-opacity" />
                  <span className="absolute bottom-4 left-4 px-3 py-1 bg-neutral-950/80 backdrop-blur-md rounded-full text-[10px] font-mono tracking-wider text-neutral-300 uppercase border border-white/5">
                    {item.category}
                  </span>
                </div>
                <div className="p-7 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">{item.title}</h3>
                    <p className="text-neutral-500 text-xs font-mono">Client & Partners: <span className="font-semibold text-neutral-300">{item.client_name || 'Autonomous Campaign'}</span></p>
                  </div>
                  <p className="text-neutral-400 text-sm line-clamp-2 leading-relaxed font-light">{item.description}</p>
                  <div className="pt-2">
                    <Link to={`/portfolio/${item.id}`} className="inline-flex items-center text-xs font-bold text-white group-hover:text-purple-400 transition-colors font-mono tracking-wider">
                      CASE STUDY DETAILS <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
            {portfolios.length === 0 && (
              <div className="col-span-3 text-center py-20 text-neutral-500 border border-dashed border-neutral-900 rounded-2xl bg-neutral-950/40">
                Creative assets will propagate once added to Admin.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. VALUE PROP GRID */}
      <section className="py-28 bg-neutral-950 border-t border-white/5 relative bg-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">Core Strengths</span>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter mt-1 text-white">Precision. Performance. Style.</h2>
            <p className="text-neutral-400 text-sm max-w-lg mx-auto font-light leading-relaxed">We employ a rigorous tactical approach to each and every visual narrative project.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Film, title: 'Speed & Rhythm', desc: 'Surgical cut frequencies matched precisely to sound vibes.' },
              { icon: Paintbrush, title: 'Crafted Aesthetics', desc: 'No boring vectors. We design bold gradients, bespoke shapes, and deep palettes.' },
              { icon: Monitor, title: 'Pixel Precision', desc: 'Full-spectrum retina renders optimized of high frame pacing.' }
            ].map((prop, idx) => {
              const IconComp = prop.icon;
              return (
                <div key={prop.title} className="p-8 bg-neutral-900/50 glass-panel rounded-2xl space-y-5 border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{prop.title}</h3>
                  <p className="text-neutral-450 text-sm leading-relaxed text-neutral-400 font-light">{prop.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-28 bg-neutral-950 border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-blue-500 uppercase font-bold">Aesthetic Approvals</span>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter text-white">Approved by Visionaries</h2>
          </div>

          {testimonials.length > 0 ? (
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
                      testimonials.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-xl mx-auto"
                    }`}
                  >
                    {/* First Testimonial */}
                    {testimonials[activeTestIndex] && (() => {
                      const test = testimonials[activeTestIndex];
                      return (
                        <div className="group p-8 sm:p-10 bg-neutral-900/20 hover:bg-neutral-900/40 border border-white/5 rounded-3xl flex flex-col justify-between space-y-6 h-full transition-all duration-300 backdrop-blur-sm shadow-xl">
                          <div className="space-y-4">
                            {/* Minimal Rating Header */}
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3.5 h-3.5 ${
                                    i < (test?.rating || 5) 
                                      ? 'text-amber-400 fill-amber-400' 
                                      : 'text-neutral-800'
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
                    {testimonials.length > 1 && (() => {
                      const nextIndex = (activeTestIndex + 1) % testimonials.length;
                      const test = testimonials[nextIndex];
                      return (
                        <div className="hidden md:flex group p-8 sm:p-10 bg-neutral-900/20 hover:bg-neutral-900/40 border border-white/5 rounded-3xl flex-col justify-between space-y-6 h-full transition-all duration-300 backdrop-blur-sm shadow-xl">
                          <div className="space-y-4">
                            {/* Minimal Rating Header */}
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3.5 h-3.5 ${
                                    i < (test?.rating || 5) 
                                      ? 'text-amber-400 fill-amber-400' 
                                      : 'text-neutral-800'
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
                  {testimonials.map((_, idx) => (
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
                      setActiveTestIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
                    }}
                    className="w-10 h-10 rounded-full border border-white/5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-all duration-300 select-none cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setDirection(1);
                      setActiveTestIndex((prev) => (prev + 1) % testimonials.length);
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
            <div className="text-center py-20 text-neutral-550 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
              No testimonials registered inside database.
            </div>
          )}
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <section className="py-28 bg-neutral-950 relative border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-radial from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-4 text-center space-y-8 relative z-10">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
            Ready to design the <br /> Next Creative Benchmark?
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">
            Let us convert your raw specifications, design briefs, or video templates into breathtaking creative achievements. Get in supply with elite standards today.
          </p>
          <div className="pt-4">
            <Link to="/contact" className="px-8 py-4 bg-white text-neutral-950 font-extrabold rounded-full hover:bg-neutral-200 transition-all shadow-2xl shadow-blue-500/10 inline-flex items-center gap-2 hover:scale-105 active:scale-95 duration-300">
              Secure Consultation Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
