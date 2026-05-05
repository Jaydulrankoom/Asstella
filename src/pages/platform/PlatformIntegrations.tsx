import React, { useState, useEffect } from "react";
import {
  Share2,
  Plus,
  Search,
  MoreVertical,
  Activity,
  Globe,
  Settings,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Zap,
  Trash2,
  X,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Key,
  Webhook,
  MapPin,
  Lock,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import api from "../../lib/api";

export default function PlatformIntegrations() {
  const [activeTab, setActiveTab] = useState("gps");
  const [loading, setLoading] = useState(true);
  const [gpsProviders, setGpsProviders] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gpsRes, apiRes, webRes] = await Promise.all([
        api.get("/platform/integrations/gps-providers"),
        api.get("/platform/integrations/api-keys"),
        api.get("/platform/integrations/webhooks"),
      ]);
      setGpsProviders(gpsRes.data.data);
      setApiKeys(apiRes.data.data);
      setWebhooks(webRes.data.data);
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto p-4 md:p-6 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <Share2 className="w-8 h-8 text-brand" /> Platform Integrations
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            API Infrastructure, GPS Hub, and Event Streaming
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border-dim scrollbar-hide overflow-x-auto">
        <TabButton active={activeTab === 'gps'} onClick={() => setActiveTab('gps')} icon={MapPin} label="GPS Providers" />
        <TabButton active={activeTab === 'apikeys'} onClick={() => setActiveTab('apikeys')} icon={Key} label="System API Keys" />
        <TabButton active={activeTab === 'webhooks'} onClick={() => setActiveTab('webhooks')} icon={Webhook} label="Webhooks Orchestrator" />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-10 h-10 text-brand animate-spin mx-auto mb-4 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Connecting to Service Mesh...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
             {activeTab === 'gps' && (
               <motion.div key="gps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 <GpsSection providers={gpsProviders} onRefresh={fetchData} />
               </motion.div>
             )}
             {activeTab === 'apikeys' && (
               <motion.div key="keys" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 <ApiKeysSection apiKeys={apiKeys} onRefresh={fetchData} />
               </motion.div>
             )}
              {activeTab === 'webhooks' && (
               <motion.div key="webhooks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 <WebhooksSection webhooks={webhooks} onRefresh={fetchData} />
               </motion.div>
             )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
        active 
          ? "border-brand text-brand bg-brand/5" 
          : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function GpsSection({ providers, onRefresh }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-card-bg border border-border-dim p-6 rounded-3xl">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">External GPS Providers</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Shared infrastructure for real-time asset tracking</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-brand text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Provider
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p: any) => (
            <div key={p.id} className="bg-card-bg border border-border-dim rounded-[2rem] p-8 shadow-sm hover:border-brand/30 transition-all group">
               <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-white dark:bg-white/5 border border-border-dim rounded-xl flex items-center justify-center text-brand">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest">Active</span>
               </div>
               <h4 className="text-xl font-black uppercase tracking-tight mb-1">{p.name}</h4>
               <p className="text-[10px] font-mono text-slate-500 truncate mb-6">{p.api_base_url}</p>
               
               <div className="pt-6 border-t border-border-dim flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Auth Type</span>
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">{p.auth_type}</span>
                  </div>
                  <button className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400 hover:text-brand transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))}
       </div>

       <AnimatePresence>
          {isModalOpen && <GpsProviderModal onClose={() => setIsModalOpen(false)} onRefresh={onRefresh} />}
       </AnimatePresence>
    </div>
  );
}

function GpsProviderModal({ onClose, onRefresh }: any) {
  const [formData, setFormData] = useState({
     name: '',
     api_base_url: '',
     auth_type: 'api_key',
     credentials: { api_key: '' }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/platform/integrations/gps-providers', formData);
      onRefresh();
      onClose();
    } catch (e) { alert("Failed to add provider"); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-app-bg border border-border-dim w-full max-w-lg rounded-[2.5rem] p-10 relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X /></button>
        <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Register GPS Gateway</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">Provider Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-card-bg border border-border-dim p-4 rounded-xl font-bold" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">API Base URL</label>
              <input required value={formData.api_base_url} onChange={e => setFormData({...formData, api_base_url: e.target.value})} className="w-full bg-card-bg border border-border-dim p-4 rounded-xl font-bold" />
           </div>
           <button type="submit" className="w-full py-5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 uppercase text-xs tracking-widest">Connect Cluster</button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ApiKeysSection({ apiKeys, onRefresh }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const revokeKey = async (id: string) => {
    if (!confirm("Revoking this key will instantly cut off all API access for the linked tenant. Proceed?")) return;
    try {
      await api.delete(`/platform/integrations/api-keys/${id}`);
      onRefresh();
    } catch (e) { alert("Revoke failed"); }
  };

  return (
    <div className="space-y-6">
       <div className="bg-card-bg border border-border-dim p-6 rounded-3xl flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">API Management Control</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Generate and revoke system-wide access tokens</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-brand text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20 flex items-center gap-2"
          >
            <Key className="w-4 h-4" /> Issue NEW Key
          </button>
       </div>

       <div className="bg-card-bg border border-border-dim rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left">
             <thead className="bg-slate-50 dark:bg-white/5 border-b border-border-dim">
                <tr>
                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Endpoint/Name</th>
                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Prefix Identification</th>
                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tenant Affinity</th>
                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Created</th>
                   <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-border-dim">
                {apiKeys.map((k: any) => (
                  <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6 font-black text-slate-900 dark:text-white uppercase tracking-tight">{k.name}</td>
                    <td className="px-8 py-6"><code className="bg-slate-100 dark:bg-white/10 px-2 py-1 rounded text-[10px] font-mono text-brand font-black">{k.key_prefix}********</code></td>
                    <td className="px-8 py-6 text-xs text-slate-500 font-bold uppercase">{k.tenant_id}</td>
                    <td className="px-8 py-6 text-xs text-slate-400 font-bold uppercase">{new Date(k.created_at).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-right">
                       <button onClick={() => revokeKey(k.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>

       <AnimatePresence>
          {isModalOpen && (
            <ApiKeyModal 
              onClose={() => setIsModalOpen(false)} 
              onCreated={(key: string) => { setNewKey(key); onRefresh(); }} 
            />
          )}
          {newKey && (
            <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
               <div className="bg-app-bg border border-brand/50 rounded-[2.5rem] p-10 max-w-xl text-center space-y-6 shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl"><Lock className="w-10 h-10" /></div>
                   <h3 className="text-2xl font-black uppercase tracking-tight">API Key Generated</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed">Copy this key now. It will NEVER be shown again in the platform. Store it in a secure hardware token or vault.</p>
                   <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-2xl border border-border-dim relative group">
                      <code className="text-xs font-mono text-brand font-black break-all">{newKey}</code>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(newKey); alert("Copied to clipboard!"); }}
                        className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-border-dim"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                   </div>
                   <button 
                    onClick={() => setNewKey(null)}
                    className="px-8 py-4 bg-brand text-white font-black rounded-2xl uppercase tracking-widest text-xs w-full shadow-lg shadow-brand/20"
                   >
                    I have stored the key securely
                   </button>
               </div>
            </div>
          )}
       </AnimatePresence>
    </div>
  );
}

function ApiKeyModal({ onClose, onCreated }: any) {
  const [formData, setFormData] = useState({ name: '', tenant_id: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/platform/integrations/api-keys', formData);
      onCreated(res.data.data.full_key);
      onClose();
    } catch (e) { alert("Failed to generate key"); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-app-bg border border-border-dim w-full max-w-lg rounded-[3rem] p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16"></div>
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X /></button>
        <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Issue Global API Token</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Description (Label)</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-card-bg border border-border-dim p-5 rounded-2xl font-bold font-mono text-sm" placeholder="e.g. ERP Internal Integration" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant ID Policy</label>
              <input required value={formData.tenant_id} onChange={e => setFormData({...formData, tenant_id: e.target.value})} className="w-full bg-card-bg border border-border-dim p-5 rounded-2xl font-bold font-mono text-sm uppercase" placeholder="e.g. tenant-abc-123" />
           </div>
           <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
           >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "DISPATCH CRYPTOGRAPHIC KEY"}
           </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function WebhooksSection({ webhooks, onRefresh }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleWebhook = async (id: string) => {
     try {
       await api.patch(`/platform/integrations/webhooks/${id}/toggle`);
       onRefresh();
     } catch (e) { alert("Toggle failed"); }
  };

  const testWebhook = async (id: string) => {
    try {
      await api.post(`/platform/integrations/webhooks/${id}/test`);
      alert("Test event dispatched to sink URL!");
    } catch (e) { alert("Test dispatch failed"); }
  };

  return (
    <div className="space-y-6">
       <div className="bg-card-bg border border-border-dim p-6 rounded-3xl flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Event Streaming (Webhooks)</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">HTTP push notifications for real-time lifecycle synchronization</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-brand text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20 flex items-center gap-2"
          >
            <Webhook className="w-4 h-4" /> Create STREAM
          </button>
       </div>

       <div className="grid grid-cols-1 gap-4">
          {webhooks.map((w: any) => (
             <div key={w.id} className="bg-app-bg border border-border-dim rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-brand/40 transition-all">
                <div className="flex items-center gap-5">
                   <div className={cn("p-4 rounded-2xl bg-white dark:bg-white/5 border border-border-dim", w.is_active ? "text-brand" : "text-slate-300")}>
                      <Webhook className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        {w.target_url} 
                        {w.is_active ? <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> : <span className="w-2 h-2 bg-slate-300 rounded-full"></span>}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Events: {w.events_subscribed?.join(", ")}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => testWebhook(w.id)}
                     className="px-4 py-2 border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                   >
                     Test Signal
                   </button>
                   <button 
                     onClick={() => toggleWebhook(w.id)}
                     className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", w.is_active ? "bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white")}
                   >
                     {w.is_active ? "Deactivate" : "Activate"}
                   </button>
                </div>
             </div>
          ))}
       </div>

       <AnimatePresence>
          {isModalOpen && <WebhookModal onClose={() => setIsModalOpen(false)} onRefresh={onRefresh} />}
       </AnimatePresence>
    </div>
  );
}

function WebhookModal({ onClose, onRefresh }: any) {
  const [formData, setFormData] = useState({ target_url: '', events_subscribed: ['tenant.created', 'tenant.suspended'] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/platform/integrations/webhooks', formData);
      onRefresh();
      onClose();
    } catch (e) { alert("Failed to create webhook"); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-app-bg border border-border-dim w-full max-w-lg rounded-[3rem] p-12 relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X /></button>
        <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Define Event Sink</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Delivery URL</label>
              <input required value={formData.target_url} onChange={e => setFormData({...formData, target_url: e.target.value})} className="w-full bg-card-bg border border-border-dim p-4 rounded-xl font-bold font-mono text-sm" placeholder="https://api.yourdomain.com/webhooks" />
           </div>
           <button type="submit" className="w-full py-5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 uppercase text-xs tracking-widest">Initialize Stream</button>
        </form>
      </motion.div>
    </motion.div>
  );
}
