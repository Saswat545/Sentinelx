import React from 'react';
import { NavigationPage } from '../../types';

interface PrivacyScreenProps {
  onNavigate: (page: NavigationPage) => void;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-[#0B0F17] text-gray-100">
      
      {/* Breadcrumb */}
      <nav className="text-xs font-mono text-gray-500" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('landing')} className="hover:text-gray-300 cursor-pointer">Home</button>
        <span className="mx-2">/</span>
        <span className="text-gray-300">Privacy Policy</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">Privacy Policy</h1>
        <p className="text-xs text-gray-400 font-mono">Last updated: August 23, 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-sm text-gray-300 leading-relaxed font-sans">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">1. Introduction</h2>
          <p>
            SentinelX ("we," "our," or "us") operates the SentinelX platform at <a href="https://sentinelx.site" className="text-blue-400 hover:text-blue-300 underline">sentinelx.site</a>. This Privacy Policy explains how we collect, use, and protect information when you use our AI-powered smart contract security analysis platform.
          </p>
          <p>
            By using SentinelX, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">2. Information We Collect</h2>
          <h3 className="text-base font-semibold text-gray-200">2.1 Smart Contract Data</h3>
          <p>
            When you use the analysis feature, you may submit Ethereum contract addresses or Solidity source code. This data is processed to generate security analysis results. We do not permanently store the contract source code you submit after the analysis is complete.
          </p>
          <h3 className="text-base font-semibold text-gray-200">2.2 Account Information</h3>
          <p>
            If you create an account, we collect your email address, name, and authentication credentials. This information is used solely for account management and service delivery.
          </p>
          <h3 className="text-base font-semibold text-gray-200">2.3 Usage Data</h3>
          <p>
            We may collect anonymous usage data including page views, feature usage patterns, and error reports to improve the platform. This data does not include private keys, wallet addresses used for transactions, or sensitive contract source code.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain the SentinelX security analysis service</li>
            <li>To process smart contract analysis requests</li>
            <li>To manage your account and authentication</li>
            <li>To improve our machine learning models and analysis accuracy</li>
            <li>To detect and prevent abuse of the platform</li>
            <li>To communicate service updates and security alerts</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">4. Data Storage and Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. Contract source code submitted for analysis is processed in memory and is not permanently stored on our servers. Account data is stored on encrypted databases with appropriate access controls.
          </p>
          <p>
            We do not store private keys, wallet mnemonics, or transaction signing data. SentinelX never has access to your cryptocurrency wallets or funds.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">5. Third-Party Services</h2>
          <p>
            SentinelX integrates with the following third-party services:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Etherscan API:</strong> Used to fetch verified smart contract source code from the Ethereum blockchain when you submit a contract address for analysis.</li>
            <li><strong>Vercel:</strong> Hosting platform for the SentinelX frontend application.</li>
            <li><strong>Render:</strong> Hosting platform for the SentinelX backend analysis service.</li>
          </ul>
          <p>
            These third-party services have their own privacy policies governing their handling of data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">6. Data Retention</h2>
          <p>
            Account information is retained for as long as your account is active. Analysis results are stored locally in your browser using localStorage and are not transmitted to our servers for long-term storage. You may delete your analysis history at any time from the dashboard.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">7. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Opt out of non-essential data collection</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">8. Children's Privacy</h2>
          <p>
            SentinelX is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be communicated through the platform or via email. Continued use of SentinelX after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-heading">10. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{' '}
            <a href="mailto:security@sentinelx.io" className="text-blue-400 hover:text-blue-300 underline">security@sentinelx.io</a>.
          </p>
        </section>

        <div className="mt-8 p-4 bg-[#111827] border border-gray-800 rounded-xl text-xs text-gray-400 font-mono">
          <p className="font-bold text-gray-300 mb-1">Disclaimer</p>
          <p>
            This privacy policy is provided for informational purposes. SentinelX provides automated security analysis tools and does not provide financial, legal, or investment advice. Consult appropriate professionals for legal or compliance guidance specific to your jurisdiction.
          </p>
        </div>

      </div>
    </div>
  );
};
