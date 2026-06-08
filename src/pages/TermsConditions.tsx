import React from 'react';
import { ScrollText } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="bg-neutral-950 text-white min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        <div className="flex items-center gap-2 text-blue-500">
          <ScrollText size={24} /> <span className="font-mono text-sm tracking-widest font-bold uppercase">HA Studio Agreements</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">Terms & Conditions</h1>
        <p className="text-neutral-400 text-sm font-mono">Last adjusted: June 6th, 2026</p>

        <div className="text-neutral-300 text-sm leading-relaxed space-y-6">
          <p>
            Welcome to HA Studio. By visiting or consulting on this platform, you agree to these legal frameworks governing our agency relationships.
          </p>

          <h3 className="text-xl font-bold text-white mt-8">1. Creative Ownership</h3>
          <p>
            Bespoke video cuts, custom web design systems, and original drawings created by HA Studio remain the intellectual property of HA Studio until full final proposal payments have been processed and confirmed.
          </p>

          <h3 className="text-xl font-bold text-white mt-8">2. Subcontracting Boundaries</h3>
          <p>
            Our principal creators reserve the absolute right to allocate raw cinematic workloads, animation tasks, or testing processes to trusted studio technicians.
          </p>
        </div>
      </div>
    </div>
  );
}
