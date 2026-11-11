export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return siteUrl ? siteUrl.replace(/\/$/, "") : "http://localhost:3000";
}
