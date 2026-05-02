import React from "react";
import { motion } from "motion/react";
import { Zap, Globe, Users, Trophy, Target, ShieldCheck } from "lucide-react";

export default function MarketingAbout() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black text-brand uppercase tracking-[0.2em]">
              The Asstella Story
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.9]">
              Reimagining <br /> <span className="text-brand">Ownership.</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
              Founded in 2020, Asstella was born from a simple realization: while software assets were evolving at light speed, physical asset management was stuck in the era of spreadsheets and manual logs.
            </p>
            <p className="text-slate-500 font-medium leading-relaxed">
              We built a platform that treats a laptop, a truck, or a skyscraper with the same digital sophistication as a cloud server. Our mission is to provide every enterprise with an absolute, real-time map of their physical world.
            </p>
          </div>
          <div className="relative aspect-square">
             <div className="absolute inset-0 bg-brand rounded-[5rem] rotate-6 transform" />
             <img 
               src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
               alt="Team" 
               className="absolute inset-0 w-full h-full object-cover rounded-[5rem] shadow-2xl"
             />
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <ValueCard 
             icon={Target} 
             title="Precision" 
             desc="We believe in the power of exact data. Near-enough is never enough." 
          />
          <ValueCard 
             icon={ShieldCheck} 
             title="Integrity" 
             desc="Asset data is sensitive. We protect it with an aggressive security posture." 
          />
          <ValueCard 
             icon={Globe} 
             title="Scalability" 
             desc="From local startups to global conglomerates, our platform grows with you." 
          />
        </div>

        {/* Team Section */}
        <div className="space-y-16 py-20 border-t border-slate-100 dark:border-white/5">
           <div className="text-center space-y-4">
              <h2 className="text-sm font-black text-brand uppercase tracking-[0.4em]">Our Leadership</h2>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">The minds behind the matrix.</h3>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
              <TeamMember name="Elena Rodriguez" role="Chief Executive Officer" seed="elena" />
              <TeamMember name="Marcus Chen" role="Chief Technology Officer" seed="marcus" />
              <TeamMember name="Sarah Jenkins" role="Head of Product" seed="sarah" />
              <TeamMember name="David Kim" role="Director of Security" seed="david" />
           </div>
        </div>
      </div>
    </div>
  );
}

function ValueCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
       <div className="w-12 h-12 bg-brand text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20">
          <Icon className="w-6 h-6" />
       </div>
       <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">{title}</h4>
       <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function TeamMember({ name, role, seed }: any) {
  return (
    <div className="text-center group">
       <div className="relative aspect-square mb-6 overflow-hidden rounded-3xl grayscale group-hover:grayscale-0 transition-all duration-500">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={name} className="w-full h-full object-cover bg-slate-100" />
       </div>
       <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{name}</h4>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{role}</p>
    </div>
  );
}
