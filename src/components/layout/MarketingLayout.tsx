import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Menu, 
  X, 
  ChevronDown, 
  Github, 
  Twitter, 
  Linkedin, 
  Facebook,
  Database,
  Calculator,
  Wrench,
  ShieldCheck,
  MapPin,
  BarChart3,
  Link as LinkIcon,
  ChevronRight,
  ClipboardList,
  Stethoscope,
  Factory,
  School
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const featureGroups = [
  {
    title: "Intelligence",
    items: [
      { name: "Fixed Asset Management", href: "/features/assets", icon: Database, desc: "Global lifecycle tracking registry." },
      { name: "Depreciation Systems", href: "/features/finance", icon: Calculator, desc: "Audit-ready capital modeling." },
      { name: "Compliance & Audit", href: "/features/audit", icon: ShieldCheck, desc: "Immutable regulatory log tracking." },
    ]
  },
  {
    title: "Deployment",
    items: [
      { name: "Lifecycle Maintenance", href: "/features/maintenance", icon: Wrench, desc: "Orchestrate preventive uptime." },
      { name: "AMC Management", href: "/features/amc", icon: ClipboardList, desc: "Service agreement guard." },
      { name: "GPS Fleet Intelligence", href: "/features/gps", icon: MapPin, desc: "Real-time logistics control." },
    ]
  },
  {
    title: "Verticals",
    items: [
      { name: "Hospital Ecosystems", href: "/features/hospital", icon: Stethoscope, desc: "Medical hardware tracking." },
      { name: "Manufacturing Assets", href: "/features/manufacturing", icon: Factory, desc: "Production line orchestration." },
      { name: "University Campus", href: "/features/university", icon: School, desc: "Sprawling infrastructure." },
    ]
  }
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = React.useState<string | null>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mega menu on navigation
  React.useEffect(() => {
    setActiveMegaMenu(null);
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-brand selection:text-white dark:text-white transition-colors duration-500">
      {/* Navigation */}
      <nav 
        className={cn(
          "fixed top-0 inset-x-0 z-[60] transition-all duration-500 px-6 py-4",
          scrolled ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-sm py-3" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Asstella</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <div 
              className="relative group"
              onMouseEnter={() => setActiveMegaMenu("features")}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button 
                className={cn(
                  "flex items-center gap-1 text-sm font-bold uppercase tracking-widest transition-colors",
                  location.pathname.startsWith("/features") ? "text-brand" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Features <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", activeMegaMenu === "features" && "rotate-180")} />
              </button>

              <AnimatePresence>
                {activeMegaMenu === "features" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute top-full -left-1/2 pt-6 w-[800px]"
                  >
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-white/5 grid grid-cols-3 gap-10">
                       {featureGroups.map(group => (
                         <div key={group.title} className="space-y-6">
                            <h4 className="text-[10px] font-black text-brand uppercase tracking-[0.3em]">{group.title}</h4>
                            <div className="space-y-4">
                               {group.items.map(item => (
                                 <Link 
                                   key={item.href} 
                                   to={item.href}
                                   className="group/item flex gap-4 items-start"
                                 >
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover/item:bg-brand group-hover/item:text-white transition-all">
                                       <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                       <div className="text-sm font-bold text-slate-900 dark:text-white group-hover/item:text-brand transition-colors">{item.name}</div>
                                       <div className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-tighter mt-0.5">{item.desc}</div>
                                    </div>
                                 </Link>
                               ))}
                            </div>
                         </div>
                       ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/pricing" label="Pricing" active={location.pathname === "/pricing"} />
            <NavLink to="/about" label="About" active={location.pathname === "/about"} />
            <NavLink to="/blog" label="Insights" active={location.pathname === "/blog"} />
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Link to="/app" className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest">
              Login
            </Link>
            <Link 
              to="/app" 
              className="px-8 py-3 bg-brand text-white text-sm font-black rounded-xl shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 bg-white dark:bg-slate-950 z-[70] p-6 flex flex-col gap-10 lg:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between">
               <Link to="/" className="flex items-center gap-2">
                 <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                   <Zap className="w-5 h-5 text-white" />
                 </div>
                 <span className="text-xl font-black text-slate-900 dark:text-white uppercase">Asstella</span>
               </Link>
               <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-500"><X /></button>
            </div>

            <div className="space-y-8">
               {featureGroups.map(group => (
                 <div key={group.title} className="space-y-4">
                    <h4 className="text-[10px] font-black text-brand uppercase tracking-widest">{group.title}</h4>
                    <div className="grid grid-cols-1 gap-4">
                       {group.items.map(item => (
                         <Link key={item.href} to={item.href} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                            <item.icon className="w-6 h-6 text-brand" />
                            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{item.name}</span>
                         </Link>
                       ))}
                    </div>
                 </div>
               ))}
            </div>

            <div className="flex flex-col gap-4 mt-auto">
              <Link to="/app" className="w-full py-5 bg-brand text-white text-center rounded-2xl font-black uppercase tracking-widest text-sm">Launch Application</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-32 px-6 border-t border-white/5 overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[150px] -mr-80 -mb-80" />
        
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
            <div className="lg:col-span-2 space-y-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-black uppercase tracking-tighter">Asstella</span>
              </Link>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm font-medium">
                The strategic operating system for global physical enterprise. Precision management at scale.
              </p>
              <div className="flex gap-4">
                <SocialIcon icon={Twitter} />
                <SocialIcon icon={Github} />
                <SocialIcon icon={Linkedin} />
                <SocialIcon icon={Facebook} />
              </div>
            </div>

            <FooterGroup 
              title="Solutions" 
              links={[
                { label: "Universities", href: "/use-cases/education" },
                { label: "Healthcare", href: "/use-cases/health" },
                { label: "Manufacturing", href: "/use-cases/manufacturing" },
                { label: "Public Sector", href: "/use-cases/government" },
              ]} 
            />

            <FooterGroup 
              title="Intelligence" 
              links={[
                { label: "Asset Lifecycle", href: "/features/assets" },
                { label: "Compliance Hub", href: "/features/audit" },
                { label: "Ecosystem API", href: "/features/integrations" },
                { label: "Mobile Scanner", href: "/features/assets" },
              ]} 
            />

            <FooterGroup 
              title="Connect" 
              links={[
                { label: "About Team", href: "/about" },
                { label: "Contact Sales", href: "/contact" },
                { label: "Partners", href: "/partners" },
                { label: "Insights", href: "/blog" },
              ]} 
            />
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              <div className="flex flex-wrap justify-center gap-10">
                 <span>© 2024 ASSTELLA CORP.</span>
                 <Link to="/privacy" className="hover:text-white transition-colors">Privacy & Security</Link>
                 <Link to="/terms" className="hover:text-white transition-colors">Legal Terms</Link>
                 <Link to="/cookies" className="hover:text-white transition-colors">Cookie Schema</Link>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 SYSTEMS OPERATIONAL
              </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link 
      to={to}
      className={cn(
        "text-sm font-bold uppercase tracking-widest transition-colors",
        active ? "text-brand" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      {label}
    </Link>
  );
}

function FooterGroup({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="space-y-8">
      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand">{title}</h4>
      <ul className="space-y-5">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.href} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ icon: Icon }: { icon: any }) {
  return (
    <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-brand hover:text-white transition-all transform hover:-translate-y-1">
      <Icon className="w-5 h-5" />
    </button>
  );
}
