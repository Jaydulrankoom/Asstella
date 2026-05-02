import React, { useState, useRef } from "react";
import { 
  User, 
  Mail, 
  Briefcase, 
  Phone, 
  Shield, 
  Lock, 
  MapPin, 
  Camera, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Globe, 
  Save, 
  Key, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "social">("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demo user state
  const [profile, setProfile] = useState({
    firstName: "Sabbir",
    lastName: "Khan",
    email: "Admin@asstella.com",
    phone: "+1 (555) 000-1234",
    position: "Super Admin",
    department: "Executive Board",
    location: "Global HQ - New York",
    bio: "Chief Technical Officer & System Architect overseeing the enterprise asset logistics network.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sabbir",
    socials: {
      facebook: "https://facebook.com/sabbir.khan",
      twitter: "https://twitter.com/sabbir_asstella",
      linkedin: "https://linkedin.com/in/sabbir-architect"
    }
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 p-2 sm:p-0" id="profile_page">
      {/* Header Card */}
      <div className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="h-24 sm:h-32 bg-gradient-to-r from-brand to-brand-light opacity-50 absolute top-0 left-0 w-full"></div>
        <div className="pt-12 sm:pt-16 pb-6 sm:pb-8 px-6 sm:px-8 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-app-bg shadow-xl bg-app-bg">
              <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={handleAvatarClick}
              className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 sm:p-2 bg-brand text-white rounded-lg sm:rounded-xl shadow-lg sm:opacity-0 group-hover:opacity-100 transition-all active:scale-90"
              title="Change Photo"
            >
              <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {profile.firstName} {profile.lastName}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-[9px] sm:text-xs font-black text-brand bg-brand/10 px-3 py-1 rounded-full uppercase tracking-widest border border-brand/20">
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {profile.position}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-500">
                <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {profile.email}
              </span>
              <span className="hidden sm:flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-500">
                <Briefcase className="w-3.5 h-3.5" /> {profile.department}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand text-white font-black text-[10px] sm:text-xs px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg shadow-brand/20 transition-all hover:opacity-90 active:scale-95 uppercase tracking-widest disabled:opacity-50",
                saveSuccess && "bg-emerald-500 shadow-emerald-500/20"
              )}
            >
              {isSaving ? "Syncing..." : saveSuccess ? <><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Updated</> : <><Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Save changes</>}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Horizontal scroll on mobile */}
      <div className="bg-card-bg border border-border-dim rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-app-bg/50 px-4 sm:px-8 flex gap-4 sm:gap-8 overflow-x-auto custom-scrollbar whitespace-nowrap">
           <TabButton label="Personal" fullLabel="Personal info" id="personal" active={activeTab} onClick={setActiveTab} icon={User} />
           <TabButton label="Security" fullLabel="Security" id="security" active={activeTab} onClick={setActiveTab} icon={Lock} />
           <TabButton label="Social" fullLabel="Social Links" id="social" active={activeTab} onClick={setActiveTab} icon={Globe} />
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[500px]">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === "personal" && (
              <motion.div 
                key="personal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField label="First Name" value={profile.firstName} onChange={v => setProfile({...profile, firstName: v})} icon={User} />
                  <InputField label="Last Name" value={profile.lastName} onChange={v => setProfile({...profile, lastName: v})} icon={User} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <InputField label="Position / Title" value={profile.position} onChange={v => setProfile({...profile, position: v})} icon={Briefcase} />
                   <InputField label="Department" value={profile.department} onChange={v => setProfile({...profile, department: v})} icon={Shield} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField label="Phone Number" value={profile.phone} onChange={v => setProfile({...profile, phone: v})} icon={Phone} />
                  <InputField label="Location" value={profile.location} onChange={v => setProfile({...profile, location: v})} icon={MapPin} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">About / Bio</label>
                  <textarea 
                    value={profile.bio} 
                    onChange={e => setProfile({...profile, bio: e.target.value})}
                    className="w-full bg-app-bg border border-border-dim rounded-2xl p-4 text-sm min-h-[120px] focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl space-y-8"
              >
                <div>
                   <h3 className="text-lg font-bold mb-1">Passcode Management</h3>
                   <p className="text-xs text-slate-500">Update your account password. Ensure it contains at least 8 characters.</p>
                </div>

                <div className="max-w-md space-y-5">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Current Password</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="password" 
                          value={passwords.current}
                          onChange={e => setPasswords({...passwords, current: e.target.value})}
                          className="w-full bg-app-bg border border-border-dim rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-brand/20 outline-none" 
                        />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="password" 
                          value={passwords.new}
                          onChange={e => setPasswords({...passwords, new: e.target.value})}
                          className="w-full bg-app-bg border border-border-dim rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-brand/20 outline-none" 
                        />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="password" 
                          value={passwords.confirm}
                          onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                          className="w-full bg-app-bg border border-border-dim rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-brand/20 outline-none" 
                        />
                      </div>
                   </div>
                   <button 
                     onClick={handleSave}
                     className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl mt-4 uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all text-xs"
                   >
                     Update Security Credentials
                   </button>
                </div>
              </motion.div>
            )}

            {activeTab === "social" && (
              <motion.div 
                key="social"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card-bg border border-border-dim rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
              >
                <div>
                   <h3 className="text-lg font-bold mb-1">Corporate Social Presence</h3>
                   <p className="text-xs text-slate-500">Connect your professional platforms for better enterprise collaboration.</p>
                </div>

                <div className="space-y-6">
                  <InputField label="LinkedIn Profile" value={profile.socials.linkedin} onChange={v => setProfile({...profile, socials: {...profile.socials, linkedin: v}})} icon={Linkedin} />
                  <InputField label="Twitter / X" value={profile.socials.twitter} onChange={v => setProfile({...profile, socials: {...profile.socials, twitter: v}})} icon={Twitter} />
                  <InputField label="Facebook" value={profile.socials.facebook} onChange={v => setProfile({...profile, socials: {...profile.socials, facebook: v}})} icon={Facebook} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-brand/10 border border-brand/20 p-6 rounded-2xl sm:rounded-3xl space-y-4 shadow-sm">
             <h3 className="text-xs font-black text-brand uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4" /> System Permissions
             </h3>
             <ul className="space-y-4">
                <PermissionNode icon={CheckCircle2} label="Direct Asset Acquisition" />
                <PermissionNode icon={CheckCircle2} label="Financial Journal Approval" />
                <PermissionNode icon={CheckCircle2} label="System-wide Audit Control" />
                <PermissionNode icon={CheckCircle2} label="User Role Management" />
                <PermissionNode icon={AlertCircle} label="Remote DB Access" disabled />
             </ul>
          </div>

          <div className="bg-card-bg border border-border-dim p-6 rounded-2xl sm:rounded-3xl">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Account Metadata</h3>
             <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold">
                   <span className="text-slate-500">Member Since</span>
                   <span className="text-slate-900 dark:text-white">Jan 2024</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                   <span className="text-slate-500">Instance Tier</span>
                   <span className="text-brand">Enterprise</span>
                 </div>
                <div className="flex justify-between text-xs font-bold">
                   <span className="text-slate-500">Last Login</span>
                   <span className="text-slate-900 dark:text-white">2h ago</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

  );
}

function TabButton({ label, id, active, onClick, icon: Icon }: any) {
  const isActive = active === id;
  return (
    <button 
      onClick={() => onClick(id)}
      className={cn(
        "py-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all relative",
        isActive ? "text-brand border-brand" : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function InputField({ label, value, onChange, icon: Icon }: { label: string, value: string, onChange: (v: string) => void, icon: any }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="w-full bg-app-bg border border-border-dim rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-brand/20 outline-none transition-all"
        />
      </div>
    </div>
  );
}

function PermissionNode({ icon: Icon, label, disabled }: any) {
  return (
    <li className={cn("flex items-center gap-3 text-xs font-bold", disabled ? "text-slate-400 opacity-50" : "text-slate-900 dark:text-white")}>
      <Icon className={cn("w-4 h-4", disabled ? "text-slate-400" : "text-emerald-500")} />
      {label}
    </li>
  );
}
