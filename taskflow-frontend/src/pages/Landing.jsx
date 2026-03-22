import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import Seo from "../components/common/Seo";
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Layers, 
  Users,
  Layout
} from "lucide-react";

const Landing = () => {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const toSchemaUrl = (path) => siteUrl ? `${siteUrl}${path}` : path;

  const landingSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TaskFlow",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: toSchemaUrl("/"),
    description: "TaskFlow helps you organize tasks, reminders, notes, and daily work in one clean workspace.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TaskFlow",
    url: toSchemaUrl("/"),
    description: "TaskFlow helps you organize tasks, reminders, notes, and daily work in one clean workspace."
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TaskFlow",
    url: toSchemaUrl("/"),
    logo: toSchemaUrl("/icon-512.png")
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: toSchemaUrl("/")
      }
    ]
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.15 } },
    viewport: { once: true }
  };

  return (
    <div className="min-h-screen bg-surface-50 overflow-x-hidden selection:bg-primary-100 selection:text-primary-900">
      <Seo
        title="TaskFlow | Task Management, Notes, and Reminders"
        description="Organize tasks, notes, and reminders with interactive cards built for daily planning and focused team work."
        path="/"
        keywords={[
          "task management",
          "notes app",
          "reminder app",
          "checklist organizer",
          "daily planning app"
        ]}
        schema={[landingSchema, websiteSchema, organizationSchema, breadcrumbSchema]}
      />
      {/* Decorative Background Elements - Hidden on mobile for performance */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden lg:block">
        <Motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/20 blur-[120px] rounded-full"
        />
        <Motion.div 
          animate={{ x: [0, -40, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/10 blur-[150px] rounded-full"
        />
      </div>

      {/* Navigation */}
      <Motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-surface-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 group cursor-pointer"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center border-2 border-primary-500/20 shadow-lg shadow-primary-500/20">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-surface-900 tracking-tight whitespace-nowrap">TaskFlow</span>
          </Motion.div>
          
          <div className="hidden lg:flex items-center space-x-8">
            {["Features", "About"].map((item) => (
              <Motion.a 
                key={item}
                href={item === "About" ? "/about" : `#${item.toLowerCase()}`}
                whileHover={{ y: -2 }}
                className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors"
              >
                {item}
              </Motion.a>
            ))}
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link to="/login" className="text-sm font-semibold text-surface-700 hover:text-primary-600 transition-colors hidden min-[360px]:block">Sign In</Link>
            <Motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="btn-primary py-2 px-4 sm:px-5 text-sm hover:shadow-2xl hover:shadow-primary-500/40 transition-all">Join Now</Link>
            </Motion.div>
          </div>
        </div>
      </Motion.nav>

      {/* Hero Section */}
      <section className="relative pt-24 min-[360px]:pt-32 pb-14 min-[360px]:pb-20 px-4 sm:px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 sm:gap-10 md:gap-16">
          <Motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left space-y-6 sm:space-y-8"
          >
            <Motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="inline-flex items-center px-3.5 sm:px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
            >
              <Zap size={14} className="mr-2 animate-pulse" />
              Tasks, notes, and reminders in one place
            </Motion.div>
            <h1 className="text-3xl min-[400px]:text-4xl min-[500px]:text-5xl lg:text-7xl font-extrabold text-surface-900 tracking-tighter leading-[1.1] sm:leading-[1.05]">
              Task Management for <br className="hidden min-[400px]:block" />
              <Motion.span 
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 1, delay: 0.8 }}
                className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent inline-block pb-2"
              >
                Notes and Reminders
              </Motion.span>
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-surface-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium px-2 sm:px-0">
              TaskFlow helps you capture notes, group work into cards, set reminders, and stay on top of personal or team tasks from one clean workspace.
            </p>
            <div className="flex flex-col min-[450px]:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full min-[450px]:w-auto">
                <Link to="/register" className="btn-primary px-5 sm:px-10 py-3.5 sm:py-4.5 text-base sm:text-lg flex items-center group justify-center shadow-xl shadow-primary-500/25">
                  Get Started for Free
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Motion.div>
            </div>
            
            <div className="flex flex-col space-y-4 pt-8 sm:pt-10">
                <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Built for daily planning and team work</span>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-2 opacity-50">
                    <CheckCircle2 size={16} className="text-primary-500" />
                    <span className="text-xs font-bold text-surface-600">Interactive Cards</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-surface-300" />
                    <CheckCircle2 size={16} className="text-primary-500" />
                    <span className="text-xs font-bold text-surface-600">Smart Reminders</span>
                </div>
            </div>
          </Motion.div>
          
          <Motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="flex-1 relative w-full max-w-xl lg:max-w-none"
          >
            <div className="absolute -inset-4 bg-primary-500/10 blur-[100px] rounded-full" />
            <Motion.div 
               whileHover={{ y: -10, rotate: -1 }}
               className="relative card glass p-2.5 sm:p-3 border-white/50 shadow-[0_22px_70px_4px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-700"
            >
               <div className="bg-surface-900 rounded-xl overflow-hidden aspect-[4/3] min-[500px]:aspect-video flex items-center justify-center group relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/10 to-transparent" />
                  <div className="text-white text-center p-4 sm:p-8 z-10 transition-transform duration-1000 group-hover:scale-110">
                    <p className="text-primary-400 font-mono text-[10px] sm:text-xs mb-4 sm:mb-6 uppercase tracking-[0.24em] sm:tracking-[0.3em] font-bold">Live Dashboard View</p>
                    <div className="flex space-x-3 justify-center mb-8">
                        <Motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-2 rounded-full bg-primary-500/40" />
                        <Motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="w-24 h-2 rounded-full bg-surface-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-6">
                        {[500, 700].map((_, i) => (
                            <Motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 + (i * 0.2) }}
                                className="aspect-square bg-surface-800/80 backdrop-blur rounded-2xl border border-white/10 p-4 sm:p-6 flex flex-col justify-end shadow-2xl"
                            >
                                <div className={i === 0 ? "mb-2 h-1 w-full rounded-full bg-primary-500/40" : "mb-2 h-1 w-full rounded-full bg-indigo-500/40"} />
                                <div className={i === 0 ? "h-1 w-2/3 rounded-full bg-primary-500/20" : "h-1 w-2/3 rounded-full bg-indigo-500/20"} />
                            </Motion.div>
                        ))}
                    </div>
                  </div>
               </div>
            </Motion.div>
          </Motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Motion.div 
            {...fadeInUp}
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-20 space-y-4"
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold text-surface-900 tracking-tight">Plan Faster, Miss Less</h2>
            <p className="text-base sm:text-xl text-surface-500 font-medium">
              Create task cards, save notes, and manage reminders without switching between multiple tools.
            </p>
          </Motion.div>

          <Motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid gap-4 sm:gap-8 min-[560px]:grid-cols-2 xl:grid-cols-3"
          >
            {[
              { 
                icon: <Layout className="text-primary-600" size={28} />, 
                title: "Interactive Task Cards", 
                desc: "Open any card to add, edit, complete, or remove items from the same view.",
                color: "bg-primary-50"
              },
              { 
                icon: <Users className="text-indigo-600" size={28} />, 
                title: "Notes with Reminders", 
                desc: "Save quick notes and schedule one-time or repeating reminders for important work.",
                color: "bg-indigo-50"
              },
              { 
                icon: <Shield className="text-emerald-600" size={28} />, 
                title: "Secure Sign-In", 
                desc: "Protect your workspace with fixed email identity, authenticator-based security, and account controls.",
                color: "bg-emerald-50"
              }
            ].map((feature, i) => (
              <Motion.div 
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -12 }}
                className="card p-6 sm:p-10 group hover:border-primary-100 transition-all duration-500 border-surface-200/40 shadow-sm"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 sm:mb-8 border border-surface-100 group-hover:rotate-[10deg] transition-transform duration-500`}>
                  {React.cloneElement(feature.icon, { size: 24 })}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-surface-900 mb-3 sm:mb-4 group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                <p className="text-sm sm:text-base text-surface-500 leading-relaxed font-medium">{feature.desc}</p>
              </Motion.div>
            ))}
          </Motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <Motion.section 
        {...fadeInUp}
        className="py-16 min-[360px]:py-24 px-4 sm:px-6 relative"
      >
        <div className="max-w-6xl mx-auto bg-surface-900 rounded-3xl sm:rounded-[3rem] p-6 sm:p-12 md:p-20 text-center relative overflow-hidden shadow-3xl">
          <Motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-600/30 blur-[100px] -translate-y-1/2 translate-x-1/2 hidden lg:block"
          />
          <Motion.div 
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 blur-[120px] translate-y-1/2 -translate-x-1/2 hidden lg:block"
          />
          
          <div className="relative z-10 space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">Your best work <br className="hidden sm:block" /> starts here.</h2>
            <p className="text-sm sm:text-lg md:text-2xl text-surface-400 max-w-3xl mx-auto leading-relaxed font-medium">
              Take control of your workflow with a tool built for precision and speed.
            </p>
            <div className="pt-4 flex justify-center">
              <Link 
                to="/register" 
                className="btn-primary w-full max-w-[260px] lg:max-w-none lg:w-auto px-5 py-3.5 lg:px-12 lg:py-5 text-sm lg:text-lg shadow-2xl shadow-primary-500/20 flex items-center justify-center text-center transition-all hover:scale-105 active:scale-95"
              >
                Create My Workspace
              </Link>
            </div>
          </div>
        </div>
      </Motion.section>

      {/* Footer */}
      <Motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-12 sm:py-16 border-t border-surface-200 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-12">
          <div className="flex flex-col items-center md:items-start space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-xl text-surface-900 tracking-tight">TaskFlow</span>
            </div>
            <div className="space-y-2 text-center md:text-left">
                <p className="text-sm text-surface-500 max-w-[200px]">
                Task management with notes, cards, and reminders in one workspace.
                </p>
                <a href="mailto:jayantisuthar094@gmail.com" className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors block">
                    jayantisuthar094@gmail.com
                </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4 text-sm font-semibold text-surface-600">
              <Link to="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link>
              <Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link>
            </div>
            <p className="text-sm text-surface-400 font-medium text-center">
              &copy; 2026 TaskFlow Inc. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <a href="https://www.linkedin.com/in/jayanti-lal-472548364/" target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-[#0077B5] transition-all hover:scale-125">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="https://github.com/jaysuthar064" target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-surface-900 transition-all hover:scale-125">
              <span className="sr-only">GitHub</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
            </a>
          </div>
        </div>
      </Motion.footer>
    </div>
  );
};

export default Landing;
