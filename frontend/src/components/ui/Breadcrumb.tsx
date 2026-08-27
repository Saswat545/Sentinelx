import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://sentinelx.site/',
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        ...(item.href ? { item: `https://sentinelx.site${item.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <nav
        className={`pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className}`}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <li>
            <Link to="/" className="hover:text-[#6D001A] transition-colors">
              Home
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-gray-300">
                /
              </span>
              {item.href ? (
                <Link to={item.href} className="hover:text-[#6D001A] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#0a0a0a] font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
