import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, User, ArrowRight, Zap } from "lucide-react";

const posts = [
  {
    id: 1,
    title: "The Future of Physical Asset Intelligence in 2024",
    excerpt:
      "How AI is changing the way enterprises manage their sprawling infrastructure ecosystems.",
    author: "Elena Rodriguez",
    date: "May 12, 2024",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    category: "Strategy",
  },
  {
    id: 2,
    title: "Why Universities are Moving Away from Spreadsheets",
    excerpt:
      "The hidden costs of manual asset tracking in higher education and the cloud-based solution.",
    author: "Marcus Chen",
    date: "April 28, 2024",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
    category: "Education",
  },
  {
    id: 3,
    title: "Compliance Decoded: audit-ready Asset History",
    excerpt:
      "How to build an immutable log that satisfies even the most rigorous global audit standards.",
    author: "David Kim",
    date: "April 15, 2024",
    image:
      "https://images.unsplash.com/photo-1454165833767-027ff3302bc5?auto=format&fit=crop&q=80&w=800",
    category: "Compliance",
  },
];

export default function MarketingBlog() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Header */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black text-brand uppercase tracking-[0.2em]">
            Operational Insights
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.9]">
            The <span className="text-brand">Asstella</span> <br /> Chronicles.
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl">
            Deep dives into infrastructure, capital forecasting, and the future
            of physical enterprise.
          </p>
        </div>

        {/* Featured Post */}
        <Link
          to="/blog/1"
          className="group block relative aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10"
        >
          <img
            src={posts[0].image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-12 md:p-20 space-y-6 max-w-3xl">
            <span className="px-4 py-1.5 bg-brand text-white font-black text-[10px] uppercase tracking-widest rounded-full">
              {posts[0].category}
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-brand transition-colors">
              {posts[0].title}
            </h2>
            <p className="text-slate-300 font-medium text-lg lg:text-xl line-clamp-2">
              {posts[0].excerpt}
            </p>
          </div>
        </Link>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
          {posts.slice(1).map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group space-y-8"
            >
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                <img
                  src={post.image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[10px] font-black text-brand uppercase tracking-widest border border-brand/20">
                  {post.category}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <User className="w-3 h-3" /> {post.author}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-brand transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black text-brand uppercase tracking-widest pt-2">
                  Read Entry <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-slate-900 p-16 md:p-32 rounded-[4rem] text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent)]" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-8 text-white">
            <Zap className="w-16 h-16 text-brand mx-auto mb-8 animate-pulse" />
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Stay Ahead of <span className="text-brand">Depreciation.</span>
            </h3>
            <p className="text-slate-400 font-medium">
              Get quarterly insights into industrial management trends and
              capital planning best practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="ENTER WORK EMAIL"
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand uppercase tracking-widest"
              />
              <button className="px-10 py-5 bg-brand text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-widest">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
