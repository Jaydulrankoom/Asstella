import React, { Suspense } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  Cpu, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  ChevronRight,
  Globe,
  Database,
  Cloud,
  Lock,
  Building2,
  Stethoscope,
  School,
  Factory,
  Quote,
  Activity,
  Layers,
  Fingerprint
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import HeroScene from "../../components/marketing/HeroScene";

export default function MarketingHome() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="overflow-hidden bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 pt-20 pb-32">
        {/* 3D Scene Background */}
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>

        {/* Futuristic Background Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[60vw] h-full bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.15)_0,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[radial-gradient(circle_at_30%_70%,rgba(34,211,238,0.1)_0,transparent_70%)]" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12 text-center lg:text-left"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] backdrop-blur-3xl"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Future of Enterprise Infrastructure</span>
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black leading-[0.85] tracking-tighter uppercase">
                Enterprise Fixed <br />
                <span className="text-white">Asset</span> <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent italic">Intelligence</span>
              </h1>
              <p className="text-2xl text-slate-400 font-medium max-w-xl mx-auto lg:mx-0 leading-tight uppercase tracking-tight">
                For the modern organization. Track, manage, audit, and optimize every asset across its lifecycle.
              </p>
            </div>

            <div className="space-y-8">
              <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-semibold">
                Replace spreadsheets and disconnected ERP modules with a unified, audit-ready cloud platform. Real-time precision from procurement to depreciation.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <Link 
                  to="/app" 
                  className="group relative w-full sm:w-auto px-12 py-7 bg-blue-600 text-white font-black rounded-2xl shadow-[0_30px_60px_-15px_rgba(37,99,235,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-[0.2em] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  Get Started <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group w-full sm:w-auto px-12 py-7 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-[0.2em] backdrop-blur-3xl">
                  <Play className="w-4 h-4 fill-current text-blue-400 group-hover:scale-110 transition-transform" /> Request Demo
                </button>
              </div>
            </div>

            {/* Trusted by mini strip */}
            <div className="pt-10 flex flex-col items-center lg:items-start gap-6">
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Trusted by Digital Leaders</div>
               <div className="flex flex-wrap items-center gap-10 opacity-30 grayscale invert brightness-0 contrast-100">
                  <div className="text-xl font-black italic tracking-tighter">VERTEX</div>
                  <div className="text-xl font-black italic tracking-tighter">NEXUS</div>
                  <div className="text-xl font-black italic tracking-tighter">GLOBAL</div>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            {/* Dashboard Mockup - Glassmorphism */}
            <motion.div 
              style={{ y: y1 }}
              className="relative z-30 p-2 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] ring-1 ring-white/10"
            >
               <div className="bg-slate-950/80 rounded-[2.5rem] overflow-hidden aspect-[4/3] relative">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=1400" 
                    alt="Enterprise Dashboard" 
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  
                  {/* KPI Cards Overlay */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                     <div className="flex justify-between items-start">
                        <FloatingKpiCard 
                          icon={Database} 
                          label="Active Assets" 
                          value="12,482" 
                          sub="+4.2%" 
                          delay={0.5}
                        />
                        <FloatingKpiCard 
                          icon={ShieldCheck} 
                          label="Compliance" 
                          value="100%" 
                          sub="AUDIT READY" 
                          color="text-emerald-400"
                          delay={0.7}
                        />
                     </div>
                     <div className="flex justify-end">
                        <FloatingKpiCard 
                          icon={Activity} 
                          label="System Health" 
                          value="OPTIMAL" 
                          sub="2ms LATENCY" 
                          color="text-blue-400"
                          delay={0.9}
                        />
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* Depth Decoration */}
            <motion.div 
              style={{ y: y2 }}
              className="absolute -top-10 -right-10 w-full h-full border border-blue-500/20 rounded-[4rem] -z-10"
            />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
          </motion.div>
        </div>

        {/* Scroll Hint */}
        <motion.div 
          style={{ opacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
           <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Initialize Protocol</div>
           <div className="w-px h-16 bg-gradient-to-b from-blue-500 to-transparent animate-bounce" />
        </motion.div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-40 px-6 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="text-center space-y-8">
            <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em]">The Ecosystem</h2>
            <h3 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Strategic <br /> <span className="bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent italic">Interconnectivity.</span>
            </h3>
            <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium uppercase tracking-tight">
              We replaced disconnected modules with a unified intelligence layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             <BentoCard 
               icon={Layers} 
               title="Unified Registry" 
               desc="A single immutable ledger for every hardware node, building, and fleet vehicle." 
             />
             <BentoCard 
               icon={Fingerprint} 
               title="Smart Auditing" 
               desc="Military-grade verification workflows that satisfy global regulatory standards." 
             />
             <BentoCard 
               icon={Cpu} 
               title="Predictive Ops" 
               desc="AI-driven lifecycle forecasting that anticipates failure before it happens." 
               highlight
             />
             <BentoCard 
               icon={Lock} 
               title="Security First" 
               desc="End-to-end encryption for all physical asset data and financial logs." 
             />
             <BentoCard 
               icon={Cloud} 
               title="Cloud Native" 
               desc="Scale infinitely across regions without sacrificing sync speed or data integrity." 
             />
             <BentoCard 
               icon={BarChart3} 
               title="Fiscal Engine" 
               desc="Automated depreciation and capital planning for audit-ready tax filing." 
             />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-60 px-6 relative bg-white text-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-16">
           <h2 className="text-7xl md:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase">
             Master Your <br /> <span className="text-blue-600">Enterprise</span> <br /> Assets.
           </h2>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
              <Link 
                to="/app" 
                className="w-full sm:w-auto px-16 py-8 bg-blue-600 text-white font-black rounded-3xl shadow-3xl shadow-blue-500/40 hover:scale-105 transition-all text-sm uppercase tracking-widest"
              >
                Launch Platform
              </Link>
              <Link 
                to="/contact" 
                className="w-full sm:w-auto px-16 py-8 bg-transparent text-slate-900 font-black border-2 border-slate-200 rounded-3xl hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
              >
                Connect with Expert
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
}

function FloatingKpiCard({ icon: Icon, label, value, sub, color = "text-white", delay = 0 }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-6 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-3xl min-w-[200px] space-y-4"
    >
       <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg">
             <Icon className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
       </div>
       <div className="space-y-1">
          <div className={cn("text-2xl font-black tracking-tight", color)}>{value}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{sub}</div>
       </div>
    </motion.div>
  );
}

function BentoCard({ icon: Icon, title, desc, highlight }: any) {
  return (
    <div className={cn(
      "group p-12 rounded-[3.5rem] border transition-all duration-500 lg:hover:-translate-y-2",
      highlight ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/5 hover:border-blue-500/30"
    )}>
       <div className={cn(
         "w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110",
         highlight ? "bg-white/20" : "bg-white/5 text-blue-400"
       )}>
          <Icon className="w-8 h-8" />
       </div>
       <h4 className="text-3xl font-black uppercase tracking-tight mb-6">{title}</h4>
       <p className={cn(
         "text-lg font-medium tracking-tight leading-relaxed",
         highlight ? "text-blue-100" : "text-slate-500"
       )}>{desc}</p>
    </div>
  );
}
