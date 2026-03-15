import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Layers, 
  Users,
  Layout
} from "lucide-react";

// The hero image path from the previous step
const HERO_IMAGE = "/brain/4e3adf52-2015-4c50-aa78-6a00bfed85ab/modern_saas_hero_1773576983274.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-surface-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center border-2 border-primary-500/20">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-surface-900 tracking-tight whitespace-nowrap">TaskFlow</span>
          </div>
          
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">Features</a>
            <Link to="/about" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">About</Link>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link to="/login" className="text-sm font-semibold text-surface-700 hover:text-primary-600 transition-colors hidden min-[360px]:block">Sign In</Link>
            <Link to="/register" className="btn-primary py-2 px-4 sm:px-5 text-sm">Join Now</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 min-[360px]:pt-32 pb-16 min-[360px]:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-12">
          <div className="flex-1 text-center lg:text-left space-y-6 sm:space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Zap size={14} className="mr-2" />
              Revolutionize your workflow
            </div>
            <h1 className="text-3xl min-[400px]:text-4xl min-[500px]:text-5xl lg:text-7xl font-bold text-surface-900 tracking-tighter sm:tracking-tight leading-[1.1]">
              Manage Tasks with <br />
              <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent italic">Precision & Style</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-surface-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              The project tool for teams who want world-class design combined with powerful engineering. No compromises.
            </p>
            <div className="flex flex-col min-[450px]:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link to="/register" className="btn-primary px-8 py-3.5 sm:py-4 text-base sm:text-lg flex items-center group w-full min-[450px]:w-auto justify-center">
                Get Started Now
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex items-center justify-center lg:justify-start space-x-6 pt-6 grayscale opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" alt="IBM" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="h-6" />
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute -inset-4 bg-primary-500/10 blur-3xl rounded-full"></div>
            <div className="relative card glass p-2 overflow-hidden border-surface-200/50 shadow-2xl animate-in fade-in slide-in-from-right-8 duration-1000">
               <div className="bg-surface-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <p className="text-primary-400 font-mono text-xs mb-4 uppercase tracking-[0.2em]">Dashboard Preview</p>
                    <div className="flex space-x-2 justify-center mb-6">
                        <div className="w-12 h-2 rounded-full bg-surface-700 animate-pulse"></div>
                        <div className="w-24 h-2 rounded-full bg-surface-700 animate-pulse delay-75"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-square bg-surface-800 rounded-xl border border-white/5 p-4 flex flex-col justify-end">
                            <div className="w-full h-1 bg-primary-500/50 rounded mb-2"></div>
                            <div className="w-1/2 h-1 bg-primary-500/20 rounded"></div>
                        </div>
                        <div className="aspect-square bg-surface-800 rounded-xl border border-white/5 p-4 flex flex-col justify-end">
                            <div className="w-full h-1 bg-indigo-500/50 rounded mb-2"></div>
                            <div className="w-1/2 h-1 bg-indigo-500/20 rounded"></div>
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-bold text-surface-900 tracking-tight">Everything you need to ship faster</h2>
            <p className="text-lg text-surface-500 text-center">
              TaskFlow Pro provides all the tools your team needs to collaborate, plan, and execute without the clutter.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Layout className="text-primary-600" />, 
                title: "Kanban Perfection", 
                desc: "Organize tasks with smooth drag-and-drop boards that feel alive." 
              },
              { 
                icon: <Users className="text-indigo-600" />, 
                title: "Real-time Sync", 
                desc: "Collaborate with your team instantly with frictionless updates." 
              },
              { 
                icon: <Shield className="text-emerald-600" />, 
                title: "Enterprise Security", 
                desc: "Data encryption and role-based access to keep your work safe." 
              }
            ].map((feature, i) => (
              <div key={i} className="card p-8 group hover:border-primary-200 transition-all duration-300">
                <div className="w-12 h-12 bg-surface-50 rounded-2xl flex items-center justify-center mb-6 border border-surface-100 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-3">{feature.title}</h3>
                <p className="text-surface-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 min-[360px]:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto bg-surface-900 rounded-[2rem] p-8 min-[400px]:p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-6 sm:space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">Ready to transform your productivity?</h2>
            <p className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto leading-relaxed">
              Join thousands of teams already using TaskFlow to manage their complex projects with ease.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="btn-primary px-10 py-4 text-base sm:text-lg">Create Free Account</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-surface-200 bg-surface-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-xl text-surface-900 tracking-tight">TaskFlow</span>
            </div>
            <p className="text-sm text-surface-500 max-w-[200px] text-center md:text-left">
              The world's most beautiful project management tool.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-surface-600">
              <Link to="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link>
              <Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link>
            </div>
            <p className="text-sm text-surface-400 font-medium text-center">
              &copy; 2026 TaskFlow Inc. All rights reserved.
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#" className="text-surface-400 hover:text-primary-600 transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
            <a href="#" className="text-surface-400 hover:text-primary-600 transition-colors">
              <span className="sr-only">GitHub</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A100.19 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
