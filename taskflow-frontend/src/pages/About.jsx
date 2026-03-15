import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Rocket, Users, Target } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-surface-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="space-y-6">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Landing
            </Link>
            
            <header className="space-y-4">
            <h1 className="text-5xl font-bold text-surface-900 tracking-tight leading-tight">
                Redefining the <br />
                <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">Future of Work</span>
            </h1>
            <p className="text-xl text-surface-500 max-w-2xl leading-relaxed">
                TaskFlow was born from a simple idea: project management should be powerful, yet remarkably beautiful. We build tools for teams that refuse to compromise.
            </p>
            </header>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            <div className="card glass p-8 space-y-4">
                <Rocket className="text-primary-600" size={32} />
                <h3 className="text-xl font-bold text-surface-900">Our Mission</h3>
                <p className="text-surface-600 leading-relaxed">To empower creators and teams by removing technical friction from their creative process.</p>
            </div>
            <div className="card glass p-8 space-y-4">
                <Users className="text-indigo-600" size={32} />
                <h3 className="text-xl font-bold text-surface-900">Our Community</h3>
                <p className="text-surface-600 leading-relaxed">Thousands of forward-thinking teams trust TaskFlow to manage their most ambitious initiatives.</p>
            </div>
            <div className="card glass p-8 space-y-4">
                <Target className="text-emerald-600" size={32} />
                <h3 className="text-xl font-bold text-surface-900">Our Goal</h3>
                <p className="text-surface-600 leading-relaxed">To become the gold standard for productivity through world-class design and engineering.</p>
            </div>
        </div>

        <section className="bg-surface-900 rounded-[2rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-3xl font-bold mb-6 italic">"Design is not just what it looks like and feels like. Design is how it works."</h2>
            <p className="text-surface-400 font-medium">— Steve Jobs</p>
        </section>
      </div>
    </div>
  );
};

export default About;
