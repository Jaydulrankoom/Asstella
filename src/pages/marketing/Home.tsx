import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  Play,
  CheckCircle2,
  ArrowRight,
  EyeOff,
  FileText,
  Wrench,
  ClipboardList,
  TrendingDown,
  QrCode,
  Calculator,
  ShieldCheck,
  Award,
  MapPin,
  Link as LinkIcon,
  Check,
  Rocket,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function MarketingHome() {
  return (
    <div className="bg-white text-slate-900 font-sans">
      {/* Hero Section */}
      <section className="bg-[#0b1120] pt-28 pb-20 lg:pt-36 lg:pb-24 px-6 relative overflow-hidden -mt-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 -z-10" />

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 w-full overflow-visible">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 lg:col-span-5"
          >
            <div className="inline-flex px-4 py-2 rounded-full bg-slate-800/80 text-white text-[13px] font-semibold border border-white/5 shadow-inner">
              #1 Fixed Asset Management SaaS
            </div>

            <h1 className="text-4xl md:text-[45px] font-bold tracking-tight text-white leading-[1.15]">
              Track. Manage. Optimize.
              <br />
              All Your Assets in{" "}
              <span className="text-blue-500">One Flow.</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Asstella is a cloud-based, multi-tenant ERP that helps
              organizations track, manage and optimize their fixed asset
              lifecycle with precision and control.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                to="/app"
                className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-[15px]"
              >
                Start Free Trial <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <button className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-white/20 text-white font-semibold rounded-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-[15px]">
                <Play className="w-4 h-4 fill-current opacity-80" /> Book a Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[13px] text-white pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                <span>Quick Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                <span>Cancel Anytime</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:col-span-7"
          >
            <div className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-sm shadow-blue-900/10 flex items-center justify-center bg-[#0f172a]/50">
              <img
                src="https://asstella.com/Dashboard%20Image.webp"
                alt="Dashboard Preview"
                className="w-full h-auto object-contain"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-b border-slate-100 px-6">
        <div className="max-w-[1400px] mx-auto text-center space-y-8">
          <h3 className="text-slate-600 font-medium">
            Trusted by Leading Organizations Worldwide
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-2xl font-black tracking-tighter">
              MIT UNIVERSITY
            </div>
            <div className="text-xl font-bold text-blue-800">
              Apollo HOSPITALS
            </div>
            <div className="text-2xl font-black text-blue-900">TATA STEEL</div>
            <div className="text-2xl font-black text-yellow-600">UltraTech</div>
            <div className="text-2xl font-bold text-black border-2 border-black px-2">
              Deloitte.
            </div>
            <div className="text-2xl font-serif text-blue-900">
              Yale UNIVERSITY
            </div>
            <div className="text-2xl font-bold text-green-700">adani</div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-center">
          <div className="space-y-4">
            <h4 className="text-blue-600 font-medium">The Problem</h4>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">
              Invisible Asset Loss is
              <br />
              <span className="text-blue-600">Draining Your Business</span>
            </h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
            <ProblemCard
              icon={EyeOff}
              color="text-blue-500"
              bg="bg-blue-50"
              title="No Visibility"
              desc="No real-time visibility into asset location, status and ownership."
            />
            <ProblemCard
              icon={FileText}
              color="text-blue-500"
              bg="bg-blue-50"
              title="Manual Tracking"
              desc="Spreadsheets and paper registers lead to errors and data loss."
            />
            <ProblemCard
              icon={Wrench}
              color="text-red-500"
              bg="bg-red-50"
              title="Maintenance Failures"
              desc="Missed maintenance leads to breakdowns, downtime and high repair costs."
            />
            <ProblemCard
              icon={ClipboardList}
              color="text-emerald-500"
              bg="bg-emerald-50"
              title="Audit & Compliance"
              desc="Non-compliance results in penalties, audit issues and reputational damage."
            />
            <ProblemCard
              icon={TrendingDown}
              color="text-orange-500"
              bg="bg-orange-50"
              title="Capital Leakage"
              desc="Theft, misplacement and duplicate purchases cause millions in losses."
            />
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-16 items-center">
          <div className="space-y-6">
            <h4 className="text-blue-600 font-medium">The Solution</h4>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">
              Complete Asset Lifecycle
              <br />
              Management in <span className="text-blue-600">One Platform</span>
            </h2>
            <p className="text-slate-600 leading-relaxed max-w-md">
              Asstella brings all your assets, data and processes together in a
              single, intelligent platform.
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mt-4">
              Explore All Features <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SolutionCard
              icon={QrCode}
              color="text-blue-500"
              bg="bg-blue-50"
              title="Asset Tracking"
              desc="Track every asset with QR/Barcode & real-time updates."
            />
            <SolutionCard
              icon={Wrench}
              color="text-green-500"
              bg="bg-green-50"
              title="Maintenance"
              desc="Preventive & breakdown maintenance management."
            />
            <SolutionCard
              icon={ShieldCheck}
              color="text-emerald-500"
              bg="bg-emerald-50"
              title="Audit & Compliance"
              desc="Mobile audit, asset verification and compliance reporting."
            />
            <SolutionCard
              icon={Calculator}
              color="text-blue-600"
              bg="bg-blue-100"
              title="Depreciation & Finance"
              desc="IFRS-compliant depreciation, book value & financial reports."
            />
            <SolutionCard
              icon={Award}
              color="text-red-500"
              bg="bg-red-50"
              title="Warranty Management"
              desc="Track warranty, claims and expiry alerts."
            />
            <SolutionCard
              icon={ClipboardList}
              color="text-purple-500"
              bg="bg-purple-50"
              title="AMC Management"
              desc="Manage AMC contracts, visits and SLA performance."
            />
            <SolutionCard
              icon={MapPin}
              color="text-blue-400"
              bg="bg-blue-50"
              title="GPS Vehicle Tracking"
              desc="Live tracking, geo-fence, alerts and history."
            />
            <SolutionCard
              icon={LinkIcon}
              color="text-indigo-500"
              bg="bg-indigo-50"
              title="Integrations & API"
              desc="Seamless integration with ERP, HRM, Accounting & more."
            />
          </div>
        </div>
      </section>

      {/* Solutions for Every Industry */}
      <section className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-12 items-center">
          <div className="xl:w-1/4 space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Solutions for Every Industry
            </h2>
            <p className="text-slate-500 text-sm">
              Asstella adapts to your industry-specific requirements.
            </p>
          </div>
          <div className="xl:w-3/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <IndustryCard
              img="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80"
              title="Education"
              desc="Manage labs, computers, furniture and assets across campuses."
            />
            <IndustryCard
              img="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80"
              title="Healthcare"
              desc="Track medical equipment, devices, vehicles with warranty."
            />
            <IndustryCard
              img="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80"
              title="Industry"
              desc="Manage machinery, production assets and fleet vehicles."
            />
            <IndustryCard
              img="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80"
              title="Enterprise"
              desc="Multi-branch, multi-currency and ERP-integrated asset control."
            />
          </div>
        </div>
      </section>

      {/* Real-time Insights */}
      <section className="py-24 px-6 bg-slate-50 overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative lg:-ml-[4vw]">
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 relative z-10 w-full overflow-hidden">
              <img
                src="https://asstella.com/Dashboard%20Image.webp"
                className="w-full h-auto object-cover rounded-xl"
                alt="Platform Dashboard"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">
              Real-time Insights. Smarter Decisions.
            </h2>
            <ul className="space-y-4">
              <InsightCheck text="Real-time dashboard with actionable insights" />
              <InsightCheck text="Reduce downtime and maintenance cost" />
              <InsightCheck text="Improve audit compliance and transparency" />
              <InsightCheck text="Optimize asset utilization and ROI" />
              <InsightCheck text="Secure, scalable and built for enterprises" />
            </ul>
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mt-4">
              See How It Works <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
              <KPICard
                title="Total Asset Value"
                value="$245.67M"
                trend="↑ 6.7% vs last month"
                valueClass="text-emerald-500"
                trendClass="text-emerald-500"
              />
              <KPICard
                title="Maintenance Cost"
                value="$4.7M"
                trend="↓ 3.2% vs last month"
                valueClass="text-blue-600"
                trendClass="text-emerald-500"
              />
              <KPICard
                title="Audit Compliance"
                value="78%"
                trend="↑ 8.4% vs last month"
                valueClass="text-purple-600"
                trendClass="text-emerald-500"
              />
              <KPICard
                title="Assets Online (Vehicles)"
                value="42 / 68"
                trend="↑ 5 vs last month"
                valueClass="text-orange-500"
                trendClass="text-emerald-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-white shrink">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2.5fr_1fr] gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 leading-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-600">
              Choose the plan that fits your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <PricingCard
              name="Starter"
              desc="Perfect for small teams"
              price="$50"
              features={[
                "Up to 2,500 Assets",
                "5 Users",
                "Basic Modules",
                "Email Support",
              ]}
              buttonText="Start Free Trial"
              isPopular={false}
            />
            <PricingCard
              name="Professional"
              desc="Best for growing organizations"
              price="$100"
              features={[
                "Up to 25,000 Assets",
                "20 Users",
                "All Core Modules",
                "Priority Support",
              ]}
              buttonText="Start Free Trial"
              isPopular={true}
            />
            <PricingCard
              name="Enterprise"
              desc="For large enterprises"
              price="Custom"
              priceSub="Contact Sales"
              features={[
                "Unlimited Assets",
                "Unlimited Users",
                "All Modules & Integrations",
                "Dedicated Support",
              ]}
              buttonText="Contact Sales"
              isPopular={false}
            />
          </div>

          <div className="space-y-6">
            <FeatureList text="Free 14-day trial" />
            <FeatureList text="No credit card required" />
            <FeatureList text="Easy setup in minutes" />
            <FeatureList text="Cancel anytime" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 leading-tight">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Asstella has completely transformed how we manage our assets across 15+ campuses. Audit is now faster, easier and more accurate."
              author="Dr. Sarah Johnson"
              role="IT Director, MIT University"
            />
            <TestimonialCard
              quote="We reduced downtime by 40% and maintenance costs by 28% within 6 months of implementing Asstella."
              author="Rajeev Mehta"
              role="Operations Head, Apollo Hospitals"
            />
            <TestimonialCard
              quote="The GPS tracking and AMC management features are excellent. Asstella gives us full control and real-time visibility."
              author="Anil Sharma"
              role="Plant Manager, Tata Steel"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-6">
        <div className="max-w-[1400px] mx-auto bg-[#0b1120] rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-blue-600/20 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">
                Ready to Take Control of Your Assets?
              </h2>
              <p className="text-slate-400">
                Join thousands of organizations that trust Asstella to manage
                their assets smarter.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10 whitespace-nowrap">
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2">
              <Play className="w-4 h-4" /> Book a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProblemCard({ icon: Icon, color, bg, title, desc }: any) {
  return (
    <div className="min-w-[280px] p-6 bg-white border border-slate-100 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all snap-center">
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-6",
          bg,
          color,
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function SolutionCard({ icon: Icon, color, bg, title, desc }: any) {
  return (
    <div className="flex gap-4 p-4 rounded-xl hover:bg-white transition-colors">
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          bg,
          color,
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function IndustryCard({ img, title, desc }: any) {
  return (
    <div className="bg-slate-50 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow border border-slate-100">
      <img src={img} className="h-32 w-full object-cover" alt={title} />
      <div className="p-4 space-y-1">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 line-clamp-2">{desc}</p>
      </div>
    </div>
  );
}

function InsightCheck({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white">
        <Check className="w-3 h-3" />
      </div>
      <span className="text-slate-700 font-medium">{text}</span>
    </li>
  );
}

function KPICard({ title, value, trend, valueClass, trendClass }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="text-sm text-blue-600 font-medium mb-2">{title}</div>
      <div className={cn("text-3xl font-bold mb-2", valueClass)}>{value}</div>
      <div className={cn("text-xs font-medium", trendClass)}>{trend}</div>
    </div>
  );
}

function PricingCard({
  name,
  desc,
  price,
  priceSub,
  features,
  buttonText,
  isPopular,
}: any) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border p-6 flex flex-col relative",
        isPopular ? "border-blue-600 shadow-xl" : "border-slate-200",
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Most Popular
        </div>
      )}
      <div className="text-center mb-6 border-b border-slate-100 pb-6">
        <h3 className="text-lg font-bold text-slate-900">{name}</h3>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
        <div className="mt-4">
          {price === "Custom" ? (
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {price}
            </div>
          ) : (
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {price}
              <span className="text-sm font-normal text-slate-500">/month</span>
            </div>
          )}
          <div className="text-xs text-slate-400">
            {priceSub || "Billed annually"}
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 mb-8">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5" />
            </div>
            <span className="text-xs font-medium text-slate-700">{f}</span>
          </div>
        ))}
      </div>
      <button
        className={cn(
          "w-full py-3 rounded-lg font-medium transition-colors text-sm",
          isPopular
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
        )}
      >
        {buttonText}
      </button>
    </div>
  );
}

function FeatureList({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <Check className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-slate-700">{text}</span>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
      <p className="text-sm text-slate-600 leading-relaxed mb-6">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
          <span className="font-bold text-slate-500 text-xs">
            {author.charAt(0)}
          </span>
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900">{author}</div>
          <div className="text-[10px] text-slate-500">{role}</div>
        </div>
      </div>
    </div>
  );
}
