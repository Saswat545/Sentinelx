import React from 'react';
import { NavigationPage } from '../../types';

interface TermsScreenProps {
  onNavigate: (page: NavigationPage) => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-[#0B0F17] text-gray-100">
      
      {/* Breadcrumb */}
      <nav className="text-xs font-mono text-gray-500" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('landing')} className="hover:text-gray-300 cursor-pointer">Home</button>
        <span className="mx-2">/</span>
        <span className="text-gray-300">Terms of Service</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">Terms of Service</h1>
        <p className="text-xs text-gray-400 font-mono">Last updated: August 23, 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-sm text-gray-300 leading-relaxed font-sans">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">1. Acceptance of Terms</h2>
          <p>
            By accessing or using SentinelX (sentinelx.site), you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">2. Description of Service</h2>
          <p>
            SentinelX is an AI-powered blockchain security analysis platform that analyzes Ethereum smart contracts and token addresses to identify potential security risks, including rug-pull indicators, honeypot patterns, and dangerous contract behaviors.
          </p>
          <p>
            The platform uses machine learning (XGBoost), rule-based security detection, and SHAP-based explainability to generate automated risk assessments.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">3. Important Disclaimers</h2>
          
          <div className="p-4 bg-[#e63946]/10 border border-[#e63946]/40 rounded-xl space-y-2">
            <h3 className="text-base font-bold text-[#e63946]">⚠️ Not Financial Advice</h3>
            <p>
              SentinelX provides automated security analysis for informational and security-research purposes only. Nothing on this platform constitutes financial, investment, trading, or legal advice. You should consult qualified professionals before making investment decisions.
            </p>
          </div>

          <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-xl space-y-2">
            <h3 className="text-base font-bold text-amber-400">⚠️ No Guarantee of Safety</h3>
            <p>
              A low risk score from SentinelX does not guarantee that a smart contract or token is safe. SentinelX identifies potential risks based on pattern analysis and machine learning — it cannot predict all possible attack vectors or malicious behaviors. No automated tool can provide absolute security assurance.
            </p>
          </div>

          <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-xl space-y-2">
            <h3 className="text-base font-bold text-amber-400">⚠️ No Guarantee of Detection</h3>
            <p>
              SentinelX does not guarantee detection of every scam, rug pull, or malicious contract. The XGBoost model achieves high accuracy on its training dataset, but real-world performance may vary. Always conduct independent research and due diligence.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">4. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are solely responsible for your investment decisions</li>
            <li>You must not use SentinelX for any unlawful purpose</li>
            <li>You must not attempt to abuse, overload, or exploit the platform</li>
            <li>You must not reverse-engineer or circumvent platform security measures</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">5. Intellectual Property</h2>
          <p>
            The SentinelX platform, including its design, code, machine learning models, and content, is owned by SentinelX. You may not copy, modify, distribute, or reverse-engineer any part of the platform without explicit written permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, SentinelX shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your use of or inability to use the platform</li>
            <li>Investment losses based on analysis results</li>
            <li>Accuracy or completeness of risk assessments</li>
            <li>Unauthorized access to your account or data</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">7. Service Availability</h2>
          <p>
            SentinelX strives to maintain high availability but does not guarantee uninterrupted service. The platform may be temporarily unavailable for maintenance, updates, or due to technical issues. We are not liable for any downtime or service interruptions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">8. Modifications</h2>
          <p>
            We reserve the right to modify these Terms at any time. Material changes will be communicated through the platform. Your continued use after changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">9. Governing Law</h2>
          <p>
            These Terms are governed by applicable laws. Any disputes shall be resolved through appropriate legal channels in the applicable jurisdiction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">10. Contact</h2>
          <p>
            For questions about these Terms, contact us at{' '}
            <a href="mailto:security@sentinelx.io" className="text-blue-400 hover:text-blue-300 underline">security@sentinelx.io</a>.
          </p>
        </section>

        <div className="mt-8 p-4 bg-[#111827] border border-gray-800 rounded-xl text-xs text-gray-400 font-mono">
          <p className="font-bold text-gray-300 mb-1">Disclaimer</p>
          <p>
            These terms of service are provided for informational purposes and should be reviewed by qualified legal counsel before final adoption. SentinelX provides automated security analysis tools and is not a financial advisor, broker, or registered investment platform.
          </p>
        </div>

      </div>
    </div>
  );
};
