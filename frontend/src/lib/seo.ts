// SentinelX — Centralized SEO Utilities
// https://sentinelx.site

const SITE_URL = 'https://sentinelx.site';
const SITE_NAME = 'SentinelX';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const TWITTER_HANDLE = '@sentinelx';

export interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;
}

export const SEO_DEFAULTS = {
  siteName: SITE_NAME,
  siteUrl: SITE_URL,
  defaultImage: DEFAULT_IMAGE,
  twitterHandle: TWITTER_HANDLE,
};

// Page-specific SEO configurations
export const PAGE_SEO: Record<string, SEOConfig> = {
  home: {
    title: 'SentinelX | AI-Powered Crypto Security & Rug Pull Detection',
    description:
      'SentinelX analyzes Ethereum smart contracts using XGBoost ML, 53+ security signals, and SHAP explainability to detect rug pulls, honeypots, and hidden backdoors before you sign.',
    keywords: [
      'rug pull detector',
      'smart contract security',
      'Ethereum security',
      'blockchain security',
      'XGBoost',
      'SHAP explainability',
      'DeFi security',
      'crypto safety',
      'honeypot detection',
      'SentinelX',
    ],
    type: 'website',
  },
  scan: {
    title: 'Scan a Smart Contract | SentinelX Contract Analyzer',
    description:
      'Paste an Ethereum contract address or Solidity code to detect rug pulls, honeypots, and security vulnerabilities. Free AI-powered analysis with 53+ security signals.',
    keywords: [
      'contract scanner',
      'smart contract analyzer',
      'Ethereum contract check',
      'rug pull check',
      'solidity analyzer',
      'token security check',
    ],
    type: 'website',
  },
  features: {
    title: 'Features | SentinelX — AI Security Platform Capabilities',
    description:
      'Explore SentinelX features: XGBoost ML risk scoring, SHAP explainability, 53+ security signals, honeypot detection, access control analysis, and real-time monitoring.',
    keywords: [
      'smart contract features',
      'ML security analysis',
      'SHAP explainability',
      'honeypot detection',
      'security signals',
    ],
    type: 'website',
  },
  pricing: {
    title: 'Pricing | SentinelX — AI Security Plans',
    description:
      'Choose a SentinelX plan: Free basic scans, Pro unlimited analysis, or Enterprise custom deployment. Secure your DeFi portfolio today.',
    keywords: ['security pricing', 'crypto security plans', 'blockchain analysis pricing'],
    type: 'website',
  },
  security: {
    title: 'How SentinelX Works | Security Methodology',
    description:
      'Learn how SentinelX uses XGBoost ML, rule-based detection, SHAP explainability, and 53+ smart-contract features to identify rug-pull risk indicators.',
    keywords: [
      'security methodology',
      'how SentinelX works',
      'XGBoost security',
      'smart contract analysis',
    ],
    type: 'article',
  },
  about: {
    title: 'About SentinelX | AI-Powered Blockchain Security',
    description:
      'SentinelX is an AI-powered blockchain security platform that protects crypto users from rug pulls, honeypots, and smart contract vulnerabilities using machine learning.',
    keywords: ['about SentinelX', 'blockchain security company', 'crypto protection'],
    type: 'website',
  },
  faq: {
    title: 'FAQ | SentinelX — Smart Contract Security Questions',
    description:
      'Get answers to common questions about SentinelX: how risk scores work, supported chains, model accuracy, and whether SentinelX is financial advice.',
    keywords: ['SentinelX FAQ', 'smart contract questions', 'rug pull FAQ'],
    type: 'website',
  },
  contact: {
    title: 'Contact SentinelX | Get in Touch',
    description:
      'Contact the SentinelX team for partnerships, security research inquiries, or support. We respond to all legitimate requests within 48 hours.',
    keywords: ['contact SentinelX', 'support', 'partnership'],
    type: 'website',
  },
  pricing_page: {
    title: 'Pricing Plans | SentinelX — Choose Your Security Level',
    description:
      'SentinelX offers free, pro, and enterprise plans for smart contract security analysis. Protect your DeFi investments with AI-powered rug pull detection.',
    keywords: ['pricing', 'plans', 'security analysis cost'],
    type: 'website',
  },
  privacy: {
    title: 'Privacy Policy | SentinelX',
    description:
      'SentinelX privacy policy: how we collect, use, and protect your data. We do not sell personal information. Read our full privacy practices.',
    keywords: ['privacy policy', 'data protection', 'GDPR'],
    noindex: false,
    type: 'website',
  },
  terms: {
    title: 'Terms of Service | SentinelX',
    description:
      'SentinelX terms of service: acceptable use, liability limitations, and service agreements. SentinelX provides automated analysis, not financial advice.',
    keywords: ['terms of service', 'user agreement', 'legal'],
    type: 'website',
  },
  disclaimer: {
    title: 'Disclaimer | SentinelX — Not Financial Advice',
    description:
      'SentinelX provides automated security analysis for informational purposes only. Results are not a guarantee of safety or financial advice.',
    keywords: ['disclaimer', 'not financial advice', 'security analysis disclaimer'],
    type: 'website',
  },
  cookies: {
    title: 'Cookie Policy | SentinelX',
    description:
      'SentinelX cookie policy: how we use cookies to improve your experience. Essential cookies only — no tracking without consent.',
    keywords: ['cookie policy', 'cookies', 'privacy'],
    type: 'website',
  },
  how_it_works: {
    title: 'How SentinelX Works | Smart Contract Security Analysis',
    description:
      'Discover how SentinelX analyzes Ethereum contracts: feature extraction, XGBoost ML classification, SHAP explainability, and rule-based security detection.',
    keywords: ['how it works', 'security analysis process', 'ML classification'],
    type: 'article',
  },
  incident_reports: {
    title: 'Incident Reports | Real Crypto Rug Pull Case Studies',
    description:
      'Analyze real rug-pull incidents: Toncoin, Aqua, Memecoin, and more. Learn from real cases how SentinelX would have detected these threats.',
    keywords: ['rug pull incidents', 'crypto security cases', 'real rug pulls', 'case studies'],
    type: 'article',
  },
  insights: {
    title: 'Security Insights | SentinelX Blockchain Intelligence',
    description:
      'Latest blockchain security insights: threat trends, vulnerability analysis, and research from the SentinelX security team.',
    keywords: ['security insights', 'blockchain intelligence', 'threat analysis'],
    type: 'article',
  },
  docs: {
    title: 'Documentation | SentinelX API & Integration Guide',
    description:
      'SentinelX developer documentation: API reference, integration guides, SDK setup, and smart contract analysis examples.',
    keywords: ['documentation', 'API reference', 'integration guide', 'developer docs'],
    type: 'website',
  },
  coming_soon: {
    title: 'Coming Soon | SentinelX',
    description: 'This SentinelX feature is under development. Stay tuned for updates.',
    keywords: ['coming soon', 'under development'],
    noindex: true,
    type: 'website',
  },
};

// Generate JSON-LD structured data for different page types
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/light/Icon mark.png`,
    sameAs: [
      'https://github.com/Saswat545/Sentinelx',
      'https://www.linkedin.com/company/sentinelxx/',
    ],
    description:
      'SentinelX is an AI-powered blockchain security platform that analyzes smart contracts to detect rug pulls, honeypots, and security vulnerabilities.',
    foundingDate: '2025',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${SITE_URL}/contact`,
    },
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'AI-powered smart contract security intelligence platform.',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: `${SITE_URL}/brand/light/Icon mark.png`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/scan?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    description:
      'AI-powered crypto security platform that analyzes Ethereum tokens and smart contracts for potential rug-pull risks using XGBoost ML and 53+ security signals.',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '99',
      priceCurrency: 'USD',
      offerCount: 3,
    },
    featureList: [
      'AI-powered smart contract risk analysis',
      'XGBoost machine learning classification',
      'SHAP feature attribution explainability',
      '53 smart-contract feature extraction',
      'Honeypot pattern detection',
      'Access control risk analysis',
      'REST API and SDK integration',
      'Real-time contract analysis',
    ],
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    screenshot: `${SITE_URL}/og-image.png`,
    softwareVersion: '2.0',
    applicationSubCategory: 'Blockchain Security Tool',
  };
}

export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema(config: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: config.title,
    description: config.description,
    url: config.url,
    image: config.image || DEFAULT_IMAGE,
    datePublished: config.publishedTime,
    dateModified: config.modifiedTime || config.publishedTime,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/brand/light/Icon mark.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': config.url,
    },
  };
}

// Helper to set page title and meta tags (call in useEffect)
export function setPageSEO(config: SEOConfig, pagePath: string) {
  const canonical = config.canonical || `${SITE_URL}${pagePath}`;

  // Title
  document.title = config.title;

  // Meta tags
  setMeta('description', config.description);
  setMeta('keywords', config.keywords?.join(', ') || '');
  setMeta('robots', config.noindex ? 'noindex, nofollow' : 'index, follow');
  setMeta('author', config.author || SITE_NAME);

  // Canonical
  setLink('canonical', canonical);

  // Open Graph
  setMetaProperty('og:type', config.type || 'website');
  setMetaProperty('og:title', config.title);
  setMetaProperty('og:description', config.description);
  setMetaProperty('og:url', canonical);
  setMetaProperty('og:image', config.image || DEFAULT_IMAGE);
  setMetaProperty('og:site_name', SITE_NAME);
  setMetaProperty('og:locale', 'en_US');

  // Twitter
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', config.title);
  setMeta('twitter:description', config.description);
  setMeta('twitter:image', config.image || DEFAULT_IMAGE);
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}
