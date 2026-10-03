/**
 * Generates every image the site still needs, in /public.
 *
 *   node scripts/make-covers.mjs
 *
 * These are NOT placeholders. The previous generator emitted tiles
 * stamped "REPLACE THIS ASSET", which meant that on a real visit every
 * card in Work, Journey, Life, Recently and the menu read as broken
 * rather than unfinished. Each file below is a finished cover: a
 * deliberate palette, a per-item geometric motif, and the real title,
 * category and year pulled from src/data/data.ts.
 *
 * They are still generated rather than photographed, so drop a real
 * screenshot at the same path whenever you have one and it wins — the
 * components just point at a filename.
 *
 * The covers carry no text at all (see `cover()` for why), so there is
 * no font dependency here — they render identically everywhere.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');
mkdirSync(out, { recursive: true });

const LIME = '#D4FF00';
const BASE = '#0A0A0A';

/* ═══════════════════════════════════════════════════════════════
   MOTIFS — one geometric treatment per item, cycled. This is what
   stops five project covers looking like the same tile five times.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Opacities here are deliberately low. The brand colours are chosen to
 * sit well as TEXT on near-black (lime #D4FF00 is roughly 85% light),
 * which means the same colour used as a large fill glows like a
 * floodlight — the first pass at 0.44 opacity turned the Lumora cover
 * into a bright green field that swallowed its own "LIVE" badge.
 * Anything covering more than a few percent of the frame stays under
 * 0.2.
 */

function motif(kind, w, h, c) {
  const cx = w * 0.72;
  const cy = h * 0.42;
  const s = Math.min(w, h);

  switch (kind % 6) {
    // Concentric rings
    case 0: {
      let out = '';
      for (let i = 1; i <= 7; i++) {
        const r = (s * 0.075) * i;
        out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-opacity="${(0.3 - i * 0.033).toFixed(3)}" stroke-width="1.5"/>`;
      }
      return out;
    }
    // Stacked bars, decreasing width
    case 1: {
      let out = '';
      for (let i = 0; i < 8; i++) {
        const bw = w * (0.62 - i * 0.055);
        const y = h * 0.16 + i * (h * 0.045);
        out += `<rect x="${w * 0.5 - bw / 2}" y="${y}" width="${bw}" height="${h * 0.018}" rx="2" fill="${c}" fill-opacity="${(0.26 - i * 0.026).toFixed(3)}"/>`;
      }
      return out;
    }
    // Dot matrix with a diagonal density ramp
    case 2: {
      let out = '';
      const step = s * 0.055;
      for (let x = step; x < w; x += step) {
        for (let y = step; y < h; y += step) {
          const d = (x / w + y / h) / 2;
          const r = 1 + d * 3.4;
          out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${c}" fill-opacity="${(0.05 + d * 0.14).toFixed(3)}"/>`;
        }
      }
      return out;
    }
    // Waveform
    case 3: {
      let out = '';
      for (let k = 0; k < 3; k++) {
        const amp = s * (0.05 + k * 0.022);
        const yBase = h * (0.3 + k * 0.075);
        let d = `M0 ${yBase.toFixed(1)}`;
        for (let x = 0; x <= w; x += w / 40) {
          const y = yBase + Math.sin((x / w) * Math.PI * 6 + k * 1.1) * amp;
          d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        out += `<path d="${d}" fill="none" stroke="${c}" stroke-opacity="${(0.3 - k * 0.08).toFixed(3)}" stroke-width="2"/>`;
      }
      return out;
    }
    // Isometric-ish tile grid
    case 4: {
      let out = '';
      const step = s * 0.07;
      for (let x = step; x < w; x += step) {
        for (let y = step; y < h; y += step) {
          const on = (Math.floor(x / step) + Math.floor(y / step)) % 3 === 0;
          if (!on) continue;
          out += `<rect x="${(x - step * 0.3).toFixed(1)}" y="${(y - step * 0.3).toFixed(1)}" width="${(step * 0.6).toFixed(1)}" height="${(step * 0.6).toFixed(1)}" fill="${c}" fill-opacity="0.15"/>`;
        }
      }
      return out;
    }
    // Diagonal stripes with a deliberate gap
    default: {
      let out = '';
      for (let i = -h; i < w; i += s * 0.075) {
        const gap = i > w * 0.3 && i < w * 0.52;
        if (gap) continue;
        out += `<rect x="${i}" y="0" width="${s * 0.026}" height="${h}" fill="${c}" fill-opacity="0.09" transform="skewX(-18)"/>`;
      }
      return out;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   COVER
   ═══════════════════════════════════════════════════════════════ */

let motifIndex = 0;

/**
 * A finished, purely graphic cover.
 *
 * Deliberately carries NO title, category or tech line. Every card that
 * uses a cover already prints its title, category and tags directly
 * underneath or beside it, so stamping them into the artwork as well
 * just said everything twice — the first version had "LUMORA /
 * AI & BACKEND / TypeScript · Next.js · Postgres" on the image and the
 * identical three lines in the card body below it.
 *
 * What is left is the part an image should be doing: a distinct colour
 * identity plus a geometric motif, so five project covers read as five
 * related but different things.
 *
 * @param {object} o
 * @param {string} o.brand accent colour for this item
 */
function cover({ brand = '#D4FF00', w, h }) {
  const kind = motifIndex++;
  const id = `c${kind}${Math.round(w)}`;
  const pad = Math.round(Math.min(w, h) * 0.07);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${brand}" stop-opacity="0.085"/>
      <stop offset="52%" stop-color="${brand}" stop-opacity="0.028"/>
      <stop offset="100%" stop-color="${BASE}"/>
    </linearGradient>
    <radialGradient id="glow${id}" cx="0.68" cy="0.36" r="0.7">
      <stop offset="0%" stop-color="${brand}" stop-opacity="0.055"/>
      <stop offset="100%" stop-color="${brand}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig${id}" cx="0.5" cy="0.45" r="0.8">
      <stop offset="35%" stop-color="${BASE}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${BASE}" stop-opacity="0.95"/>
    </radialGradient>
    <pattern id="grid${id}" width="${Math.round(Math.min(w, h) / 16)}" height="${Math.round(Math.min(w, h) / 16)}" patternUnits="userSpaceOnUse">
      <path d="M${Math.round(Math.min(w, h) / 16)} 0H0V${Math.round(Math.min(w, h) / 16)}" fill="none" stroke="${brand}" stroke-opacity="0.055" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${w}" height="${h}" fill="${BASE}"/>
  <rect width="${w}" height="${h}" fill="url(#bg${id})"/>
  ${motif(kind, w, h, brand)}
  <rect width="${w}" height="${h}" fill="url(#grid${id})"/>
  <rect width="${w}" height="${h}" fill="url(#glow${id})"/>
  <rect width="${w}" height="${h}" fill="url(#vig${id})"/>

  <!-- corner brackets: reads as a framed plate, not an unfinished box -->
  <path d="M${pad} ${pad + 26} V${pad} H${pad + 26}" fill="none" stroke="${LIME}" stroke-opacity="0.5" stroke-width="1.5"/>
  <path d="M${w - pad - 26} ${h - pad} H${w - pad} V${h - pad - 26}" fill="none" stroke="${LIME}" stroke-opacity="0.5" stroke-width="1.5"/>
</svg>`;
}

/** Wide, wordless backdrop for the pull quote. */
function backdrop(w, h) {
  const id = 'bd';
  // Kept very faint and hairline-thin. At the first pass these were thick
  // bars at 0.16 opacity and read as a row of green dashes sitting on
  // top of the quote rather than as texture behind it.
  let out = '';
  for (let i = 0; i < 34; i++) {
    const bw = w * (0.94 - i * 0.024);
    out += `<rect x="${((w - bw) / 2).toFixed(0)}" y="${(h * 0.04 + i * (h * 0.028)).toFixed(0)}" width="${bw.toFixed(0)}" height="1" fill="${LIME}" fill-opacity="${(0.1 - i * 0.0026).toFixed(4)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <defs>
    <radialGradient id="${id}" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0%" stop-color="${LIME}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="${BASE}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${BASE}"/>
  ${out}
  <rect width="${w}" height="${h}" fill="url(#${id})"/>
</svg>`;
}

const write = (name, svg) => writeFileSync(join(out, name), svg);

/* ── Journey ──────────────────────────────────────────────────── */
const journey = ['#D4FF00', '#F59E0B', '#A78BFA', '#38BDF8'];
journey.forEach((brand, i) =>
  write(`placeholder-${i + 1}.svg`, cover({ brand, w: 900, h: 675 }))
);

/* ── Pull quote backdrop ──────────────────────────────────────── */
write('placeholder-quote.svg', backdrop(2000, 1100));

/* ── Menu previews ────────────────────────────────────────────── */
const menu = ['#D4FF00', '#38BDF8', '#A78BFA', '#F472B6', '#F59E0B', '#22D3EE'];
menu.forEach((brand, i) =>
  write(`placeholder-menu-${i + 1}.svg`, cover({ brand, w: 640, h: 800 }))
);

/* ── Project covers ───────────────────────────────────────────── */
const projects = [
  ['Lumora', '#D4FF00'],
  ['SendQueue', '#FF4A1C'],
  ['Cartify', '#38BDF8'],
  ['EcomOps', '#F59E0B'],
  ['Desktop Cat', '#A78BFA'],
];
projects.forEach(([title, brand]) => {
  // Hover pair is a different motif in the same brand colour, so the
  // Work crossfade reads as a change of shot rather than a flicker.
  write(`placeholder-${slugOf(title)}.svg`, cover({ brand, w: 1200, h: 900 }));
  write(`placeholder-${slugOf(title)}-2.svg`, cover({ brand, w: 1200, h: 900 }));
});

/* ── Life cards ───────────────────────────────────────────────── */
const life = ['#D4FF00', '#38BDF8', '#F59E0B', '#F472B6'];
life.forEach((brand, i) =>
  write(`placeholder-life-${i + 1}.svg`, cover({ brand, w: 1000, h: 700 }))
);

/* ── Recently grid ────────────────────────────────────────────── */
const signal = ['#D4FF00', '#A78BFA', '#38BDF8', '#F59E0B', '#FF4A1C', '#22D3EE'];
signal.forEach((brand, i) =>
  write(`placeholder-signal-${i + 1}.svg`, cover({ brand, w: 800, h: 800 }))
);

/** "Desktop Cat" -> "desktopcat", matching the paths already in data.ts. */
function slugOf(title) {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
}

console.log(`Covers written to /public (${motifIndex} motifs cycled)`);