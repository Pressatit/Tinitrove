import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  path?: string;
}

const SafeHelmet = Helmet as any;

const SITE_URL = 'https://www.tinitrove.co.ke';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`; // Add a nice fallback image to your public folder

export function SEO({ title, description, image, path }: SEOProps) {
  const url = path ? `${SITE_URL}${path}` : SITE_URL;
  const ogImage = image || DEFAULT_IMAGE;
  const fullTitle = `${title}`;

  return (
    <SafeHelmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </SafeHelmet>
  );
}