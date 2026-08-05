/**
 * Convert a video URL from any common platform into an embeddable form.
 * Supported: YouTube, Vimeo, Facebook, Instagram, TikTok, Dailymotion, direct video files.
 * Returns null when the platform is unknown (caller shows a plain link).
 */
export function toEmbedUrl(url: string): { type: "iframe" | "video"; src: string } | null {
  // YouTube (watch, shorts, youtu.be)
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt[1]}?rel=0` };

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  // Facebook (videos, watch, reels, share links, fb.watch) — the plugin accepts the full URL
  if (/(?:facebook\.com\/(?:.+\/videos\/|watch|reel\/|share\/[vr]\/)|fb\.watch\/)/i.test(url)) {
    return {
      type: "iframe",
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
    };
  }

  // Instagram (posts, reels, tv)
  const insta = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/);
  if (insta) return { type: "iframe", src: `https://www.instagram.com/p/${insta[1]}/embed` };

  // TikTok
  const tiktok = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (tiktok) return { type: "iframe", src: `https://www.tiktok.com/embed/v2/${tiktok[1]}` };

  // Dailymotion
  const dm = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/) || url.match(/dai\.ly\/([a-zA-Z0-9]+)/);
  if (dm) return { type: "iframe", src: `https://www.dailymotion.com/embed/video/${dm[1]}` };

  // Direct video files
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return { type: "video", src: url };

  return null;
}
