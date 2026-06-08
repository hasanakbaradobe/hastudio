import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Package, Image, MessageSquare, FileText, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Plus, Upload, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalServices: 0,
    totalProjects: 0,
    totalMessages: 0,
    totalBlogPosts: 0
  });

  const [dbStatus, setDbStatus] = useState<any>({ isMocked: true });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    
    // Stats
    fetch('/api/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
          return new Promise<never>(() => {});
        }
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (!data.error) setStats(data);
      })
      .catch(console.error);

    // DB Status
    fetch('/api/db-status')
      .then(res => {
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        setDbStatus(data);
      })
      .catch(console.error);

    // Recent Messages
    fetch('/api/messages', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
          return new Promise<never>(() => {});
        }
        if (!res.ok) throw new Error("Status code: " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received non-JSON content");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setRecentMessages(data.slice(0, 3));
      })
      .catch(console.error);
  }, []);

  const statCards = [
    { label: 'Active Services', value: stats.totalServices, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10', path: '/admin/services' },
    { label: 'Portfolio Items', value: stats.totalProjects, icon: Image, color: 'text-purple-500', bg: 'bg-purple-500/10', path: '/admin/portfolio' },
    { label: 'Published Posts', value: stats.totalBlogPosts, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10', path: '/admin/blog' },
    { label: 'New Messages', value: stats.totalMessages, icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10', path: '/admin/messages' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 mb-1.5">Overview Summary</h2>
          <p className="text-neutral-400 text-sm">Real-time stats synced to your MySQL database engine.</p>
        </div>
        
        {/* Dynamic DB Status Indicator */}
        <div className="flex items-center gap-3">
          {dbStatus.isMocked ? (
            <div className="px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-xs flex items-center gap-2 max-w-md">
              <AlertTriangle size={15} />
              <span>Simulated fallback driver active (No connection credentials). Configure your `.env` to connect live.</span>
            </div>
          ) : (
            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>MySQL connected successfully: <span className="font-mono font-bold uppercase text-[10px]">{dbStatus.config?.database}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-neutral-950 border border-white/5 rounded-2xl p-6 relative group overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <Link to={stat.path} className="text-neutral-500 hover:text-white transition-colors">
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div>
                <div className="text-3xl font-mono font-black mb-1 text-white">{stat.value}</div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent form items */}
        <div className="lg:col-span-2 p-6 bg-neutral-950 border border-white/5 rounded-2xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Recent Inbound Messages</h3>
            <Link to="/admin/messages" className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-mono">
              ALL MESSAGES <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentMessages.map((msg: any) => (
              <div key={msg.id} className="p-4 bg-neutral-900 border border-white/5 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">{msg.name}</span>
                  <span className="text-[10px] font-mono text-neutral-500">{new Date(msg.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-neutral-400 font-medium font-mono">{msg.subject}</p>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{msg.message}</p>
              </div>
            ))}

            {recentMessages.length === 0 && (
              <div className="text-center py-12 text-sm text-neutral-600 border border-dashed border-neutral-900 rounded-xl">
                No inbox alerts currently.
              </div>
            )}
          </div>
        </div>

        {/* Quick Commands */}
        <div className="p-6 bg-neutral-950 border border-white/5 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold">Quick Sprints</h3>
          
          <div className="space-y-2.5">
            <Link 
              to="/admin/portfolio" 
              className="flex items-center justify-between p-4 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Plus className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold">Publish Showcase Case</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link 
              to="/admin/blog" 
              className="flex items-center justify-between p-4 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold">Write Journal Post</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link 
              to="/admin/media" 
              className="flex items-center justify-between p-4 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold">Upload Photo/Graphic</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link 
              to="/admin/settings" 
              className="flex items-center justify-between p-4 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold">Custom Settings Toggles</span>
              </div>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
