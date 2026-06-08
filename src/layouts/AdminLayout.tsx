import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, FileText, LogOut, Package, Image, MessageSquare, Star, Film, Menu, X, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

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
  const [isReady, setIsReady] = useState<boolean>(() => {
    return !!localStorage.getItem('logo_type');
  });

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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const fetchUnreadCount = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    fetch('/api/messages/unread-count', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
          return new Promise<never>(() => {});
        }
        if (!res.ok) throw new Error('Not authorized or error');
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (data && typeof data.count === 'number') {
          setUnreadCount(data.count);
        }
      })
      .catch(err => {
        // Handle gracefully
      });
  };

  useEffect(() => {
    fetchUnreadCount();

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

          setLogoType(type);
          setLogoText(text);
          setLogoImage(image);
          setLogoHeight(height);
          setIsReady(true);

          localStorage.setItem('logo_type', type);
          localStorage.setItem('logo_text', text);
          localStorage.setItem('logo_image', image);
          localStorage.setItem('logo_height', String(height));
          localStorage.setItem('settings_last_fetch', now.toString());
        }
      })
      .catch(err => {
        console.error(err);
        setIsReady(true);
      });
  }, [location.pathname]);

  useEffect(() => {
    fetchUnreadCount();

    const handleUpdate = () => {
      fetchUnreadCount();
    };
    window.addEventListener('messages-updated', handleUpdate);

    const interval = setInterval(fetchUnreadCount, 15000);

    return () => {
      window.removeEventListener('messages-updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Services', path: '/admin/services', icon: Package },
    { label: 'Portfolio', path: '/admin/portfolio', icon: Film },
    { label: 'Blog Posts', path: '/admin/blog', icon: FileText },
    { label: 'Testimonials', path: '/admin/testimonials', icon: Star },
    { label: 'Team Members', path: '/admin/team', icon: Users },
    { label: 'Inquiries/Messages', path: '/admin/messages', icon: MessageSquare },
    { label: 'Media Library', path: '/admin/media', icon: Image },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-50 flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <header className="md:hidden h-16 bg-black border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-50">
        <Link to="/" className="text-lg font-bold tracking-tighter flex items-center">
          {!isReady ? (
            <div style={{ height: `${Math.min(logoHeight, 24)}px` }} className="w-20 bg-neutral-800 animate-pulse rounded" />
          ) : logoType === 'image' && logoImage ? (
            <img 
              src={logoImage} 
              alt={logoText || "Brand Logo"} 
              style={{ height: `${Math.min(logoHeight, 32)}px` }}
              className="w-auto object-contain max-h-8" 
              referrerPolicy="no-referrer"
            />
          ) : (
            renderLogoContent(logoText)
          )}
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-neutral-300">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Rail */}
      <aside className={`w-full md:w-64 bg-black border-r border-white/10 flex flex-col shrink-0 ${
        mobileMenuOpen ? 'block' : 'hidden'
      } md:flex`}>
        <div className="h-20 flex items-center px-6 border-b border-white/10 hidden md:flex">
          <Link to="/" className="text-xl font-bold tracking-tighter flex items-center hover:opacity-80 transition-opacity">
            {!isReady ? (
              <div style={{ height: `${Math.min(logoHeight, 32)}px` }} className="w-24 bg-neutral-850 animate-pulse rounded" />
            ) : logoType === 'image' && logoImage ? (
              <img 
                src={logoImage} 
                alt={logoText || "Brand Logo"} 
                style={{ height: `${Math.min(logoHeight, 40)}px` }}
                className="w-auto object-contain max-h-12" 
                referrerPolicy="no-referrer"
              />
            ) : (
              renderLogoContent(logoText)
            )}
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isMessagesLink = item.path === '/admin/messages';
            return (
              <Link 
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-500 text-neutral-950 font-bold' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} className={isActive ? 'text-neutral-950' : 'text-neutral-400'} />
                  <span className="text-sm">{item.label}</span>
                </div>
                {isMessagesLink && unreadCount > 0 && (
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full transition-all ${
                    isActive 
                      ? 'bg-neutral-950 text-blue-500' 
                      : 'bg-blue-500 text-neutral-950'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5 bg-neutral-950">
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-3 px-3 py-2.5 w-full text-left rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Sign out admin</span>
          </button>
        </div>
      </aside>

      {/* Main Panel View Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-neutral-950 hidden md:flex shrink-0">
          <h2 className="text-base font-bold tracking-wider font-mono text-neutral-400 uppercase">
            Control Panel Area
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/10 rounded-full">
              ADMINISTRATOR
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-neutral-950 flex items-center justify-center font-bold text-sm">
              HA
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
