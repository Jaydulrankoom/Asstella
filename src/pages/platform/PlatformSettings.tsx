import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  Globe,
  CreditCard,
  Lock,
  Save,
  RefreshCw,
  AlertTriangle,
  Server,
  Mail,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Database,
  Cloud,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import api from "../../lib/api";

type SettingsTab = "general" | "payment" | "infrastructure" | "email";

export default function PlatformSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/platform/settings");
      setSettings(response.data.data);
    } catch (error) {
      console.error("Failed to fetch platform settings:", error);
      setMessage({ type: 'error', text: 'Failed to load system configuration' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSetting = (path: string, value: any) => {
    if (!settings) return;
    const keys = path.split('.');
    setSettings((prev: any) => {
      if (!prev) return prev;
      const newSettings = JSON.parse(JSON.stringify(prev));
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/platform/settings", settings);
      setMessage({ type: 'success', text: 'Platform configuration updated successfully' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to synchronize settings with cluster' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-brand animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Control Plane...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-brand" /> Control Plane Settings
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Global orchestration, financial primitives, and infrastructure policy
          </p>
        </div>
        <div className="flex items-center gap-3">
           <AnimatePresence>
             {message && (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 exit={{ opacity: 0, x: 20 }}
                 className={cn(
                   "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border",
                   message.type === 'success' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                 )}
               >
                 {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                 {message.text}
               </motion.div>
             )}
           </AnimatePresence>
           <button
             onClick={saveSettings}
             disabled={saving || !settings}
             className="px-8 py-3.5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
           >
             {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
             {saving ? "PROPAGATING..." : "SAVE GLOBAL CHANGES"}
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-card-bg border border-border-dim rounded-[2.5rem] p-4 flex flex-col gap-1 sticky top-6">
             <NavButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Server} label="General Settings" />
             <NavButton active={activeTab === 'payment'} onClick={() => setActiveTab('payment')} icon={CreditCard} label="Payment Gateways" />
             <NavButton active={activeTab === 'infrastructure'} onClick={() => setActiveTab('infrastructure')} icon={Cloud} label="Infrastructure" />
             <NavButton active={activeTab === 'email'} onClick={() => setActiveTab('email')} icon={Mail} label="Messaging" />
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 min-w-0">
           <div className="bg-card-bg border border-border-dim rounded-[3rem] p-8 md:p-12 shadow-sm min-h-[400px] flex items-stretch">
              {!settings ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                   <AlertTriangle className="w-12 h-12 text-slate-300 mb-4" />
                   <h4 className="text-sm font-black uppercase tracking-tight text-slate-400">Settings Repository Offline</h4>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 max-w-xs">The management plane returned an authorization error or connection failure.</p>
                   <button onClick={fetchSettings} className="mt-6 px-6 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand hover:text-white transition-all">Retry Handshake</button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {activeTab === 'general' && <GeneralSettings settings={settings} onUpdate={handleUpdateSetting} />}
                  {activeTab === 'payment' && <PaymentSettings settings={settings} onUpdate={handleUpdateSetting} />}
                  {activeTab === 'infrastructure' && <InfrastructureSettings settings={settings} onUpdate={handleUpdateSetting} />}
                  {activeTab === 'email' && <MessagingSettings settings={settings} onUpdate={handleUpdateSetting} />}
                </AnimatePresence>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all text-left",
        active 
          ? "bg-brand text-white shadow-xl shadow-brand/20" 
          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function GeneralSettings({ settings, onUpdate }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
       <div>
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">Platform Policy & Status</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Control high-level platform behavior and onboarding gates.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <SettingField 
            label="Maintenance Mode" 
            description="Globally freeze all tenant access for scheduled maintenance."
          >
            <ToggleSwitch 
              checked={settings?.system?.maintenance_mode} 
              onChange={(v) => onUpdate('system.maintenance_mode', v)} 
            />
          </SettingField>

          <SettingField 
            label="Open Registration" 
            description="Allow new tenants to sign up from the public marketing site."
          >
            <ToggleSwitch 
              checked={settings?.system?.registration_open} 
              onChange={(v) => onUpdate('system.registration_open', v)} 
            />
          </SettingField>

          <SettingField 
            label="Default Trial Period" 
            description="Standard duration (days) for new trial environments."
          >
             <input 
               type="number"
               value={settings?.system?.default_trial_days || 14}
               onChange={(e) => onUpdate('system.default_trial_days', parseInt(e.target.value))}
               className="w-full bg-slate-50 dark:bg-white/5 border border-border-dim px-4 py-3 rounded-xl text-xs font-bold"
             />
          </SettingField>
          
          <SettingField 
            label="System Currency" 
            description="Base currency for internal platform billing."
          >
             <select 
               value={settings?.system?.currency || 'USD'}
               onChange={(e) => onUpdate('system.currency', e.target.value)}
               className="w-full bg-slate-50 dark:bg-white/5 border border-border-dim px-4 py-3 rounded-xl text-xs font-bold"
             >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
             </select>
          </SettingField>
       </div>
    </motion.div>
  );
}

function PaymentSettings({ settings, onUpdate }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
       <div>
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">Financial Primitives</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect and manage global payment sinks and currency policies.</p>
       </div>

       <div className="space-y-8">
          <div className="p-8 border border-border-dim rounded-[2rem] bg-slate-50 dark:bg-white/5">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-border-dim">
                   <CreditCard className="w-6 h-6 text-[#635BFF]" />
                </div>
                <div>
                   <h4 className="font-black uppercase tracking-tight">Stripe Connect Integration</h4>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary payment rail for multi-tenant billing.</p>
                </div>
                <div className="ml-auto">
                   <ToggleSwitch 
                    checked={settings?.payments?.stripe_enabled} 
                    onChange={(v) => onUpdate('payments.stripe_enabled', v)} 
                   />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-dim">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Secret Key</label>
                   <div className="relative">
                      <input 
                        type="password"
                        value={settings?.payments?.stripe_secret_key || ''}
                        onChange={(e) => onUpdate('payments.stripe_secret_key', e.target.value)}
                        placeholder="sk_live_..."
                        className="w-full bg-white dark:bg-black/20 border border-border-dim p-4 rounded-xl text-xs font-mono"
                      />
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Webhook Signing Secret</label>
                   <input 
                     type="text"
                     value={settings?.payments?.stripe_webhook_secret || ''}
                     onChange={(e) => onUpdate('payments.stripe_webhook_secret', e.target.value)}
                     placeholder="whsec_..."
                     className="w-full bg-white dark:bg-black/20 border border-border-dim p-4 rounded-xl text-xs font-mono"
                   />
                </div>
             </div>
          </div>

          <div className="p-8 border border-border-dim rounded-[2rem] opacity-50 grayscale cursor-not-allowed">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-border-dim">
                   <RefreshCw className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                   <h4 className="font-black uppercase tracking-tight">PayPal Legacy Integration</h4>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Legacy sink for historical tenants.</p>
                </div>
                <span className="ml-auto bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[8px] font-black uppercase">Coming Soon</span>
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function InfrastructureSettings({ settings, onUpdate }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
       <div>
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">Network & Domains</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provision subdomains, SSL policies, and DNS orchestrators.</p>
       </div>

       <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <SettingField 
              label="Platform Root Domain" 
              description="Primary base domain for all tenant subdomains."
             >
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    value={settings?.infra?.root_domain || 'asstella.io'}
                    onChange={(e) => onUpdate('infra.root_domain', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-border-dim pl-12 pr-4 py-3 rounded-xl text-xs font-bold"
                  />
                </div>
             </SettingField>

             <SettingField 
              label="SSL Provisioner" 
              description="Global engine for auto-issuing certificates."
             >
                <select className="w-full bg-slate-50 dark:bg-white/5 border border-border-dim px-4 py-3 rounded-xl text-xs font-bold">
                   <option>Let's Encrypt / ACME</option>
                   <option>Cloudflare API</option>
                   <option>AWS ACM</option>
                </select>
             </SettingField>
          </div>

          <div className="p-8 bg-brand/5 border border-brand/20 rounded-[2rem] flex items-center justify-between">
             <div className="flex items-center gap-4">
                <ShieldCheck className="w-8 h-8 text-brand" />
                <div>
                   <h4 className="font-black uppercase tracking-tight text-brand">Auto-HTTPS Enforced</h4>
                   <p className="text-[10px] font-bold text-brand/70 uppercase tracking-widest">Redirect all tenant traffic to secure TLS channels.</p>
                </div>
             </div>
             <ToggleSwitch checked={true} onChange={() => {}} />
          </div>
       </div>
    </motion.div>
  );
}

function MessagingSettings({ settings, onUpdate }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
       <div>
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">Relay Infrastructure</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configures SMTP, SMS, and global push notification gateways.</p>
       </div>

       <div className="space-y-8">
          <SettingField 
            label="Global Email Provider" 
            description="Relay system for tenant onboarding and invitations."
          >
             <select 
               value={settings?.messaging?.provider || 'sendgrid'}
               onChange={(e) => onUpdate('messaging.provider', e.target.value)}
               className="w-full bg-slate-50 dark:bg-white/5 border border-border-dim px-4 py-3 rounded-xl text-xs font-bold"
             >
                <option value="sendgrid">SendGrid API</option>
                <option value="postmark">Postmark App</option>
                <option value="ses">Amazon SES</option>
                <option value="smtp">Custom SMTP Relay</option>
             </select>
          </SettingField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relay API Key</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                   <input 
                    type="password"
                    value={settings?.messaging?.api_key || ''}
                    onChange={(e) => onUpdate('messaging.api_key', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-border-dim pl-12 pr-4 py-3 rounded-xl text-xs font-mono"
                   />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System From Address</label>
                <input 
                  type="email"
                  value={settings?.messaging?.from_email || 'noreply@asstella.io'}
                  onChange={(e) => onUpdate('messaging.from_email', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-border-dim px-4 py-3 rounded-xl text-xs font-bold"
                />
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function SettingField({ label, description, children }: any) {
  return (
    <div className="space-y-2">
       <div className="flex items-center justify-between mb-2">
          <div>
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none">{label}</h4>
             <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 leading-relaxed max-w-[240px]">{description}</p>
          </div>
       </div>
       <div className="pt-2">
          {children}
       </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
        checked ? "bg-brand" : "bg-slate-200 dark:bg-white/10"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
