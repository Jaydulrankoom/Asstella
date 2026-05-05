import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
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
  ClipboardList,
  Stethoscope,
  Factory,
  School,
  Hexagon,
  BookOpen,
  FileText,
  Video,
  Users,
  Briefcase,
  Building2,
  Phone,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const MEGA_MENU_ORDER = [
  "Product",
  "Solutions",
  "Pricing",
  "Resources",
  "Company",
];

const megaMenus = {
  Product: [
    {
      title: "Core Features",
      items: [
        {
          name: "Asset Register",
          href: "/product/asset-register",
          icon: Database,
          desc: "Centralized lifecycle tracking.",
        },
        {
          name: "Depreciation Engine",
          href: "/product/depreciation",
          icon: Calculator,
          desc: "Automated IFRS reporting.",
        },
        {
          name: "Mobile Audit & QR",
          href: "/product/audit",
          icon: ShieldCheck,
          desc: "Physical tracking and verification.",
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          name: "Maintenance & SLA",
          href: "/product/maintenance",
          icon: Wrench,
          desc: "Preventive and breakdown workflows.",
        },
        {
          name: "Contract & AMC",
          href: "/product/amc",
          icon: ClipboardList,
          desc: "Manage service agreements.",
        },
        {
          name: "Fleet Tracking",
          href: "/product/gps",
          icon: MapPin,
          desc: "Live GPS mapping for vehicles.",
        },
      ],
    },
  ],
  Solutions: [
    {
      title: "By Industry",
      items: [
        {
          name: "Healthcare",
          href: "/solution/healthcare",
          icon: Stethoscope,
          desc: "Medical equipment lifecycle.",
        },
        {
          name: "Manufacturing",
          href: "/solution/manufacturing",
          icon: Factory,
          desc: "Plant and machinery tracking.",
        },
        {
          name: "Education",
          href: "/solution/education",
          icon: School,
          desc: "Campus infrastructure management.",
        },
      ],
    },
  ],
  Resources: [
    {
      title: "Learn",
      items: [
        {
          name: "Blog & Insights",
          href: "/resource/blog",
          icon: BookOpen,
          desc: "Industry best practices.",
        },
        {
          name: "Documentation",
          href: "/resource/docs",
          icon: FileText,
          desc: "Technical integration guides.",
        },
        {
          name: "Webinars",
          href: "/resource/webinars",
          icon: Video,
          desc: "Live and on-demand sessions.",
        },
      ],
    },
  ],
  Company: [
    {
      title: "About Asstella",
      items: [
        {
          name: "About Us",
          href: "/company/about",
          icon: Building2,
          desc: "Our story and mission.",
        },
        {
          name: "Careers",
          href: "/company/careers",
          icon: Users,
          desc: "Join our growing team.",
        },
        {
          name: "Contact",
          href: "/company/contact",
          icon: Phone,
          desc: "Get in touch with us.",
        },
      ],
    },
  ],
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = React.useState<string | null>(
    null,
  );
  const [scrolled, setScrolled] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    setActiveMegaMenu(null);
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-500">
      <nav
        className={cn(
          "fixed top-0 inset-x-0 z-[60] transition-all duration-300 px-6",
          scrolled
            ? "bg-[#0b1120]/95 backdrop-blur-md py-4 border-b border-white/10"
            : "bg-[#0b1120] py-6",
        )}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shrink-0">
              <Hexagon className="text-white w-5 h-5 fill-white/20" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Asstella
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {MEGA_MENU_ORDER.map((menuName) => {
              if (menuName === "Pricing") {
                return (
                  <Link
                    key={menuName}
                    to="/pricing"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                );
              }

              return (
                <div
                  key={menuName}
                  className="relative py-2"
                  onMouseEnter={() => setActiveMegaMenu(menuName)}
                  onMouseLeave={() => setActiveMegaMenu(null)}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      location.pathname.startsWith(`/${menuName.toLowerCase()}`)
                        ? "text-blue-400"
                        : "text-slate-300 hover:text-white",
                    )}
                  >
                    {menuName}{" "}
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 opacity-70 transition-transform duration-300",
                        activeMegaMenu === menuName && "rotate-180",
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {activeMegaMenu === menuName && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-max min-w-[500px]"
                      >
                        <div className="bg-[#0b1120] p-8 rounded-2xl shadow-2xl shadow-black/50 border border-white/10 flex gap-8">
                          {(megaMenus as any)[menuName].map((group: any) => (
                            <div key={group.title} className="flex-1 space-y-4">
                              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {group.title}
                              </h4>
                              <div className="space-y-1">
                                {group.items.map((item: any) => (
                                  <Link
                                    key={item.href}
                                    to={item.href}
                                    className="group/item flex gap-3 items-center p-2.5 -ml-2.5 rounded-xl hover:bg-white/5 transition-all text-white"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 transition-all border border-blue-500/20">
                                      <item.icon className="w-5 h-5 opacity-80 group-hover/item:opacity-100" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold group-hover/item:text-blue-400 transition-colors">
                                        {item.name}
                                      </div>
                                      <div className="text-xs text-slate-400 font-normal leading-relaxed mt-0.5">
                                        {item.desc}
                                      </div>
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
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/app"
              className="text-sm font-medium text-white hover:text-blue-200 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/contact"
              className="px-5 py-2.5 bg-transparent text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all border border-white/40"
            >
              Book a Demo
            </Link>
            <Link
              to="/app"
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
            >
              Start Free Trial
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-slate-300"
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0b1120] z-[70] flex flex-col lg:hidden overflow-y-auto"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0 sticky top-0 z-10 bg-[#0b1120]">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shrink-0">
                  <Hexagon className="text-white w-5 h-5 fill-white/20" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  Asstella
                </span>
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-8">
              {MEGA_MENU_ORDER.map((menuName) => {
                if (menuName === "Pricing") {
                  return (
                    <Link
                      key="Pricing"
                      to="/pricing"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-lg font-bold text-white pb-2 border-b border-white/10"
                    >
                      Pricing
                    </Link>
                  );
                }

                return (
                  <div key={menuName} className="space-y-4">
                    <h3 className="text-lg font-bold text-white pb-2 border-b border-white/10">
                      {menuName}
                    </h3>
                    <div className="space-y-6">
                      {(megaMenus as any)[menuName].map((group: any) => (
                        <div key={group.title} className="space-y-3">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {group.title}
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {group.items.map((item: any) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 active:scale-95 transition-transform text-slate-300"
                              >
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shadow-sm">
                                  <item.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-sm text-white">
                                  {item.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-white/10 shrink-0 bg-[#0b1120] flex flex-col gap-3">
              <Link
                to="/app"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 bg-white/5 border border-white/10 text-white rounded-lg font-medium transition-all"
              >
                Login
              </Link>
              <Link
                to="/app"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-20">{children}</main>

      <footer className="bg-[#0b1120] text-slate-300 py-16 px-6 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shrink-0">
                <Hexagon className="text-white w-5 h-5 fill-white/20" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Asstella
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              The complete fixed asset management platform for modern
              enterprises.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={Twitter} />
              <SocialIcon icon={Github} />
              <SocialIcon icon={Linkedin} />
            </div>
          </div>

          <div className="md:col-span-4 lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            <FooterGroup
              title="Product"
              links={[
                { label: "Features", href: "/product/features" },
                { label: "Integrations", href: "/product/integrations" },
                { label: "Security", href: "/product/security" },
                { label: "Roadmap", href: "/product/roadmap" },
              ]}
            />

            <FooterGroup
              title="Solutions"
              links={[
                { label: "Education", href: "/solution/education" },
                { label: "Healthcare", href: "/solution/healthcare" },
                { label: "Industry", href: "/solution/manufacturing" },
                { label: "Enterprise", href: "/solution/enterprise" },
              ]}
            />

            <FooterGroup
              title="Resources"
              links={[
                { label: "Blog", href: "/resource/blog" },
                { label: "Documentation", href: "/resource/docs" },
                { label: "API Docs", href: "/resource/api" },
                { label: "Help Center", href: "/resource/help" },
              ]}
            />

            <FooterGroup
              title="Company"
              links={[
                { label: "About Us", href: "/company/about" },
                { label: "Careers", href: "/company/careers" },
                { label: "Contact Us", href: "/company/contact" },
                { label: "Partners", href: "/company/partners" },
              ]}
            />

            <FooterGroup
              title="Legal"
              links={[
                { label: "Privacy Policy", href: "/legal/privacy" },
                { label: "Terms of Service", href: "/legal/terms" },
                { label: "Cookie Policy", href: "/legal/cookies" },
                { label: "Refund Policy", href: "/legal/refund" },
              ]}
            />
          </div>

          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white pt-1">
              Subscribe to our newsletter
            </h4>
            <form className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors pr-12"
              />
              <button
                type="button"
                className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <span>© 2024 Asstella. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="space-y-6">
      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
        {title}
      </h4>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              className="text-[12px] font-bold tracking-wide text-slate-400 hover:text-blue-500 transition-colors"
            >
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
    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
      <Icon className="w-4 h-4" />
    </button>
  );
}
