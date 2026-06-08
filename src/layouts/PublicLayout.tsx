import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowUpRight, Shield, ScrollText } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PublicLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const [logoType, setLogoType] = useState<string>(() => {
    return localStorage.getItem('logo_type') || 'text';
  });
  const [logoText, setLogoText] = useState<string>(() => {
    return localStorage.getItem('logo_text') || 'HA.STUDIO';
  });
  const [logoImage, setLogoImage] = useState<string>(() => {
    return localStorage.getItem('logo_image') || '';
  });
  const [logoHeight, setLogoHeight] = useState<number>(() => {
    const cached = localStorage.getItem('logo_height');
    return cached ? (Number(cached) || 32) : 32;
  });
  const [email, setEmail] = useState<string>(() => {
    return localStorage.getItem('company_email') || 'contact@hastudio.com';
  });
  const [isReady, setIsReady] = useState<boolean>(() => {
    return !!localStorage.getItem('logo_type');
  });

  useEffect(() => {
    const lastFetch = localStorage.getItem('settings_last_fetch');
    const now = Date.now();
    // Cache check to prevent fetching every single render
    if (lastFetch && now - parseInt(lastFetch) < 300000) {
      if (localStorage.getItem('logo_type')) {
        setIsReady(true);
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
          const type = data.logo_type || 'text';
          const text = data.logo || 'HA.STUDIO';
          const image = data.logo_image || '';
          const height = Number(data.logo_height) || 32;
          const companyEmail = data.email || 'contact@hastudio.com';
          const companyPhone = data.phone || '+1 (800) 555-0100';
          const companyAddress = data.address || 'Silicon Valley, California';

          setLogoType(type);
          setLogoText(text);
          setLogoImage(image);
          setLogoHeight(height);
          setEmail(companyEmail);
          setIsReady(true);

          localStorage.setItem('logo_type', type);
          localStorage.setItem('logo_text', text);
          localStorage.setItem('logo_image', image);
          localStorage.setItem('logo_height', String(height));
          localStorage.setItem('company_email', companyEmail);
          localStorage.setItem('company_phone', companyPhone);
          localStorage.setItem('company_address', companyAddress);
          localStorage.setItem('settings_last_fetch', now.toString());
        }
      })
      .catch(err => {
        console.error(err);
        setIsReady(true);
      });
  }, []);

  const renderLogoContent = (textVal: string) => {
    const rawLogo = textVal || 'HA.STUDIO';
    if (rawLogo.includes('.')) {
      const parts = rawLogo.split('.');
      const firstPart = parts[0];
      const remaining = parts.slice(1).join('.');
      return (
        <>
          {firstPart}<span className="text-blue-500">.{remaining}</span>
        </>
      );
    }
    return rawLogo;
  };

  // Auto-scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Blog', path: '/blog' },
    { label: 'Testimonials', path: '/testimonials' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-blue-500 selection:text-white flex flex-col justify-between">
      <div>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold tracking-tighter text-white hover:opacity-90 transition-opacity flex items-center">
                  {!isReady ? (
                    <div style={{ height: `${logoHeight}px` }} className="w-24 bg-neutral-800 animate-pulse rounded" />
                  ) : logoType === 'image' && logoImage ? (
                    <img 
                      src={logoImage} 
                      alt={logoText || "Brand Logo"} 
                      style={{ height: `${logoHeight}px` }}
                      className="w-auto object-contain max-h-[120px]" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    renderLogoContent(logoText)
                  )}
                </Link>
              </div>

              {/* Desktop links */}
              <div className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      className={`text-xs font-semibold uppercase tracking-widest transition-all duration-300 relative py-2 hover:text-white ${
                        isActive ? 'text-white' : 'text-neutral-400'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.span 
                          layoutId="activeNavIndicator" 
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
                <Link 
                  to="/contact" 
                  className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold tracking-wide text-neutral-950 bg-white hover:bg-neutral-200 transition-all rounded-full hover:scale-105 active:scale-95 duration-350 shadow-md shadow-white/5"
                >
                  Start Project <ArrowUpRight className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Mobile trigger */}
              <div className="md:hidden">
                <button 
                  onClick={() => setIsOpen(!isOpen)} 
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                  aria-label="Toggle menu"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-b border-white/5 bg-neutral-900 px-4 pt-2 pb-6 space-y-2"
              >
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    className={`block py-3 px-4 rounded-lg text-base font-semibold hover:bg-neutral-800 hover:text-white transition-all ${
                      location.pathname === link.path ? 'text-blue-500 bg-neutral-800' : 'text-neutral-400'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 px-4">
                  <Link 
                    to="/contact" 
                    className="block text-center py-3 px-4 bg-white text-neutral-950 rounded-full font-bold text-sm tracking-tight"
                  >
                    Start Project
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Dynamic Margin to clear navigation offset */}
        <div className="pt-20">
          <Outlet />
        </div>
      </div>

      {/* Footer component */}
      <footer className="border-t border-white/5 bg-neutral-950 pt-20 pb-12 mt-12 grid-cols-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-4">
              <span className="text-2xl font-bold tracking-tighter text-white flex items-center">
                {!isReady ? (
                  <div style={{ height: `${logoHeight}px` }} className="w-24 bg-neutral-850 animate-pulse rounded" />
                ) : logoType === 'image' && logoImage ? (
                  <img 
                    src={logoImage} 
                    alt={logoText || "Brand Logo"} 
                    style={{ height: `${logoHeight}px` }}
                    className="w-auto object-contain max-h-[120px]" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  renderLogoContent(logoText)
                )}
              </span>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
                A premium elite creative agency specialized in cinematic film pacing, motion design animations, and custom visual assets.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 font-mono">Expertise</h4>
              <ul className="space-y-2.5 text-sm text-neutral-400">
                <li><Link to="/services/video-editing" className="hover:text-blue-500 transition-colors">Video Editing</Link></li>
                <li><Link to="/services/motion-graphics" className="hover:text-blue-500 transition-colors">Motion Graphics</Link></li>
                <li><Link to="/services/branding-design" className="hover:text-blue-500 transition-colors">Branding Design</Link></li>
                <li><Link to="/services" className="hover:text-blue-500 transition-colors">Website Development</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 font-mono">Pages</h4>
              <ul className="space-y-2.5 text-sm text-neutral-400">
                <li><Link to="/about" className="hover:text-blue-500 transition-colors">About Team</Link></li>
                <li><Link to="/portfolio" className="hover:text-blue-500 transition-colors">Portfolio Gallery</Link></li>
                <li><Link to="/blog" className="hover:text-blue-500 transition-colors">Blog Insights</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 font-mono">Inquire</h4>
              <p className="text-neutral-400 text-sm mb-4">Want to talk custom creative projects? Ping our studio lines.</p>
              <a href={`mailto:${email}`} className="text-sm font-semibold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-colors inline-block">
                {email}
              </a>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
            <div>
              &copy; {new Date().getFullYear()} HA Studio. Created with absolute architectural mastery.
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="hover:text-blue-500 transition-colors flex items-center gap-1">
                <Shield size={12} /> Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-blue-500 transition-colors flex items-center gap-1">
                <ScrollText size={12} /> Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
