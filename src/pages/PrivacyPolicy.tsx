import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-neutral-950 text-white min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        <div className="flex items-center gap-2 text-blue-500">
          <Shield size={24} /> <span className="font-mono text-sm tracking-widest font-bold uppercase">HA Studio Trust</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-neutral-400 text-sm font-mono">Last adjusted: June 6th, 2026</p>

        <div className="text-neutral-300 text-sm leading-relaxed space-y-6">
          <p>
            At HA Studio, we protect and prioritize the absolute visual safety, proprietary video snippets, branding assets, and client metadata that you stream or transmit through our agency website and dashboard routes.
          </p>

          <h3 className="text-xl font-bold text-white mt-8">1. Information Accumulations</h3>
          <p>
            We process full-name identifiers, corporate email addresses, and specific project briefs sent via our briefing forms to compile project proposals.
          </p>

          <h3 className="text-xl font-bold text-white mt-8">2. Data Security Protocols</h3>
          <p>
            Your uploaded image files and logos are cached securely inside our local server directories, protected by standard JWT/Bcrypt encryption guards, and never sold to third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
