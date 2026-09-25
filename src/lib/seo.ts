// src/lib/seo.ts
// One place for the brand's public facts and every JSON-LD builder. No path
// aliases or data imports, so node:test can load it directly.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aurexissolution.com').replace(
  /\/+$/,
  '',
);

export const BRAND = {
  name: 'Aurexis Solution',
  legalName: 'Aurexis Solution',
  ssmNumber: '202503293847 (NS0315281-P)',
  tagline: 'AI, Web & App Automation',
  description:
    'Aurexis Solution is a Malaysian studio that builds websites, admin automation, custom operations systems, WhatsApp lead systems and AI for small and medium businesses. Fixed prices, based in Kuala Lumpur.',
  email: 'admin@aurexissolution.com',
  phone: '+60164071129',
  sameAs: [
    'https://www.linkedin.com/company/aurexissolution/',
    'https://www.instagram.com/aurexissolution',
    'https://www.facebook.com/share/18aSc2n1dW/',
    'https://www.tiktok.com/@aurexissolution',
  ],
  founders: [
    { name: 'Sanjay Gunabalan', jobTitle: 'Founder & CEO' },
    { name: 'Nemila Raj Selvaraj', jobTitle: 'Co-founder & COO' },
  ],
  knowsAbout: [
    'Website design and development',
    'Business process automation',
    'Custom business software',
    'WhatsApp Business API',
    'AI agents and AI readiness',
    'LHDN e-Invoice',
    'PDPA compliance',
  ],
} as const;

export const orgId = `${SITE_URL}/#organization`;
const abs = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;

export type ParsedPrice = { amount: number; from: boolean; monthly: boolean };

// "From RM1,525" -> 1525 (from); "RM785/mo" -> 785 (monthly); "Quoted" -> null.
export function parsePrice(text: string): ParsedPrice | null {
  const m = /^(From\s+)?RM\s?([\d,]+)(\/mo)?$/i.exec(text.trim());
  if (!m) return null;
  return { amount: Number(m[2].replace(/,/g, '')), from: Boolean(m[1]), monthly: Boolean(m[3]) };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': orgId,
        name: BRAND.name,
        legalName: BRAND.legalName,
        alternateName: ['Aurexis', 'Aurexis Solutions', 'AUREXIS SOLUTION'],
        identifier: {
          '@type': 'PropertyValue',
          propertyID: 'SSM registration number',
          value: BRAND.ssmNumber,
        },
        slogan: BRAND.tagline,
        description: BRAND.description,
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png`, width: 512, height: 512 },
        image: `${SITE_URL}/opengraph-image.png`,
        email: BRAND.email,
        telephone: BRAND.phone,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kuala Lumpur',
          addressCountry: 'MY',
        },
        areaServed: { '@type': 'Country', name: 'Malaysia' },
        priceRange: 'RM1,525 and up',
        knowsAbout: BRAND.knowsAbout,
        sameAs: BRAND.sameAs,
        founder: BRAND.founders.map((f) => ({
          '@type': 'Person',
          name: f.name,
          jobTitle: f.jobTitle,
          worksFor: { '@id': orgId },
        })),
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: BRAND.email,
          telephone: BRAND.phone,
          areaServed: 'MY',
          availableLanguage: ['English', 'Malay'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: BRAND.name,
        url: SITE_URL,
        inLanguage: 'en-MY',
        publisher: { '@id': orgId },
      },
    ],
  };
}

export function serviceJsonLd(o: {
  slug: string;
  name: string;
  description: string;
  tiers: { name: string; price: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/solutions/${o.slug}#service`,
    name: `${o.name} by ${BRAND.name}`,
    description: o.description,
    url: `${SITE_URL}/solutions/${o.slug}`,
    provider: { '@id': orgId },
    areaServed: { '@type': 'Country', name: 'Malaysia' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${o.name} packages`,
      itemListElement: o.tiers.map((t) => {
        const p = parsePrice(t.price);
        return {
          '@type': 'Offer',
          name: t.name,
          priceCurrency: 'MYR',
          itemOffered: { '@type': 'Service', name: t.name },
          ...(p && {
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'MYR',
              ...(p.from ? { minPrice: p.amount } : { price: p.amount }),
              ...(p.monthly && { unitText: 'MONTH' }),
            },
          }),
        };
      }),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function faqJsonLd(items: ReadonlyArray<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
