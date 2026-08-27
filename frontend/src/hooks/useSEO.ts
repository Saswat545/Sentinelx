import { useEffect } from 'react';
import { setPageSEO, type SEOConfig } from '../lib/seo';

/**
 * Hook to set page-level SEO metadata.
 * Call at the top of each page component.
 *
 * @example
 * useSEO({
 *   title: 'My Page | SentinelX',
 *   description: 'Page description for search engines',
 *   canonical: '/my-page',
 *   keywords: ['keyword1', 'keyword2'],
 * });
 */
export function useSEO(config: SEOConfig, path: string) {
  useEffect(() => {
    setPageSEO(config, path);

    // Cleanup: restore defaults on unmount
    return () => {
      setPageSEO(
        {
          title: 'SentinelX | AI-Powered Crypto Security & Rug Pull Detection',
          description:
            'SentinelX analyzes Ethereum smart contracts using XGBoost ML and 53+ security signals to detect rug pulls, honeypots, and hidden backdoors.',
          type: 'website',
        },
        '/'
      );
    };
  }, []); // Only run on mount
}
