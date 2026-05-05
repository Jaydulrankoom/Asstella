import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Filter,
  Building,
  Globe,
  Settings,
  Rocket,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Mail,
  Zap,
  Trash2,
  X,
  CreditCard,
  Layout,
  Palette,
  CheckCircle2,
  Monitor,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  Activity
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import api from "../../lib/api";

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: "trial" | "active" | "suspended" | "expired";
  plan_id: string;
  monthly_fee: number;
  onboarded_at?: string;
  created_at: string;
  white_label?: {
    branding?: { app_name?: string; logo_url?: string };
    theme?: { primary_color?: string; secondary_color?: string };
  };
}

export default function PlatformTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await api.get("/platform/tenants");
      setTenants(response.data.data);
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    return matchesSearch && t.status === filter;
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/platform/tenants/${id}/status`, { status });
      fetchTenants();
      if (selectedTenant?.id === id) {
        setSelectedTenant({ ...selectedTenant, status: status as any });
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleOnboard = async (id: string) => {
    try {
      await api.post(`/platform/tenants/${id}/onboard`);
      fetchTenants();
      if (selectedTenant?.id === id) {
        setSelectedTenant({ ...selectedTenant, status: 'active' });
      }
    } catch (error) {
      alert("Failed to complete onboarding");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto p-4 md:p-6 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <Building className="w-8 h-8 text-brand" /> Tenant Ecosystem
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Global lifecycle management and infrastructure orchestration
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full xl:w-auto px-8 py-3.5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> PROVISION NEW TENANT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Tenants" value={tenants.length} icon={Building} color="text-blue-500" />
        <StatCard title="Active Seats" value={tenants.filter(t => t.status === 'active').length} icon={CheckCircle2} color="text-emerald-500" />
        <StatCard title="Trial Sandbox" value={tenants.filter(t => t.status === 'trial').length} icon={Rocket} color="text-amber-500" />
        <StatCard title="Suspended" value={tenants.filter(t => t.status === 'suspended').length} icon={ShieldAlert} color="text-rose-500" />
      </div>

      <div className="bg-card-bg border border-border-dim rounded-2xl p-2 sm:p-3 flex flex-col xl:flex-row xl:items-center gap-3 shadow-sm">
        <div className="w-full xl:flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, subdomain or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-app-bg border border-border-dim rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:ring-1 focus:ring-brand outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full xl:w-auto">
          <div className="flex-1 xl:flex-none flex items-center gap-2 px-3 py-2 border border-border-dim rounded-xl xl:border-none">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 xl:flex-none bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer"
            >
              <option value="all">All States</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button 
            onClick={fetchTenants}
            className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-border-dim hover:bg-brand hover:text-white transition-all"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && tenants.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
             <RefreshCw className="w-12 h-12 text-brand animate-spin mx-auto opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Negotiating with Database...</p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white dark:bg-white/5 border border-dashed border-border-dim rounded-[3rem]">
            <Building className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">No tenants found matching your query</p>
          </div>
        ) : (
          filteredTenants.map((tenant) => (
            <TenantCard 
              key={tenant.id} 
              tenant={tenant} 
              onView={() => setSelectedTenant(tenant)}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateTenantModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onCreated={fetchTenants}
          />
        )}
        {selectedTenant && (
          <TenantDetailModal
            tenant={selectedTenant}
            onClose={() => setSelectedTenant(null)}
            onStatusUpdate={handleStatusUpdate}
            onOnboard={handleOnboard}
            onUpdated={fetchTenants}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card-bg border border-border-dim p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl bg-white dark:bg-white/5 border border-border-dim shadow-inner transition-colors group-hover:bg-brand/5", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</div>
    </div>
  );
}

function TenantCard({ tenant, onView }: { tenant: Tenant; onView: () => void }) {
  const statusColors = {
    active: "bg-emerald-500 text-white",
    trial: "bg-amber-500 text-white",
    suspended: "bg-rose-500 text-white",
    expired: "bg-slate-500 text-white",
  };

  return (
    <motion.div
      layoutId={tenant.id}
      onClick={onView}
      className="bg-card-bg border border-border-dim rounded-[2.5rem] p-8 hover:border-brand/40 transition-all cursor-pointer group shadow-sm hover:shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 group-hover:bg-brand/10 transition-all"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="w-16 h-16 bg-white dark:bg-white/5 border border-border-dim rounded-2xl flex items-center justify-center text-2xl font-black text-brand shadow-inner group-hover:scale-110 transition-transform">
          {tenant.name.substring(0, 2).toUpperCase()}
        </div>
        <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg", statusColors[tenant.status])}>
          {tenant.status}
        </span>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-1">
           <Globe className="w-3 h-3 text-brand" />
           <span className="text-[10px] font-black text-brand uppercase tracking-tighter cursor-copy group-hover:underline">
            {tenant.subdomain}.asstella.io
          </span>
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-brand transition-colors truncate">
          {tenant.name}
        </h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-70">
          ID: {tenant.id.substring(0, 8)}...
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-border-dim flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Plan</span>
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">{tenant.plan_id}</span>
          </div>
          <div className="w-[1px] h-6 bg-border-dim"></div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fee</span>
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">${tenant.monthly_fee}/mo</span>
          </div>
        </div>
        <div className="p-2 bg-brand/10 rounded-full text-brand opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

function CreateTenantModal({ onClose, onCreated }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    adminEmail: "",
    planId: "starter",
    monthlyFee: 99
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/platform/tenants", formData);
      onCreated();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-app-bg border border-border-dim w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 border-b border-border-dim bg-white/5">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-brand text-white rounded-2xl shadow-xl shadow-brand/20">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-black text-xl uppercase tracking-tight text-slate-900 dark:text-white">Provision New Tenant</h3>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tenant Business Name</label>
              <input
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-card-bg border border-border-dim px-5 py-4 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-brand outline-none"
                placeholder="Acme Industrial Corp"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subdomain</label>
                <div className="relative">
                  <input
                    required
                    value={formData.subdomain}
                    onChange={e => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="w-full bg-card-bg border border-border-dim px-5 py-4 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-brand outline-none pr-24"
                    placeholder="acme"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">.asstella.io</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Plan</label>
                <select
                  value={formData.planId}
                  onChange={e => setFormData({...formData, planId: e.target.value})}
                  className="w-full bg-card-bg border border-border-dim px-5 py-4 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-brand outline-none"
                >
                  <option value="starter">Starter Plan</option>
                  <option value="business">Business Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Admin Email</label>
              <input
                required
                type="email"
                value={formData.adminEmail}
                onChange={e => setFormData({...formData, adminEmail: e.target.value})}
                className="w-full bg-card-bg border border-border-dim px-5 py-4 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-brand outline-none"
                placeholder="admin@acme.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "EXECUTE PROVISIONING"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function TenantDetailModal({ tenant, onClose, onStatusUpdate, onOnboard, onUpdated }: any) {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingWL, setEditingWL] = useState(false);
  const [wlData, setWlData] = useState({
    branding: {
       app_name: tenant.white_label?.branding?.app_name || tenant.name,
       logo_url: tenant.white_label?.branding?.logo_url || ''
    },
    theme: {
       primary_color: tenant.white_label?.theme?.primary_color || '#6366f1',
       secondary_color: tenant.white_label?.theme?.secondary_color || '#1e293b'
    }
  });

  const handleUpdateWhiteLabel = async () => {
    try {
      await api.patch(`/platform/tenants/${tenant.id}/white-label`, wlData);
      setEditingWL(false);
      onUpdated();
    } catch (error) {
      alert("Failed to update white label settings");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="bg-app-bg border border-border-dim w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[85vh] relative"
      >
        <button onClick={onClose} className="absolute top-8 right-8 z-50 p-3 bg-white dark:bg-white/5 rounded-2xl border border-border-dim shadow-xl hover:rotate-90 transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Sidebar */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border-dim bg-slate-50/50 dark:bg-black/20 p-10 flex flex-col">
          <div className="w-24 h-24 bg-brand text-white rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-app-bg mx-auto mb-6">
            {tenant.name.substring(0, 2).toUpperCase()}
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight text-center leading-none mb-1">{tenant.name}</h3>
          <p className="text-[10px] font-black text-brand uppercase tracking-widest text-center">{tenant.subdomain}.asstella.io</p>

          <div className="mt-10 space-y-1">
             <SidebarTab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Layout} label="Lifecycle Overview" />
             <SidebarTab active={activeTab === 'whitelabel'} onClick={() => setActiveTab('whitelabel')} icon={Palette} label="White-Label UI" />
             <SidebarTab active={activeTab === 'usage'} onClick={() => setActiveTab('usage')} icon={Activity} label="Usage & Limits" />
             <SidebarTab active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={CreditCard} label="Billing Status" />
          </div>

          <div className="mt-auto pt-10 space-y-3">
             {tenant.status === 'trial' && (
               <button onClick={() => onOnboard(tenant.id)} className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                 <Rocket className="w-4 h-4" /> COMPLETE ONBOARDING
               </button>
             )}
             {tenant.status === 'active' ? (
               <button onClick={() => onStatusUpdate(tenant.id, 'suspended')} className="w-full py-4 bg-rose-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all">
                 SUSPEND ACCESS
               </button>
             ) : tenant.status === 'suspended' && (
                <button onClick={() => onStatusUpdate(tenant.id, 'active')} className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                  ACTIVATE TENANT
                </button>
             )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
           {activeTab === 'overview' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-2 gap-6">
                   <InfoBox label="Onboarded On" value={tenant.onboarded_at ? new Date(tenant.onboarded_at).toLocaleDateString() : 'N/A'} />
                   <InfoBox label="Current Status" value={tenant.status.toUpperCase()} />
                   <InfoBox label="Plan Tier" value={tenant.plan_id.toUpperCase()} />
                   <InfoBox label="Monthly Commitment" value={`$${tenant.monthly_fee}`} />
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-border-dim pb-4 flex items-center gap-2">
                     <Monitor className="w-4 h-4" /> Infrastructure Health
                   </h4>
                   <div className="grid grid-cols-1 gap-4">
                      <HealthRow label="Subdomain Routing" status="active" />
                      <HealthRow label="Database Cluster" status="active" />
                      <HealthRow label="Storage Bucket" status="active" />
                      <HealthRow label="SSL Certificate" status="active" />
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'whitelabel' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Appearance Customization</h4>
                   <button 
                    onClick={() => editingWL ? handleUpdateWhiteLabel() : setEditingWL(true)}
                    className="px-6 py-2 bg-brand text-white font-black rounded-xl text-[10px] uppercase tracking-widest"
                   >
                     {editingWL ? "COMMIT SETTINGS" : "ENTER EDIT MODE"}
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase">App Display Name</label>
                         <input 
                           disabled={!editingWL}
                           value={wlData.branding.app_name}
                           onChange={e => setWlData({...wlData, branding: {...wlData.branding, app_name: e.target.value}})}
                           className="w-full bg-card-bg border border-border-dim p-4 rounded-xl text-sm font-bold disabled:opacity-50"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase">Custom Logo URL</label>
                         <input 
                           disabled={!editingWL}
                           value={wlData.branding.logo_url}
                           onChange={e => setWlData({...wlData, branding: {...wlData.branding, logo_url: e.target.value}})}
                           className="w-full bg-card-bg border border-border-dim p-4 rounded-xl text-sm font-bold disabled:opacity-50"
                         />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase">Primary Brand Color</label>
                         <div className="flex gap-4">
                           <input 
                            type="color"
                            disabled={!editingWL}
                            value={wlData.theme.primary_color}
                            onChange={e => setWlData({...wlData, theme: {...wlData.theme, primary_color: e.target.value}})}
                            className="w-14 h-14 rounded-xl cursor-pointer border-none p-0"
                           />
                           <input 
                            disabled={!editingWL}
                            value={wlData.theme.primary_color}
                            onChange={e => setWlData({...wlData, theme: {...wlData.theme, primary_color: e.target.value}})}
                            className="flex-1 bg-card-bg border border-border-dim p-4 rounded-xl text-sm font-bold uppercase disabled:opacity-50"
                           />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 border border-dashed border-border-dim rounded-[2rem] bg-white/5 flex flex-col items-center justify-center text-center">
                   <Layout className="w-8 h-8 text-slate-300 mb-4" />
                   <p className="text-[10px] font-bold text-slate-500 uppercase max-w-xs">These settings directly override the UI framework for {tenant.name} users across mobile and web.</p>
                </div>
             </div>
           )}

           {activeTab === 'usage' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="p-10 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] flex items-center justify-center text-center">
                   <div className="space-y-4">
                      <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
                      <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase">Real-time Usage Unavailable</h4>
                      <p className="text-xs text-slate-500 font-bold max-w-sm uppercase">Detailed usage aggregation for global tenants is currently migrating to the new analytics engine.</p>
                   </div>
                </div>
             </div>
           )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SidebarTab({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
        active 
          ? "bg-brand text-white shadow-xl shadow-brand/20" 
          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 bg-card-bg border border-border-dim rounded-2xl">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
       <div className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">{value}</div>
    </div>
  );
}

function HealthRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-5 bg-card-bg border border-border-dim rounded-2xl group hover:border-emerald-500/30 transition-all">
       <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-emerald-500 uppercase">Normal</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
       </div>
    </div>
  );
}
