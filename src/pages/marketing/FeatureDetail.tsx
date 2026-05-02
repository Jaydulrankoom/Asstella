import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Database, 
  Calculator, 
  ShieldCheck, 
  Wrench, 
  ClipboardList, 
  MapPin, 
  BarChart3, 
  Link as LinkIcon,
  CheckCircle2,
  Zap,
  ArrowRight,
  Stethoscope,
  Factory,
  School
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const featuresData: Record<string, any> = {
  assets: {
    title: "Asset Management",
    icon: Database,
    desc: "The definitive source of truth for your physical infrastructure.",
    longDesc: "Asstella's Asset Management module provides a high-fidelity digital twin of your entire physical ecosystem. From the moment an asset is onboarded to its eventual retirement, every interaction is logged with military-grade precision.",
    highlights: [
      "Dynamic Attribute Schema: Custom fields for technical specs, location, and owner.",
      "QR & NFC Ecosystem: Instant hardware-to-cloud mapping via mobile scanning.",
      "Global Search: Find any asset across thousands of locations in under 200ms.",
      "Hierarchical Relationships: Map parent-child dependencies between complex assets."
    ],
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200"
  },
  finance: {
    title: "Depreciation & Finance",
    icon: Calculator,
    desc: "Audit-ready financial modeling for capital planning.",
    longDesc: "Eliminate the friction between operations and finance. Asstella's fiscal engine automates complex depreciation calculations, ensuring your balance sheet is always accurate and tax-ready.",
    highlights: [
      "Multi-Method Depreciation: Support for SLM, WDV, and custom fiscal formulas.",
      "Tax Compliance: Pre-configured schedules for global accounting standards.",
      "Capital Forecasting: Predict future replacement costs with AI-driven trend analysis.",
      "Instant Valuations: Real-time reporting on net book value across the enterprise."
    ],
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200"
  },
  audit: {
    title: "Audit & Compliance",
    icon: ShieldCheck,
    desc: "Immutable integrity for regulatory requirements.",
    longDesc: "Physical audits shouldn't be a nightmare. Our compliance hub orchestrates high-speed verification workflows that are transparent, verifiable, and completely paperless.",
    highlights: [
      "Blind Audits: Force physical interaction via QR verification.",
      "Immutable Audit Trails: Every state change timestamped and cryptographically secured.",
      "Regulatory Reporting: One-click export for ISO, GAAP, and local industry standards.",
      "Discrepancy Engine: Automated alerts for missing or moved assets."
    ],
    image: "https://images.unsplash.com/photo-1454165833767-027ff3302bc5?auto=format&fit=crop&q=80&w=1200"
  },
  maintenance: {
    title: "Maintenance & Warranty",
    icon: Wrench,
    desc: "Orchestrate uptime with precision scheduling.",
    longDesc: "Maximize asset lifespan through intelligent preventive maintenance. Asstella tracks every service ticket, warranty period, and replacement cycle to keep your operations running at 100%.",
    highlights: [
      "Preventive Scheduling: Automated triggers based on time, usage, or mileage.",
      "Warranty Guard: Smart alerts before coverage expiration to save on repair costs.",
      "Service History: Complete catalog of every repair, fluid change, or calibration.",
      "Vendor Coordination: Seamless ticket handoff to external service providers."
    ],
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200"
  },
  amc: {
    title: "AMC Contracts",
    icon: ClipboardList,
    desc: "Comprehensive guard for service agreements.",
    longDesc: "Consolidate and manage every Annual Maintenance Contract in one place. Never miss a renewal or lose sight of what your service providers are committed to deliver.",
    highlights: [
      "Renewal Optimization: Forecast upcoming expenses across your contract portfolio.",
      "SLA Tracking: Measure vendor performance against contractual uptime targets.",
      "Document Central: Store every legal agreement and service level annex securely.",
      "Cost Analysis: Identify high-maintenance vendors and optimize procurement."
    ],
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200"
  },
  gps: {
    title: "GPS Vehicle Tracking",
    icon: MapPin,
    desc: "Real-time logistics intelligence.",
    longDesc: "Asstella extends its asset tracking capabilities into the mobile world. Monitor your fleet's location, health, and utilization in real-time within a unified dashboard.",
    highlights: [
      "Live Fleet Map: Real-time coordinate updates for all mobile assets.",
      "Geofencing: Alerts for unauthorized movement or route deviations.",
      "Fuel & Health: Integration with OBD-II data for remote diagnostics.",
      "Utilization Heatmaps: Optimize route planning and fleet density."
    ],
    image: "https://images.unsplash.com/photo-1559251646-cd60161bc8df?auto=format&fit=crop&q=80&w=1200"
  },
  reports: {
    title: "Reports & Analytics",
    icon: BarChart3,
    desc: "Turn raw data into strategic foresight.",
    longDesc: "Move beyond static metrics. Our analytics engine provides multi-dimensional views of your asset ecosystem, allowing for data-driven capital decisions.",
    highlights: [
      "Automated Monthly Packs: Scheduled delivery of executive summaries.",
      "Real-time Dashboarding: Custom views for finance, operations, and IT.",
      "Predictive ROI: AI-assisted modeling for asset replacement cycles.",
      "Vendor Scorecards: Data-backed performance reviews for the supply chain."
    ],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200"
  },
  integrations: {
    title: "API & Integrations",
    icon: LinkIcon,
    desc: "A secure hub for the modern enterprise ecosystem.",
    longDesc: "Asstella is built to be the heart of your infrastructure. Our robust API and pre-built connectors ensure seamless data flow between HR, IT, and Finance systems.",
    highlights: [
      "RESTful API: Full access to every endpoint for custom internal builds.",
      "SSO & Directory Sync: Automated user provisioning via Azure AD/Okta.",
      "ERP Connectors: Native sync for SAP, Oracle, and Microsoft Dynamics.",
      "Webhook Architecture: Trigger external workflows on any asset state change."
    ],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200"
  },
  hospital: {
    title: "Hospital Asset Management",
    icon: Stethoscope,
    desc: "Critical care for your medical infrastructure.",
    longDesc: "From surgical robots to mobile ventilators, Asstella ensures life-critical hardware is tracked, sterilized, and maintained to the highest regulatory standards.",
    highlights: [
      "Sterility Log Tracking: Immutable records of sanitization cycles.",
      "Calibration Guard: Automated alerts for precision medical tool maintenance.",
      "Ward Mapping: Real-time location tracking for high-mobility medical assets.",
      "Compliance Ready: Built-in reports for healthcare regulatory bodies."
    ],
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200"
  },
  manufacturing: {
    title: "Manufacturing ERP Assets",
    icon: Factory,
    desc: "Orchestrate the heavy machinery of production.",
    longDesc: "Maximize OEE (Overall Equipment Effectiveness) by unifying your production line assets into a single intelligence layer. Monitor uptime, maintenance, and lifecycle value.",
    highlights: [
      "OEE Integration: Sync asset health with production performance metrics.",
      "Heavy Machine Lifecycle: Track value from commissioning to salvage.",
      "Maintenance Orchestration: Prevent costly line-stops with predictive tickets.",
      "Spare Part Sync: Link assets with their required maintenance inventory."
    ],
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200"
  },
  university: {
    title: "University Capital tracking",
    icon: School,
    desc: "Manage sprawling campuses with total visibility.",
    longDesc: "Universities are small cities. Asstella tracks everything from laboratory mass spectrometers to classroom furniture across hundreds of buildings and thousands of users.",
    highlights: [
      "Grant Compliance: Track assets purchased via specific research grants.",
      "Building Hierarchy: Map assets to specific rooms, floors, and campuses.",
      "Student/Staff Checkout: Manage temporary custody of mobile IT hardware.",
      "Budget Forecasting: Data-backed capital planning for next-gen campus growth."
    ],
    image: "https://images.unsplash.com/photo-1523050335192-ce11558cd97d?auto=format&fit=crop&q=80&w=1200"
  }
};

export default function MarketingFeatureDetail() {
  const { id } = useParams();
  const data = featuresData[id || "assets"];

  if (!data) return <div className="p-20 text-center">Protocol Not Found.</div>;

  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <motion.div 
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             className="space-y-8"
           >
              <div className="inline-flex items-center gap-3 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black text-brand uppercase tracking-[0.2em]">
                 <data.icon className="w-3 h-3" /> Technical Module: {id?.toUpperCase()}
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                 {data.title.split(' ')[0]} <br /> <span className="text-brand">{data.title.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-2xl text-slate-500 font-medium tracking-tight">
                 {data.desc}
              </p>
              <Link 
                to="/app" 
                className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-brand text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-widest"
              >
                 Start Implementation <ArrowRight className="w-5 h-5" />
              </Link>
           </motion.div>
           <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 group">
              <img src={data.image} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
           </div>
        </div>

        {/* Long Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
           <div className="lg:col-span-2 space-y-12">
              <h3 className="text-sm font-black text-brand uppercase tracking-[0.4em]">Core Capability</h3>
              <div className="text-3xl text-slate-900 dark:text-white font-medium leading-[1.3] tracking-tight">
                 {data.longDesc}
              </div>
           </div>
           <div className="space-y-8 p-10 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/10 h-fit">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Performance Indicators</h4>
              <ul className="space-y-6">
                 {data.highlights.map((h: string) => (
                    <li key={h} className="flex gap-4">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                       <span className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-tighter">{h}</span>
                    </li>
                 ))}
              </ul>
           </div>
        </div>

        {/* CTA */}
        <div className="bg-brand p-20 rounded-[4rem] text-center space-y-10 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent)]" />
           <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Ready to professionalize <br /> your {data.title}?</h3>
              <Link to="/contact" className="inline-block px-12 py-6 bg-white text-brand font-black rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-sm">
                 Request Enterprise Access
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
