import React from "react";
import { motion } from "motion/react";
import { 
  BarChart3, 
  Cpu, 
  Database, 
  Globe, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Search,
  ScanLine,
  Truck,
  Wrench,
  FileText,
  Users,
  Play
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function MarketingFeatures() {
  const featureGroups = [
    {
      title: "Core Infrastructure",
      features: [
        { icon: Database, name: "Centralized Asset Hub", desc: "Consolidate every asset into a single, high-performance database with custom attributes." },
        { icon: ScanLine, name: "QR/Barcode Ecosystem", desc: "Generate and manage unique identifiers for instant hardware-to-cloud mapping." },
        { icon: Search, name: "Semantic Global Search", desc: "Find anything across your enterprise instantly with intelligent filter logic." }
      ]
    },
    {
      title: "Operations & Maintenance",
      features: [
        { icon: Wrench, name: "Maintenance Lifecycle", desc: "Automate service tickets, track repairs, and manage preventive schedules." },
        { icon: FileText, name: "Contract & AMC Guard", desc: "Never miss a renewal with intelligent tracking for service level agreements." },
        { icon: Truck, name: "Supply Chain & Multi-Vendor", desc: "Directly manage vendor relationships and procurement flows within the platform." }
      ]
    },
    {
      title: "Intelligence & Compliance",
      features: [
        { icon: BarChart3, name: "Advanced Analytics", desc: "Real-time dashboards providing deep insights into asset health and fiscal utilization." },
        { icon: ShieldCheck, name: "Audit Integrity", desc: "Blockchain-inspired immutable logs for every asset interaction and state change." },
        { icon: Users, name: "Stakeholder Portals", desc: "Granular access for auditors, finance leads, and department managers." }
      ]
    }
  ];

  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* Header */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black text-brand uppercase tracking-[0.2em]">
            Feature Matrix v2.4
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.9]">
            The toolset of the <br /> <span className="text-brand">modern</span> auditor.
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl">
            We've stripped away the complexity of traditional ERPs to give you a focused, high-speed interface for physical operations.
          </p>
        </div>

        {/* Feature Groups */}
        <div className="space-y-40">
          {featureGroups.map((group, gIdx) => (
            <div key={group.title} className="space-y-12">
               <div className="flex items-center gap-4">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">{group.title}</h2>
                  <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16">
                  {group.features.map((f, fIdx) => (
                    <motion.div 
                      key={f.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: fIdx * 0.1 }}
                      className="space-y-6 group"
                    >
                       <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-brand group-hover:text-white transition-all transform group-hover:-rotate-3">
                          <f.icon className="w-8 h-8" />
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-brand transition-colors">
                          {f.name}
                       </h3>
                       <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                          {f.desc}
                       </p>
                    </motion.div>
                  ))}
               </div>
            </div>
          ))}
        </div>

        {/* Visual Showcase */}
        <div className="relative pt-40">
           <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                 <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                    Native Scanner <br /> <span className="text-brand">Performance.</span>
                 </h3>
                 <p className="text-slate-500 font-medium leading-relaxed">
                    Our proprietary scanning engine is optimized for low-light industrial environments. No special hardware required—just the device in your pocket.
                 </p>
                 <ul className="space-y-4">
                    {["0.2s identification speed", "Offline buffering and sync", "Batch processing support", "AI-assisted thermal detection"].map(item => (
                       <li key={item} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                          <Zap className="w-4 h-4 text-brand" /> {item}
                       </li>
                    ))}
                 </ul>
              </div>
              <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 ring-8 ring-slate-100 dark:ring-white/5">
                 <video 
                   autoPlay 
                   muted 
                   loop 
                   playsInline
                   className="w-full h-full object-cover opacity-60"
                   src="https://cdn.pixabay.com/vimeo/327424698/abstract-13735.mp4?width=1280&hash=8f8d6d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-brand text-white rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                       <Play className="w-8 h-8 fill-current ml-1" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
