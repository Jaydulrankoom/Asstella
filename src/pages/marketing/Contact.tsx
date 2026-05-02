import React from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, MessageSquare, Twitter, Github, Linkedin } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function MarketingContact() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Header */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black text-brand uppercase tracking-[0.2em]">
            Support & Sales
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.9]">
            Let's build <br /> your <span className="text-brand">Ecosystem.</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl">
             Our enterprise consulting team is ready to help you architect an unbeatable asset strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
           {/* Form */}
           <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20"
              >
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                  <Send className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Transmission Received</h3>
                <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Our team will reach out within 4 business hours.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-brand font-black uppercase tracking-widest text-[10px] hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                      <input required type="text" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand transition-all" placeholder="JOHN DOE" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                      <input required type="email" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand transition-all" placeholder="JOHN@COMPANY.COM" />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Inquiry Type</label>
                  <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand transition-all appearance-none cursor-pointer">
                    <option>Enterprise Sales</option>
                    <option>Product Integration</option>
                    <option>Security & Compliance</option>
                    <option>General Support</option>
                    <option>Partnerships</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Message</label>
                  <textarea required rows={5} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand transition-all" placeholder="HOW CAN WE HELP?" />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-5 bg-brand text-white font-black rounded-2xl shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  Initiate Connection <Send className="w-4 h-4" />
                </button>
              </form>
            )}
           </div>

           {/* Info */}
           <div className="space-y-16">
              <div className="space-y-8">
                 <h3 className="text-sm font-black text-brand uppercase tracking-[0.4em]">Direct Contact</h3>
                 <div className="space-y-6">
                    <ContactItem icon={Mail} label="Email Hub" value="sales@asstella.com" />
                    <ContactItem icon={Phone} label="Global Line" value="+1 (555) 000-ASST" />
                    <ContactItem icon={MapPin} label="Headquarters" value="700 Market St, San Francisco, CA" />
                 </div>
              </div>

              <div className="space-y-8">
                 <h3 className="text-sm font-black text-brand uppercase tracking-[0.4em]">Connect</h3>
                 <div className="flex gap-4">
                    <SocialBtn icon={Twitter} />
                    <SocialBtn icon={Github} />
                    <SocialBtn icon={Linkedin} />
                 </div>
              </div>

              <div className="p-8 bg-brand/10 border border-brand/20 rounded-[2rem] flex items-center gap-6">
                 <div className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-brand/20">
                    <MessageSquare className="w-7 h-7" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Real-time Chat</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Available for Business & Enterprise Customers</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex gap-6 items-start group">
       <div className="w-12 h-12 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-brand group-hover:text-white transition-all">
          <Icon className="w-5 h-5" />
       </div>
       <div className="pt-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{value}</p>
       </div>
    </div>
  );
}

function SocialBtn({ icon: Icon }: any) {
  return (
    <button className="w-12 h-12 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-brand hover:text-white transition-all">
       <Icon className="w-5 h-5" />
    </button>
  );
}
