/** 구글 등이 권장하는 의미 있는 lastmod용. 미설정이면 현재 시간(각 배포 시 갱신). */
export function sitemapLastModified(): Date {
  const iso = process.env.SITEMAP_LASTMOD_ISO?.trim();
  if (!iso) {
    return new Date();
  }

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return new Date();
  }
  return d;
}
