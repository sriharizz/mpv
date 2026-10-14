import React from 'react';
import { FileText, Printer, Download, ShieldCheck, ArrowLeft } from 'lucide-react';

export const MedicalSourceDocPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 text-brand-900 font-bold text-sm">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>Clinevo Medical Information Source Document</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={() => window.close()}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-200 text-slate-800 space-y-6 leading-relaxed">
          {/* Header */}
          <div className="border-b-2 border-brand-500 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-brand-900">Clinevo-Vax (Paracetamol) 500mg</h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">DOCUMENT ID: DOC-CV-001 | REVISION: 2.4 | ICH-E2B(R3)</p>
            </div>
            <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Regulatory Validated</span>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
              1. Product Overview & Chemical Profile
            </h2>
            <p className="text-xs text-slate-600">
              Clinevo-Vax 500mg contains Paracetamol (acetaminophen) as an active pharmaceutical ingredient formulated as a film-coated tablet. It functions as a synthetic non-opiate derivative of p-aminophenol, producing analgesia and antipyresis through the inhibition of central nervous system prostaglandin synthesis.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
              2. Known Adverse Reactions & Expectedness
            </h2>
            <div className="text-xs text-slate-600 space-y-2">
              <p>
                In clinical safety monitoring, Pyrexia (Reported Term: "Fever", MedDRA Code: 10016558) has been identified under the System Organ Class "General disorders and administration site conditions".
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Expectedness: Unlisted / Transient Expected when co-administered in combination vaccination regimens.</li>
                <li>Severity: Typically Grade 1 (Mild) to Grade 2 (Moderate), abating within 24–48 hours post cessation or supportive care.</li>
                <li>Dechallenge / Rechallenge: Positive dechallenge observed in &gt;95% of verified post-marketing surveillance reports.</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
              3. Regulatory Compliance & Pharmacovigilance Guidance
            </h2>
            <p className="text-xs text-slate-600">
              All serious, unexpected adverse reactions occurring during therapy must be recorded, validated, and processed within 15 calendar days in accordance with EMA Module VI and FDA 21 CFR 314.80 mandates.
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <p>© Clinevo Technologies Regulatory Affairs & Safety Documentation Group</p>
            <p>Generated for OnePV Intake System 1.1 Validation Execution</p>
          </div>
        </div>
      </div>
    </div>
  );
};
