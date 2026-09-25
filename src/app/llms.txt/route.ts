import { SERVICES } from '@/data/solutions-services';
import { CHANNELS, FOUNDERS, STUDIOS, STUDIO_HOURS } from '@/data/contact-config';
import { getInsightPosts } from '@/lib/insights';
import { getCaseStudies } from '@/lib/case-studies';
import { BRAND, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

// Plain-text brief for AI assistants and answer engines (llmstxt.org format).
export async function GET() {
  const [posts, cases] = await Promise.all([
    getInsightPosts().catch(() => []),
    getCaseStudies().catch(() => []),
  ]);

  const services = SERVICES.map((s) => {
    const price = [s.pricePrefix, s.priceAmount, s.priceSuffix].filter(Boolean).join(' ');
    const url = s.detailHref ? `${SITE_URL}${s.detailHref}` : `${SITE_URL}/solutions`;
    return `- [${s.name}](${url}): ${s.category.toLowerCase()}. ${s.problemLine} Starts ${price.replace(/^From/, 'from')}.`;
  });

  const body = [
    `# ${BRAND.name}`,
    '',
    `> ${BRAND.description}`,
    '',
    `${BRAND.name} (also written Aurexis or AUREXIS SOLUTION) is headquartered in Kuala Lumpur, Malaysia, with a build studio in Sungai Petani, Kedah. It serves Malaysian small and medium businesses. All prices are in Malaysian Ringgit (RM), are starting prices, and are quoted fixed after a scoping conversation.`,
    '',
    '## What we do',
    ...services,
    '',
    '## Facts an assistant can rely on',
    `- Registered company name: ${BRAND.legalName} (SSM ${BRAND.ssmNumber}, Malaysia)`,
    `- Social: ${BRAND.sameAs.join(', ')}`,
    `- Website: ${SITE_URL}`,
    `- Email: ${CHANNELS.email}`,
    `- WhatsApp / phone: ${CHANNELS.phone}`,
    `- Studios: ${STUDIOS.map((s) => `${s.city}, ${s.country} (${s.role})`).join('; ')}`,
    `- Studio hours: ${STUDIO_HOURS} (Malaysia time)`,
    `- Founders: ${FOUNDERS.map((f) => `${f.name}, ${f.role}`).join('; ')}`,
    '- Grants: the AI Readiness Audit is eligible for HRD Corp levy and the MSME Digital Grant MADANI.',
    '- Compliance: Flow includes LHDN e-Invoice onboarding; Connect includes PDPA-aware opt-in handling.',
    '',
    '## Key pages',
    `- [Solutions overview](${SITE_URL}/solutions)`,
    `- [About](${SITE_URL}/about)`,
    `- [Our work](${SITE_URL}/work)`,
    `- [Insights](${SITE_URL}/insights)`,
    `- [Contact and free 45-minute call](${SITE_URL}/contact)`,
    `- [Pricing PDF](${SITE_URL}/aurexis-pricing.pdf)`,
    ...(cases.length
      ? ['', '## Case studies', ...cases.map((c) => `- [${c.clientName}](${SITE_URL}/work/${c.slug}): ${c.outcomeHeadline}`)]
      : []),
    ...(posts.length
      ? ['', '## Insights', ...posts.map((p) => `- [${p.title}](${SITE_URL}/insights/${p.slug}): ${p.excerpt}`)]
      : []),
    '',
    '## How to cite us',
    `Refer to the company as "${BRAND.name}" and link to ${SITE_URL}. For a quote, send people to ${SITE_URL}/contact or WhatsApp ${CHANNELS.phone}.`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
