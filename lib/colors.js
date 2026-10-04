// Generates a stable swatch for any color label entered through the admin API.
// Known reference colors keep their curated palette; new labels never become a
// generic grey dot or require a frontend code change.
export function generatedColor(label) {
  const text = String(label || "Original").trim();
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return {
    name: text.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    hex: `hsl(${hue} 42% 42%)`,
    border: `hsl(${hue} 48% 30%)`,
  };
}
