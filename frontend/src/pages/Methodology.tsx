import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { setPageSEO, generateArticleSchema } from '../lib/seo';
import { Breadcrumb } from '../components/ui/Breadcrumb';

const pipeline = [
  {
    step: '01',
    title: 'Input Processing',
    description:
      'Accept Ethereum contract addresses or raw Solidity source code. For addresses, SentinelX fetches verified source code from Etherscan.',
    details: [
      'Supports Ethereum mainnet contract addresses',
      'Direct Solidity source code input',
      'Automatic source code verification',
      'Etherscan API integration for source retrieval',
    ],
  },
  {
    step: '02',
    title: 'Feature Extraction',
    description:
      'Extract 53 engineered features from the smart contract covering bytecode patterns, token economics, access control, and code complexity.',
    details: [
      'Bytecode-level pattern analysis',
      'Token supply and distribution metrics',
      'Function visibility and access control flags',
      'Code complexity and inheritance analysis',
      'Proxy and upgradeability detection',
    ],
  },
  {
    step: '03',
    title: 'Rule-Based Detection',
    description:
      'Apply deterministic security rules to flag known dangerous patterns regardless of ML model output.',
    details: [
      'Honeypot detection (blocked sell functions)',
      'Hidden mint function identification',
      'Blacklist and whitelist abuse detection',
      'Fee manipulation pattern recognition',
      'Owner privilege escalation flags',
    ],
  },
  {
    step: '04',
    title: 'ML Classification',
    description:
      'XGBoost gradient-boosted decision tree classifier evaluates the 53 features against patterns learned from 2,400+ labeled contracts.',
    details: [
      'XGBoost gradient-boosted ensemble',
      'Trained on 2,391 rug pulls + 83 legitimate contracts',
      '5-fold cross-validation for robustness',
      'Probability calibration for risk scoring',
    ],
  },
  {
    step: '05',
    title: 'SHAP Explainability',
    description:
      'SHAP (SHapley Additive exPlanations) values attribute the risk score to individual features, showing exactly why a contract was flagged.',
    details: [
      'Feature-level risk attribution',
      'Visual explanation of risk factors',
      'Transparent decision process',
      'Auditable model behavior',
    ],
  },
  {
    step: '06',
    title: 'Risk Report',
    description:
      'Generate a comprehensive risk report with score (0-100), classification, security flags, and actionable recommendations.',
    details: [
      'Risk score from 0-100',
      'Risk classification (Low/Medium/High/Critical)',
      'Individual security flags with severity',
      'Model confidence and response time',
      'Security recommendation',
    ],
  },
];

const metrics = [
  { label: 'Model Accuracy', value: '96.15%', description: 'XGBoost Classifier' },
  { label: 'Precision', value: '99.57%', description: 'Low false positive rate' },
  { label: 'Recall', value: '96.44%', description: 'Catches most rug pulls' },
  { label: 'F1 Score', value: '97.98%', description: 'Balanced performance' },
  { label: 'AUC-ROC', value: '98.54%', description: 'Discrimination ability' },
  { label: 'Cross-Validation', value: '97.16%', description: '±0.43% std deviation' },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export function Methodology() {
  useEffect(() => {
    setPageSEO(
      {
        title: 'How SentinelX Works | Security Methodology & ML Pipeline',
        description:
          'Learn how SentinelX uses XGBoost ML, rule-based detection, SHAP explainability, and 53 smart-contract features to identify rug-pull risk indicators. Full methodology breakdown.',
        keywords: [
          'security methodology',
          'how SentinelX works',
          'XGBoost security',
          'smart contract analysis',
          'SHAP explainability',
          'feature extraction',
        ],
        type: 'article',
      },
      '/methodology'
    );
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Methodology' }]} />

      {/* Hero */}
      <section className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div {...fadeInUp} transition={{ duration: 0.5 }} className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0a0a0a] tracking-tight leading-tight">
            How SentinelX Works
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
            A transparent breakdown of the SentinelX analysis pipeline: from smart-contract input
            to explainable risk assessment. Every step is auditable and grounded in published ML
            research.
          </p>
        </motion.div>
      </section>

      {/* Important Disclaimer */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Disclaimer:</strong> SentinelX uses automated machine learning and rule-based
            analysis to identify <em>potential</em> security risks. This analysis is for
            informational and security-research purposes only. A low risk score does not guarantee
            safety, and a high score does not prove malicious intent. SentinelX does not provide
            financial advice.
          </p>
        </div>
      </section>

      {/* Analysis Pipeline */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <h2 className="text-2xl font-bold text-[#0a0a0a] mb-8">Analysis Pipeline</h2>
        <div className="space-y-8">
          {pipeline.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative pl-16 sm:pl-20"
            >
              {/* Step number */}
              <div className="absolute left-0 top-0 w-12 h-12 bg-[#6D001A] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                {item.step}
              </div>
              {/* Connector line */}
              {i < pipeline.length - 1 && (
                <div className="absolute left-5 top-14 w-px h-full bg-gray-200" aria-hidden="true" />
              )}
              <div className="pb-8">
                <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {item.details.map((detail, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mt-0.5 text-[#6D001A] flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Model Performance */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">Model Performance</h2>
        <p className="text-gray-500 mb-8">
          Evaluated metrics from the SentinelX training dataset. These are evaluation results, not
          real-world guarantees.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="p-6 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="text-3xl font-bold text-[#6D001A] font-mono">{metric.value}</div>
              <div className="mt-1 font-semibold text-[#0a0a0a]">{metric.label}</div>
              <div className="text-sm text-gray-500 mt-1">{metric.description}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dataset */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">Training Dataset</h2>
        <p className="text-gray-500 mb-8">
          SentinelX is trained on a curated, labeled dataset of Ethereum smart contracts.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-4xl font-bold text-[#0a0a0a]">2,391</div>
            <div className="text-gray-600 mt-1">Confirmed rug-pull addresses</div>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-4xl font-bold text-[#0a0a0a]">83</div>
            <div className="text-gray-600 mt-1">Curated legitimate contracts</div>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-4xl font-bold text-[#0a0a0a]">2,465</div>
            <div className="text-gray-600 mt-1">Source codes successfully retrieved</div>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-4xl font-bold text-[#0a0a0a]">53</div>
            <div className="text-gray-600 mt-1">Engineered security features</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <div className="bg-[#0a0a0a] rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Try the Analysis Pipeline</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Submit a contract address or Solidity code and see the full analysis pipeline in action.
          </p>
          <Link
            to="/scan"
            className="inline-block bg-[#6D001A] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#5a0015] transition-colors"
          >
            Analyze a Contract
          </Link>
        </div>
      </section>

      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateArticleSchema({
              title: 'How SentinelX Works | Security Methodology & ML Pipeline',
              description:
                'Learn how SentinelX uses XGBoost ML, rule-based detection, SHAP explainability, and 53 smart-contract features to identify rug-pull risk indicators.',
              url: 'https://sentinelx.site/methodology',
              publishedTime: '2026-07-15',
              modifiedTime: '2026-08-27',
            })
          ),
        }}
      />
    </div>
  );
}
