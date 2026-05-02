import React, { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  Lock, 
  Save, 
  RotateCcw,
  CheckCircle2,
  Trash2,
  Plus,
  Eye,
  Edit3,
  Search,
  Key,
  Smartphone,
  Cloud,
  FileJson,
  Building2,
  DollarSign,
  Clock,
  Languages
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
}

const initialRoles: Role[] = [
  { id: "1", name: "Super Admin", description: "Global root access. Can modify system infrastructure and global security policies.", usersCount: 1, permissions: ["all"] },
  { id: "2", name: "Company Admin", description: "Full operational control over assets, users, and procurement within the organization.", usersCount: 2, permissions: ["users.manage", "assets.full", "procurement.admin", "reports.view"] },
  { id: "3", name: "Employee", description: "Standard access for viewing assets and submitting maintenance or purchase requests.", usersCount: 25, permissions: ["assets.view", "maintenance.request", "procurement.request"] },
  { id: "4", name: "Asset Manager", description: "Specialized access for lifecycle management, auditing, and maintenance coordination.", usersCount: 5, permissions: ["assets.view", "assets.edit", "maintenance.view", "audit.start"] },
  { id: "5", name: "Procurement Officer", description: "Handles vendor relations, purchase requests, and supply chain logistics.", usersCount: 3, permissions: ["procurement.create", "vendors.manage"] },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // General Settings State
  const [general, setGeneral] = useState({
    companyName: "Asstella",
    domain: "asstella.com",
    currency: "USD ($)",
    timezone: "UTC-5 (New York)",
    language: "English (US)",
    dateFormat: "DD/MM/YYYY",
    fiscalStart: "January",
  });

  // Notifications State
  const [notifSettings, setNotifSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    maintenanceReminder: "2 Days Before",
    warrantyExpiry: "30 Days Before",
    lowInventory: true,
  });

  // Roles State
  const [roles, setRoles] = useState<Role[]>(initialRoles);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500" id="settings_page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
             <SettingsIcon className="w-8 h-8 text-brand" /> System Settings
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Configure global ERP parameters and governance</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setGeneral({ companyName: "Asstella", domain: "asstella.com", currency: "USD ($)", timezone: "UTC-5 (New York)", language: "English (US)", dateFormat: "DD/MM/YYYY", fiscalStart: "January" })}
            className="p-3 bg-slate-100 dark:bg-white/5 border border-border-dim rounded-xl text-slate-500 hover:text-brand transition-all flex-shrink-0"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "btn-primary px-8 py-3 flex items-center gap-2 flex-grow sm:flex-none min-w-0 sm:min-w-[160px] justify-center text-xs",
              saveSuccess && "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
            )}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : saveSuccess ? (
              <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Applied</span></>
            ) : (
              <><Save className="w-4 h-4 flex-shrink-0" /> <span className="truncate">Save Config</span></>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Navigation Sidebar */}
      <div className="lg:col-span-3 space-y-4">
          <div className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-3xl p-2 shadow-xl overflow-x-auto custom-scrollbar no-scrollbar">
             <nav className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
                <NavButton id="general" label="Profile" fullLabel="Company Profile" icon={Building2} active={activeTab} onClick={setActiveTab} />
                <NavButton id="roles" label="Roles" fullLabel="Roles & Permissions" icon={Shield} active={activeTab} onClick={setActiveTab} />
                <NavButton id="notifications" label="Notifs" fullLabel="Notification Center" icon={Bell} active={activeTab} onClick={setActiveTab} />
                <NavButton id="security" label="Security" fullLabel="Security & Access" icon={Lock} active={activeTab} onClick={setActiveTab} />
                <NavButton id="localization" label="Local" fullLabel="Localization" icon={Globe} active={activeTab} onClick={setActiveTab} />
                <NavButton id="storage" label="Storage" fullLabel="Storage & Backup" icon={Database} active={activeTab} onClick={setActiveTab} />
             </nav>
          </div>

          <div className="hidden lg:block bg-brand/5 border border-brand/10 rounded-3xl p-6">
             <h4 className="text-[10px] font-black text-brand uppercase tracking-widest mb-2 flex items-center gap-2">
                <Shield className="w-3 h-3" /> Audit Log
             </h4>
             <p className="text-xs text-slate-500 leading-relaxed italic">All changes made to system settings are recorded in the global encrypted audit trail.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
             {activeTab === "general" && (
                <motion.div 
                   key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl space-y-8 sm:space-y-10"
                >
                   <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-brand/10 border-2 border-dashed border-brand/30 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-brand group cursor-pointer hover:bg-brand/20 transition-all">
                         <Cloud className="w-6 h-6 sm:w-8 sm:h-8 mb-1" />
                         <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter">Upload Logo</span>
                      </div>
                      <div>
                         <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity & Branding</h3>
                         <p className="text-xs text-slate-500 mt-1 max-w-sm">Define how your organization appears in reports and system white-labelling.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                      <SettingsInput label="Company Name" value={general.companyName} onChange={v => setGeneral({...general, companyName: v})} icon={Building2} />
                      <SettingsSelect 
                        label="Reporting Currency" 
                        value={general.currency} 
                        options={["USD ($)", "EUR (€)", "GBP (£)", "JPY (¥)", "INR (₹)"]} 
                        onChange={v => setGeneral({...general, currency: v})} 
                        icon={DollarSign}
                      />
                      <SettingsSelect 
                        label="System Timezone" 
                        value={general.timezone} 
                        options={["UTC-5 (New York)", "UTC+0 (London)", "UTC+1 (Paris)", "UTC+5:30 (Mumbai)", "UTC+8 (Singapore)"]} 
                        onChange={v => setGeneral({...general, timezone: v})} 
                        icon={Clock}
                      />
                      <SettingsSelect 
                        label="Date Display Format" 
                        value={general.dateFormat} 
                        options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]} 
                        onChange={v => setGeneral({...general, dateFormat: v})} 
                        icon={Clock}
                      />
                   </div>
                </motion.div>
             )}

             {activeTab === "roles" && (
                <motion.div 
                  key="roles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                   <div className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 text-center sm:text-left">
                         <div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Governance & RBAC</h3>
                            <p className="text-xs text-slate-500 mt-1">Manage Role-Based Access Control policies.</p>
                         </div>
                         <button className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95">
                            <Plus className="w-4 h-4" /> New Role
                         </button>
                      </div>

                      <div className="overflow-hidden border border-border-dim rounded-2xl divide-y divide-border-dim">
                         {roles.map(role => (
                            <div key={role.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                               <div className="flex items-start sm:items-center gap-4">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-white/10 rounded-xl sm:rounded-2xl flex-shrink-0 flex items-center justify-center text-slate-500">
                                     <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-2">
                                        <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-tight">{role.name}</h4>
                                        <span className="px-1.5 py-0.5 bg-brand/10 text-brand text-[8px] font-black rounded-md uppercase">{role.usersCount} Users</span>
                                     </div>
                                     <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">{role.description}</p>
                                  </div>
                               </div>
                             <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="flex-1 sm:flex-none p-2 md:p-2.5 bg-white dark:bg-white/5 border border-border-dim rounded-lg sm:rounded-xl hover:text-brand transition-all flex items-center justify-center"><Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                  <button className="flex-1 sm:flex-none p-2 md:p-2.5 bg-white dark:bg-white/5 border border-border-dim rounded-lg sm:rounded-xl hover:text-rose-500 transition-all flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 p-6 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row gap-4">
                      <div className="p-2 bg-amber-500 text-white rounded-xl h-fit w-fit mx-auto sm:mx-0">
                         <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="text-center sm:text-left">
                         <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">MFA Enforcement Policy</h4>
                         <p className="text-[11px] text-amber-700 dark:text-amber-300/70 leading-relaxed">Enable Multi-Factor Authentication for all high-privilege roles to prevent unauthorized perimeter breaches.</p>
                         <button className="mt-3 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest hover:underline">Harden Policies Now</button>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === "notifications" && (
                <motion.div 
                  key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl space-y-8 sm:space-y-10"
                >
                   <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Notification Channels</h3>
                      <p className="text-xs text-slate-500 mt-1">Configure automated triggers and dispatch protocols.</p>
                   </div>

                   <div className="space-y-6">
                      <ToggleSetting 
                        title="Email Dispatch" 
                        desc="Send transaction receipts via encrypted email." 
                        active={notifSettings.emailAlerts} 
                        onChange={v => setNotifSettings({...notifSettings, emailAlerts: v})} 
                      />
                      <ToggleSetting 
                        title="Push Protocol" 
                        desc="Desktop and mobile push notifications." 
                        active={notifSettings.pushNotifications} 
                        onChange={v => setNotifSettings({...notifSettings, pushNotifications: v})} 
                      />
                      <ToggleSetting 
                        title="SMS Gateway" 
                        desc="Critical security alerts via SMS." 
                        active={notifSettings.smsAlerts} 
                        onChange={v => setNotifSettings({...notifSettings, smsAlerts: v})} 
                      />
                   </div>

                   <div className="pt-8 sm:pt-10 border-t border-border-dim">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1 text-center sm:text-left">Trigger Thresholds</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                         <SettingsSelect 
                            label="Maintenance Warnings" 
                            value={notifSettings.maintenanceReminder} 
                            options={["On Due Date", "1 Day Before", "2 Days Before", "1 Week Before"]} 
                            onChange={v => setNotifSettings({...notifSettings, maintenanceReminder: v})} 
                            icon={Clock}
                         />
                         <SettingsSelect 
                            label="Warranty Expiry Alert" 
                            value={notifSettings.warrantyExpiry} 
                            options={["30 Days Before", "60 Days Before", "90 Days Before"]} 
                            onChange={v => setNotifSettings({...notifSettings, warrantyExpiry: v})} 
                            icon={Clock}
                         />
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === "storage" && (
                <motion.div 
                   key="storage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl space-y-8 sm:space-y-10"
                >
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                         <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Infrastructure & Data</h3>
                         <p className="text-xs text-slate-500 mt-1">Configure asset storage and database redundancy.</p>
                      </div>
                      <div className="mx-auto sm:mx-0 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                         Optimal
                      </div>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      <div className="p-6 sm:p-8 bg-slate-50 dark:bg-black/20 border border-border-dim rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                         <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                            <Cloud className="w-6 h-6 sm:w-8 sm:h-8" />
                         </div>
                         <div className="flex-1 w-full">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Main Storage (Amazon S3)</h4>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Bucket: asset-erp-prod • 42 / 500 GB</p>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-full mt-3 overflow-hidden text-left">
                               <div className="w-[8%] h-full bg-blue-500 rounded-full"></div>
                            </div>
                         </div>
                         <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Manage</button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="p-6 border border-border-dim rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                               <FileJson className="w-5 h-5 text-slate-400" />
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Encrypted</span>
                            </div>
                            <h5 className="text-xs font-black uppercase">Snapshots</h5>
                            <button className="w-full py-3 bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-brand hover:text-white transition-all">Manual Backup</button>
                         </div>
                         <div className="p-6 border border-border-dim rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                               <RotateCcw className="w-5 h-5 text-slate-400" />
                               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                            </div>
                            <h5 className="text-xs font-black uppercase">Daily Sync</h5>
                            <button className="w-full py-3 bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-brand hover:text-white transition-all">Schedule</button>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === "security" && (
                <motion.div 
                   key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl space-y-10"
                >
                   <div className="text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Perimeter & Identity</h3>
                      <p className="text-xs text-slate-500 mt-1">Manage network access and authentication policies.</p>
                   </div>

                   <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2 px-1">
                               <Smartphone className="w-3.5 h-3.5" /> 2FA Governance
                            </h4>
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl sm:rounded-3xl border border-border-dim">
                               <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4 text-center sm:text-left">Require biometric or TOTP authentication for all privileged operations.</p>
                               <ToggleSetting title="Global Enable" desc="" active={true} onChange={() => {}} />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2 px-1">
                               <Languages className="w-3.5 h-3.5" /> IP Whitelist
                            </h4>
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl sm:rounded-3xl border border-border-dim">
                               <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4 text-center sm:text-left">Restrict access to office-based internal networks only.</p>
                               <button className="w-full py-3 border border-dashed border-slate-300 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-brand hover:border-brand transition-all">Add Allowed IP</button>
                            </div>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-border-dim">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active API Keys</h4>
                           <button className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline">+ Generate Key</button>
                        </div>
                        <div className="space-y-3">
                           <div className="p-4 bg-app-bg border border-border-dim rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                 <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-500 flex-shrink-0"><Key className="w-4 h-4" /></div>
                                 <div className="overflow-hidden">
                                    <p className="text-xs font-black uppercase tracking-tight">Main Production Key</p>
                                    <p className="text-[9px] text-slate-500 font-mono truncate max-w-[200px] sm:max-w-none">erp_pk_live_********************a901</p>
                                 </div>
                              </div>
                              <span className="text-[9px] font-black text-slate-400 uppercase self-end sm:self-auto">Created 2m ago</span>
                           </div>
                        </div>
                      </div>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function NavButton({ id, label, fullLabel, icon: Icon, active, onClick }: any) {
  const isActive = active === id;
  return (
    <button 
      onClick={() => onClick(id)}
      className={cn(
        "flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
        isActive 
          ? "bg-brand text-white shadow-lg shadow-brand/20" 
          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
      )}
    >
      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
      <span className="hidden lg:inline">{fullLabel}</span>
      <span className="lg:hidden">{label}</span>
    </button>
  );
}

function SettingsInput({ label, value, onChange, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="w-full bg-app-bg border border-border-dim rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-brand/20 outline-none transition-all font-medium"
        />
      </div>
    </div>
  );
}

function SettingsSelect({ label, value, options, onChange, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="w-full bg-app-bg border border-border-dim rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-brand/20 outline-none transition-all font-bold appearance-none"
        >
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    </div>
  );
}

function ToggleSetting({ title, desc, active, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-1">
      <div>
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button 
        onClick={() => onChange(!active)}
        className={cn(
          "w-12 h-6 rounded-full transition-all relative",
          active ? "bg-brand shadow-inner shadow-black/20" : "bg-slate-200 dark:bg-white/10"
        )}
      >
        <motion.div 
          animate={{ x: active ? 26 : 4 }}
          className="w-4 h-4 bg-white rounded-full shadow-md mt-1"
        />
      </button>
    </div>
  );
}
