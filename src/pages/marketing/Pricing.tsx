import React from "react";
import { motion } from "motion/react";
import { Check, Zap, ShieldCheck, Globe, Star, ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";

export default function MarketingPricing() {
  const [isAnnual, setIsAnnual] = React.useState(true);

  const plans = [
    {
      name: "Starter",
      badge: "Free for teams",
      price: isAnnual ? "0" : "0",
      desc: "Essential features for growing teams needing basic control.",
      features: [
        "Up to 50 Assets",
        "Single Location",
        "Basic Maintenance Log",
        "Email Support",
        "Standard QR Scanning",
      ],
      button: "Start Free",
      color: "slate",
    },
    {
      name: "Business",
      badge: "Most Popular",
      price: isAnnual ? "99" : "129",
      desc: "Advanced intelligence for multi-department organizations.",
      features: [
        "Unlimited Assets",
        "Multi-Location Support",
        "Depreciation AI",
        "Procurement Hub",
        "Compliance Audits",
        "API Integration Hub",
        "Priority Support",
      ],
      button: "Get Full Access",
      color: "brand",
      featured: true,
    },
    {
      name: "Enterprise",
      badge: "Mission Critical",
      price: isAnnual ? "499" : "599",
      desc: "Full-scale ecosystem orchestration for global corporations.",
      features: [
        "Global Infrastructure Map",
        "Custom Workflow AI",
        "Dedicated Account Lead",
        "SLA Guarantee",
        "On-premise Deployment",
        "SSO & Advanced Security",
        "Unlimited Users",
      ],
      button: "Contact Sales",
      color: "slate",
    },
  ];

  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black text-brand uppercase tracking-[0.2em]"
          >
            Transparent Pricing
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-none tracking-tighter uppercase">
            Choose your <br /> <span className="text-brand">Growth</span> plan.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto uppercase tracking-widest text-xs">
            Scale your operations without limits.
          </p>

          <div className="flex items-center justify-center gap-4 mt-12">
            <span
              className={cn(
                "text-xs font-black uppercase tracking-widest transition-opacity",
                !isAnnual ? "text-slate-900 dark:text-white" : "text-slate-400",
              )}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-8 bg-slate-200 dark:bg-white/10 rounded-full p-1 relative transition-all"
            >
              <div
                className={cn(
                  "w-6 h-6 bg-brand rounded-full transition-transform",
                  isAnnual ? "translate-x-6" : "translate-x-0",
                )}
              />
            </button>
            <span
              className={cn(
                "text-xs font-black uppercase tracking-widest transition-opacity",
                isAnnual ? "text-slate-900 dark:text-white" : "text-slate-400",
              )}
            >
              Annual <span className="text-emerald-500 ml-1">(20% OFF)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "p-10 rounded-[2.5rem] border transition-all duration-500 relative flex flex-col",
                plan.featured
                  ? "bg-slate-900 text-white border-brand shadow-2xl shadow-brand/20 scale-105 z-10"
                  : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-brand/30 hover:shadow-xl",
              )}
            >
              <div className="space-y-2 mb-8">
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    plan.featured ? "text-brand" : "text-slate-400",
                  )}
                >
                  {plan.badge}
                </span>
                <h3 className="text-3xl font-black uppercase tracking-tighter">
                  {plan.name}
                </h3>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter">
                    $
                  </span>
                  <span className="text-6xl font-black tracking-tighter">
                    {plan.price}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-black uppercase tracking-widest pl-2",
                      plan.featured ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    / per month
                  </span>
                </div>
              </div>

              <p
                className={cn(
                  "text-sm font-medium leading-relaxed mb-10",
                  plan.featured ? "text-slate-400" : "text-slate-500",
                )}
              >
                {plan.desc}
              </p>

              <div className="space-y-4 mb-12 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        plan.featured
                          ? "bg-blue-600/20 text-blue-600"
                          : "bg-emerald-500/10 text-emerald-500",
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/app"
                className={cn(
                  "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-95",
                  plan.featured
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:scale-[1.02]"
                    : "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20",
                )}
              >
                {plan.button} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ Preview */}
        <div className="bg-slate-50 dark:bg-white/5 rounded-[3rem] p-12 md:p-20 border border-slate-100 dark:border-white/5">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3">
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-4">
                Enterprise
              </h2>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.9] mb-6">
                Need a custom <br /> environment?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                We offer tailored deployment options including air-gapped
                systems and custom data residency.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12">
              <Question
                title="Is data exported easily?"
                desc="Yes, export everything via CSV, PDF, or direct API stream anytime."
              />
              <Question
                title="Can I change plans?"
                desc="Seamlessly upgrade or downgrade with prorated credits instantly."
              />
              <Question
                title="Do you offer training?"
                desc="Business and Enterprise plans include full virtual onboarding sessions."
              />
              <Question
                title="Is there an API?"
                desc="Yes, a robust REST API with 100+ endpoints for deep integration."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Question({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed uppercase tracking-tighter">
        {desc}
      </p>
    </div>
  );
}
