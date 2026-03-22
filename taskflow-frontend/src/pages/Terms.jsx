import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Scale, AlertOctagon, UserX, Globe } from "lucide-react";
import Seo from "../components/common/Seo";

const Terms = () => {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const toSchemaUrl = (path) => siteUrl ? `${siteUrl}${path}` : path;
  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service | TaskFlow",
    url: toSchemaUrl("/terms"),
    description: "Review the terms that apply when using TaskFlow for task management, reminders, and workspace organization."
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
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Terms of Service",
        item: toSchemaUrl("/terms")
      }
    ]
  };

  return (
    <div className="min-h-screen bg-surface-50 p-4 sm:p-6 md:p-12">
      <Seo
        title="Terms of Service | TaskFlow"
        description="Review the terms that apply when using TaskFlow for task management, reminders, and workspace organization."
        path="/terms"
        keywords={[
          "taskflow terms",
          "task app terms of service",
          "workspace app legal terms",
          "task reminder platform terms"
        ]}
        schema={[termsSchema, breadcrumbSchema]}
      />
      <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12 animate-in fade-in slide-in-from-bottom-3 duration-700">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors group">
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Landing
        </Link>
        
        <header className="space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/10">
            <FileText size={32} className="sm:hidden" />
            <FileText size={40} className="hidden sm:block" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-surface-900 tracking-tight">Terms of Service</h1>
            <p className="text-lg text-surface-500 font-medium tracking-wide uppercase">Last updated: March 15, 2026</p>
          </div>
          <p className="text-base sm:text-xl text-surface-600 leading-relaxed max-w-3xl">
            Welcome to TaskFlow. These terms govern your use of our project management platform. By using our service, you agree to these legal conditions.
          </p>
        </header>

        <div className="grid gap-8">
          <section className="card glass p-5 sm:p-8 md:p-10 space-y-6 border-white/40">
            <div className="flex flex-col items-start gap-3 min-[420px]:flex-row min-[420px]:items-center text-indigo-600">
                <Globe size={24} />
                <h2 className="text-2xl font-bold text-surface-900">1. Acceptance & Scope</h2>
            </div>
            <div className="space-y-4 text-surface-600 leading-relaxed">
                <p>By accessing TaskFlow, you enter into a binding legal agreement with TaskFlow Inc. These terms apply to all visitors, users, and others who access the service.</p>
                <p>TaskFlow provides a visual task management environment. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without prior notice, though we always strive to provide notice for major changes.</p>
            </div>
          </section>

          <section className="card glass p-5 sm:p-8 md:p-10 space-y-6 border-white/40">
            <div className="flex flex-col items-start gap-3 min-[420px]:flex-row min-[420px]:items-center text-primary-600">
                <Scale size={24} />
                <h2 className="text-2xl font-bold text-surface-900">2. User Rights & Content</h2>
            </div>
            <div className="space-y-4 text-surface-600 leading-relaxed">
                <p>You retain full ownership of the content (tasks, descriptions, boards) you create on TaskFlow. However, you grant us a worldwide, non-exclusive license to host and synchronize this content to provide the service to you.</p>
                <div className="p-5 rounded-2xl bg-surface-900 text-white space-y-3">
                    <h4 className="font-bold text-primary-400 uppercase tracking-widest text-xs">Proprietary Rights</h4>
                    <p className="text-sm text-surface-300">The TaskFlow UI, code, brand, and design system are the exclusive property of TaskFlow Inc. You may not replicate or distribute our source code or visual assets without explicit permission.</p>
                </div>
            </div>
          </section>

          <section className="card glass p-5 sm:p-8 md:p-10 space-y-6 border-white/40">
            <div className="flex flex-col items-start gap-3 min-[420px]:flex-row min-[420px]:items-center text-orange-600">
                <UserX size={24} />
                <h2 className="text-2xl font-bold text-surface-900">3. Prohibited Conduct</h2>
            </div>
            <div className="space-y-4 text-surface-600 leading-relaxed">
                <p>To maintain a high-quality environment for all users, you agree <strong>not</strong> to:</p>
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 list-disc pl-6">
                    <li>Reverse engineer or scrape the platform.</li>
                    <li>Upload malicious code or viruses.</li>
                    <li>Use the service for illegal or unauthorized activities.</li>
                    <li>Attempt to bypass security or rate limits.</li>
                    <li>Interfere with other users' workspace integrity.</li>
                </ul>
                <p>Violation of these rules may lead to immediate account suspension or termination.</p>
            </div>
          </section>

          <section className="card glass p-5 sm:p-8 md:p-10 space-y-6 border-white/40">
            <div className="flex flex-col items-start gap-3 min-[420px]:flex-row min-[420px]:items-center text-red-600">
                <AlertOctagon size={24} />
                <h2 className="text-2xl font-bold text-surface-900">4. Liability Limitations</h2>
            </div>
            <div className="space-y-4 text-surface-600 leading-relaxed uppercase font-mono text-sm tracking-tight break-words">
                <p className="p-4 bg-red-50 text-red-900 rounded-xl border border-red-100 leading-tight break-words">
                    "TASKFLOW IS PROVIDED 'AS IS' WITHOUT ANY WARRANTIES, EXPRESS OR IMPLIED. WE ARE NOT LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM THE USE OF THE SERVICE, INCLUDING DATA LOSS OR SERVICE INTERRUPTIONS."
                </p>
                <p className="text-xs text-surface-400 bg-transparent p-0">
                    We do our absolute best to ensure 99.9% uptime and data safety, but our legal team requires us to state that all risks associated with using a web-based project management tool are borne by the user.
                </p>
            </div>
          </section>

          <section className="py-10 sm:py-12 border-t border-surface-200">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-2">
                    <h4 className="font-bold text-surface-900">Changes to Terms</h4>
                    <p className="text-sm text-surface-500 max-w-md">We may update these terms to reflect changes in our service or legal landscape. Continued use after changes constitutes acceptance.</p>
                </div>
                <div className="space-y-2">
                    <h4 className="font-bold text-surface-900">Contact Legal</h4>
                    <p className="text-sm text-primary-600 font-bold"><a href="mailto:jayantisuthar094@gmail.com" className="hover:underline">jayantisuthar094@gmail.com</a></p>
                </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
