import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, Eye, Server, UserCheck } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-surface-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors group">
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Landing
        </Link>
        
        <header className="space-y-6">
          <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center shadow-xl shadow-primary-500/10">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-surface-900 tracking-tight">Privacy Policy</h1>
            <p className="text-lg text-surface-500 font-medium tracking-wide uppercase">Last updated: March 15, 2026</p>
          </div>
          <p className="text-xl text-surface-600 leading-relaxed max-w-3xl">
            Your privacy is at the core of TaskFlow. We've built our platform with transparency and security in mind, ensuring your data remains yours.
          </p>
        </header>

        <div className="grid gap-8">
          <section className="card glass p-8 md:p-10 space-y-6 border-white/40">
            <div className="flex items-center space-x-4 text-primary-600">
                <UserCheck size={24} />
                <h2 className="text-2xl font-bold text-surface-900">1. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-surface-600 leading-relaxed">
                <p>We only collect information that is essential for providing you with a seamless task management experience. This includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Account Basics:</strong> Name and email address required for registration and account recovery.</li>
                    <li><strong>Task Content:</strong> Information you explicitly enter into tasks, boards, and descriptions.</li>
                    <li><strong>Usage Data:</strong> Anonymous technical logs to help us identify and fix performance bottlenecks.</li>
                </ul>
                <p>We do <strong>not</strong> collect sensitive personal data like financial information or precise geolocation unless explicitly required by a specific feature you enable.</p>
            </div>
          </section>

          <section className="card glass p-8 md:p-10 space-y-6 border-white/40">
            <div className="flex items-center space-x-4 text-indigo-600">
                <Eye size={24} />
                <h2 className="text-2xl font-bold text-surface-900">2. Data Usage & Transparency</h2>
            </div>
            <div className="space-y-4 text-surface-600 leading-relaxed">
                <p>TaskFlow serves you, not advertisers. We use your data exclusively to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Deliver real-time task synchronization across your devices.</li>
                    <li>Personalize your dashboard and notifications based on your deadlines.</li>
                    <li>Send critical security alerts and updates regarding your account.</li>
                </ul>
                <p className="p-4 bg-primary-50 rounded-xl border border-primary-100 italic text-primary-900">
                    "We do not sell, rent, or trade your personal data to any third parties for marketing purposes. Period."
                </p>
            </div>
          </section>

          <section className="card glass p-8 md:p-10 space-y-6 border-white/40">
            <div className="flex items-center space-x-4 text-emerald-600">
                <Lock size={24} />
                <h2 className="text-2xl font-bold text-surface-900">3. Security Architecture</h2>
            </div>
            <div className="space-y-4 text-surface-600 leading-relaxed">
                <p>Your data is protected by industry-leading security protocols designed for high-stakes projects:</p>
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-5 rounded-2xl bg-white border border-surface-100 space-y-2">
                        <h4 className="font-bold text-surface-900">AES-256 Encryption</h4>
                        <p className="text-sm">All task data is encrypted at rest using advanced standards.</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-surface-100 space-y-2">
                        <h4 className="font-bold text-surface-900">TLS/SSL Transit</h4>
                        <p className="text-sm">Data in transit is protected by secure, encrypted channels.</p>
                    </div>
                </div>
                <p>We regularly audit our infrastructure to prevent unauthorized access and ensure your workspace remains a safe vault for your ideas.</p>
            </div>
          </section>

          <section className="card glass p-8 md:p-10 space-y-6 border-white/40">
            <div className="flex items-center space-x-4 text-orange-600">
                <Server size={24} />
                <h2 className="text-2xl font-bold text-surface-900">4. Data Retention & Deletion</h2>
            </div>
            <div className="space-y-4 text-surface-600 leading-relaxed">
                <p>You have full control over your data. You can export your tasks at any time or request permanent account deletion. When you delete your account:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Your personal information is immediately scrubbed from our active databases.</li>
                    <li>Associated tasks and media are permanently removed after a 30-day "safety" window.</li>
                    <li>Archived logs containing anonymous data may persist for up to 90 days for system integrity.</li>
                </ul>
            </div>
          </section>

          <section className="py-12 text-center space-y-4">
            <div className="w-12 h-1 bg-surface-200 mx-auto rounded-full"></div>
            <p className="text-surface-500 font-medium">Still have questions?</p>
            <p className="text-surface-400 max-w-lg mx-auto leading-relaxed">
                We believe in human-readable policies. Contact our privacy team at <a href="mailto:jayantisuthar094@gmail.com" className="text-primary-600 font-bold hover:underline">jayantisuthar094@gmail.com</a> for deep dives into our technical safeguards.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
