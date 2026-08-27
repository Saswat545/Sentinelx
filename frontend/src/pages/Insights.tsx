import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { setPageSEO, generateArticleSchema } from '../lib/seo';
import { Breadcrumb } from '../components/ui/Breadcrumb';

const articles = [
  {
    slug: 'top-5-rug-pull-indicators-2026',
    title: 'Top 5 Rug Pull Indicators Every Crypto Investor Must Know in 2026',
    excerpt:
      'Learn the warning signs of rug pulls: hidden mint functions, blacklisted sellers, proxy upgrades, and more. SentinelX detects 53+ risk signals automatically.',
    category: 'Threat Analysis',
    readTime: '6 min read',
    date: '2026-08-20',
    featured: true,
  },
  {
    slug: 'how-xgboost-detects-rug-pulls',
    title: 'How XGBoost Machine Learning Detects Rug Pulls with 96.15% Accuracy',
    excerpt:
      'Deep dive into how SentinelX uses gradient-boosted decision trees trained on 2,400+ labeled contracts to classify smart contract risk.',
    category: 'Methodology',
    readTime: '8 min read',
    date: '2026-08-15',
    featured: true,
  },
  {
    slug: 'shap-explainability-smart-contracts',
    title: 'SHAP Explainability: Understanding Why SentinelX Flags a Contract as Risky',
    excerpt:
      'SentinelX does not just give you a score — it explains why. Learn how SHAP values reveal which features contribute most to a risk assessment.',
    category: 'Research',
    readTime: '7 min read',
    date: '2026-08-10',
    featured: false,
  },
  {
    slug: 'honeypot-detection-deep-dive',
    title: 'Honeypot Detection: How SentinelX Identifies Tokens That Block Selling',
    excerpt:
      'Honeypots are among the most deceptive rug-pull tactics. Learn how SentinelX uses static analysis and ML to detect tokens that prevent you from selling.',
    category: 'Threat Analysis',
    readTime: '5 min read',
    date: '2026-08-05',
    featured: false,
  },
  {
    slug: 'understanding-53-smart-contract-features',
    title: 'Understanding the 53 Smart-Contract Features SentinelX Analyzes',
    excerpt:
      'A complete breakdown of the feature engineering pipeline: from bytecode analysis to token economics, every signal SentinelX extracts and why it matters.',
    category: 'Methodology',
    readTime: '10 min read',
    date: '2026-07-28',
    featured: false,
  },
  {
    slug: 'defi-security-best-practices-2026',
    title: 'DeFi Security Best Practices: Protecting Your Portfolio in 2026',
    excerpt:
      'From contract verification to token approvals, learn practical steps every DeFi user should take to protect their assets from smart contract exploits.',
    category: 'Security Guide',
    readTime: '9 min read',
    date: '2026-07-20',
    featured: false,
  },
];

const categoryColors: Record<string, string> = {
  'Threat Analysis': 'bg-red-100 text-red-800',
  Methodology: 'bg-blue-100 text-blue-800',
  Research: 'bg-purple-100 text-purple-800',
  'Security Guide': 'bg-green-100 text-green-800',
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export function Insights() {
  useEffect(() => {
    setPageSEO(
      {
        title: 'Security Insights | SentinelX Blockchain Intelligence',
        description:
          'Latest blockchain security insights: threat trends, vulnerability analysis, and research from the SentinelX security team.',
        keywords: [
          'security insights',
          'blockchain intelligence',
          'threat analysis',
          'rug pull prevention',
          'smart contract security',
        ],
        type: 'article',
      },
      '/insights'
    );
  }, []);

  const featured = articles.filter((a) => a.featured);
  const regular = articles.filter((a) => !a.featured);

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Security Insights' }]} />

      {/* Hero */}
      <section className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-semibold tracking-wider text-[#6D001A] uppercase mb-3">
            Security Insights
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0a0a0a] tracking-tight leading-tight">
            Blockchain Security Intelligence
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
            Research, threat analysis, and methodology deep-dives from the SentinelX security team.
            Stay informed about the latest rug-pull tactics and how to protect your assets.
          </p>
        </motion.div>
      </section>

      {/* Featured Articles */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-6">
          Featured
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {featured.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                to={`/insights/${article.slug}`}
                className="block group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#6D001A]/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      categoryColors[article.category] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {article.category}
                  </span>
                  <span className="text-sm text-gray-400">{article.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0a0a0a] group-hover:text-[#6D001A] transition-colors leading-tight mb-3">
                  {article.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{article.excerpt}</p>
                <p className="mt-4 text-sm text-gray-400">{article.date}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Regular Articles */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-6">
          All Articles
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {regular.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={`/insights/${article.slug}`}
                className="block group p-6 bg-white rounded-xl border border-gray-100 hover:border-[#6D001A]/20 hover:shadow-md transition-all duration-300 h-full"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      categoryColors[article.category] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-400">{article.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-[#0a0a0a] group-hover:text-[#6D001A] transition-colors leading-snug mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{article.excerpt}</p>
                <p className="mt-3 text-xs text-gray-400">{article.date}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articles.map((a) =>
              generateArticleSchema({
                title: a.title,
                description: a.excerpt,
                url: `https://sentinelx.site/insights/${a.slug}`,
                publishedTime: a.date,
              })
            )
          ),
        }}
      />
    </div>
  );
}
