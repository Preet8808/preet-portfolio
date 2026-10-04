/**
 * ═══════════════════════════════════════════════════════════════
 *  CONTENT — the only file you need to edit.
 *
 *  Every string, project, link and image reference lives here.
 *  Components read from this and never hardcode copy.
 *
 *  Anything marked `PLACEHOLDER` is a stand-in — swap it for your own
 *  asset and delete the comment.
 * ═══════════════════════════════════════════════════════════════
 */

export const meta = {
  name: 'Preet Panaviya',
  role: 'AI & Systems Engineer',
  location: 'Mumbai, India',
  year: 'Portfolio 2026',
  email: 'p.panaviya@gmail.com',
  phone: '+91 99874 37856',
  description:
    'Preet Panaviya — third-year Computer Engineering student at VIT Mumbai. Building LLM pipelines, backend systems and infrastructure that survives contact with real data.',
  status: 'Available for work',
  links: {
    github: 'https://github.com/Preet8808',
    linkedin: 'https://linkedin.com/in/preet-panaviya',
  },
};

/** Full name, split so the portrait can sit between the lines. */
export const name = {
  first: 'Preet',
  last: 'Panaviya',
};

/* ── Chapters — drives the header nav and the dot rail ─────────────
   These ids MUST all exist as `section[id]`, and the `num` MUST match
   the chapter eyebrow printed by the section itself.

   This list used to carry a phantom `{ id: 'craft', num: '04' }` for a
   section that was never built. Three things broke at once: the dot rail
   had a dead entry, the header nav linked to "#craft" which scrolled
   nowhere, and every number after it was off by one against the
   eyebrows on the page (which read 03 Work, 04 Life, 05 Skills,
   06 What's up, 07 Contact). Removed, and the rest renumbered to match
   what is actually rendered.

   Adding a chapter means adding the section AND its eyebrow number. */
export const chapters = [
  { id: 'intro', num: '01', label: 'Intro' },
  { id: 'journey', num: '02', label: 'Journey' },
  { id: 'work', num: '03', label: 'Work' },
  { id: 'life', num: '04', label: 'Life' },
  { id: 'skills', num: '05', label: 'Skills' },
  { id: 'signal', num: '06', label: "What's up" },
  { id: 'contact', num: '07', label: 'Contact' },
];

/* ── Hero ─────────────────────────────────────────────────────── */
export const hero = {
  cornerLabels: [
    { pos: 'top-left', text: meta.role },
    { pos: 'top-right', text: meta.location },
    { pos: 'bottom-left', text: meta.year },
  ],
  scrollHint: 'Scroll to explore',
  /**
   * PLACEHOLDER — drop a transparent-background cut-out portrait at
   * /portrait.png and it will layer between the two name lines.
   * A silhouette stands in until you do.
   */
  portrait: '/portrait.png',
  subline:
    'I build the layer nobody screenshots — the retrieval, the schema, the failure handling.',
};

/* ── Intro chapter ────────────────────────────────────────────── */
export const intro = {
  eyebrow: '01 — Intro',
  headline: 'A system either holds or it does not.',
  /**
   * Scroll-scrubbed: words brighten as the section pins. Keep the
   * `data-em` marker on the words you want lit in the accent colour.
   */
  bio: 'Third-year Computer Engineering student at <data-em>VIT Mumbai</data-em>, graduating 2028. I work mostly in Python and TypeScript — on the parts of a system that decide whether it still works in the <data-em>sixth week</data-em> rather than the first.',
  stats: [
    { value: 6, suffix: '', label: 'Public repositories', dp: 0 },
    { value: 2, suffix: '', label: 'Apps deployed live', dp: 0 },
    { value: 5, suffix: '', label: 'Stack domains shipped', dp: 0 },
    { value: 9.27, suffix: '', label: 'Current CGPA', dp: 2 },
  ],
  /** Leclerc-style general-info card */
  info: [
    { k: 'Based in', v: 'Mumbai, India' },
    { k: 'Studying', v: 'B.E. Computer Engineering · VIT Mumbai' },
    { k: 'Graduating', v: '2028' },
    { k: 'Focus', v: 'AI pipelines · Backend · Infrastructure' },
  ],
};

/* ── Journey timeline ─────────────────────────────────────────── */
/* PLACEHOLDER images — replace /placeholder-1.svg etc. */
export const journey = [
  {
    year: '2026',
    title: 'Independent builds',
    text: 'Shipped Lumora and SendQueue — a read-later inbox and an email dispatch engine, both public.',
    image: '/placeholder-1.svg',
  },
  {
    year: '2026',
    title: 'DevOps capstone',
    text: 'EcomOps — Flask microservices on Docker and Kubernetes, monitored with Prometheus and Grafana.',
    image: '/placeholder-2.svg',
  },
  {
    year: '2026',
    title: 'Systems side project',
    text: 'Desktop Cat — a Tauri + Rust desktop pet that traces your keystrokes and solves inverse kinematics. Released as a Windows binary.',
    image: '/placeholder-3.svg',
  },
  {
    year: '2024',
    title: 'Started at VIT',
    text: 'Began the Computer Engineering degree. Went straight into systems and algorithms.',
    image: '/placeholder-4.svg',
  },
];

export const pullQuote = {
  text: 'A small working system beats three beautiful drafts.',
  attribution: 'Principle 05',
};

/* ── Selected work ────────────────────────────────────────────── */
export type Project = {
  slug: string;
  title: string;
  year: string;
  category: string;
  summary: string;
  /** Short one-liner used on the case-study hero */
  kicker?: string;
  /** Hex used for the card gradient on hover */
  brand: string;
  /** PLACEHOLDER — swap for your own cover / hover images */
  image: string;
  hoverImage: string;
  tech: string[];
  repo: string | null;
  live: string | null;
  outcome: string;
};

export const projects: Project[] = [
  {
    slug: 'lumora',
    title: 'Lumora',
    year: '2026',
    category: 'AI & Backend',
    summary: 'A second-brain inbox for the internet. Saves any URL, extracts per-domain metadata, tracks what you consumed.',
    brand: '#D4FF00',
    image: '/placeholder-lumora.svg',
    hoverImage: '/placeholder-lumora-2.svg',
    tech: ['TypeScript', 'Next.js 16', 'PostgreSQL', 'Neon'],
    repo: 'https://github.com/Preet8808/Lumora',
    live: 'https://savewithlumora.vercel.app',
    outcome:
      'Shipped and publicly hosted. The interesting part is the SSRF shield — it rejects loopback, link-local and private ranges before any fetch, which is the piece most bookmarking tools skip.',
  },
  {
    slug: 'sendqueue',
    title: 'SendQueue',
    year: '2026',
    category: 'Backend',
    summary: 'A deliverability-first email dispatch engine with a token-bucket rate limiter and provider adapters.',
    brand: '#FF4A1C',
    image: '/placeholder-sendqueue.svg',
    hoverImage: '/placeholder-sendqueue-2.svg',
    tech: ['Node.js', 'Express', 'SQLite (WAL)'],
    repo: 'https://github.com/Preet8808/SendQueue',
    live: null,
    outcome:
      'In development. An interrupted queue resumes on restart with no duplicate sends — verified by the state machine rather than by hope.',
  },
  {
    slug: 'cartify',
    title: 'Cartify',
    year: '2026',
    category: 'Full-Stack',
    summary: 'E-commerce foundation with a strictly layered API and an interaction schema built for a recommender.',
    brand: '#38BDF8',
    image: '/placeholder-cartify.svg',
    hoverImage: '/placeholder-cartify-2.svg',
    tech: ['React', 'Vite', 'Tailwind', 'Express', 'PostgreSQL'],
    repo: 'https://github.com/Sainath-2030/Cartify',
    live: 'https://cartifyaipowered.vercel.app',
    outcome: 'Co-built with another developer. Section one of a larger platform — auth and foundation only, no catalogue yet.',
  },
  {
    slug: 'ecomops',
    title: 'EcomOps',
    year: '2026',
    category: 'Infrastructure',
    summary: 'Flask microservices on Docker and Kubernetes, with Prometheus scraping into Grafana.',
    brand: '#F59E0B',
    image: '/placeholder-ecomops.svg',
    hoverImage: '/placeholder-ecomops-2.svg',
    tech: ['Python', 'Flask', 'MongoDB', 'Docker', 'Kubernetes', 'Grafana'],
    repo: 'https://github.com/Preet8808/LifeIsHelm',
    live: null,
    outcome: 'DevOps capstone. CI pipeline builds images and deploys to Minikube with replicas and health checks.',
  },
  {
    slug: 'desktop-cat',
    title: 'Desktop Cat',
    year: '2026',
    category: 'Systems',
    summary: 'A transparent desktop pet that tracks your real keystrokes and puts its paw on the exact key.',
    brand: '#A78BFA',
    image: '/placeholder-desktopcat.svg',
    hoverImage: '/placeholder-desktopcat-2.svg',
    tech: ['TypeScript', 'Rust', 'Tauri', 'PixiJS'],
    repo: 'https://github.com/Preet8808/desktop-cat',
    live: null,
    outcome:
      'Released as a versioned Windows installer and portable binary via GitHub Actions. Inverse kinematics drives the paw to the precise key position.',
  },
];

/* ── Life as a developer ──────────────────────────────────────── */
/* Leclerc's "Life as a driver" reinterpreted. */
export const lifeCards = [
  {
    id: 'learning',
    title: 'Learning',
    kicker: 'How I take it in',
    text: 'Coursework first, then something that breaks so I learn why. Theory is cheap without an error message.',
    image: '/placeholder-life-1.svg',
  },
  {
    id: 'process',
    title: 'Process',
    kicker: 'How I build',
    text: 'Model the data before the interface. Schema, then routes, then pixels. If the shape is wrong, nothing downstream saves it.',
    image: '/placeholder-life-2.svg',
  },
  {
    id: 'shipping',
    title: 'Shipping',
    kicker: 'How it leaves my hands',
    text: 'Deployed, linked and public. An unreleased repository proves nothing, so both of the live apps stayed up.',
    image: '/placeholder-life-3.svg',
  },
  {
    id: 'offduty',
    title: 'Off-duty',
    kicker: 'What I do for fun',
    text: 'Desktop Cat. Reverse kinematics, global input hooks and a pixel cat, released as a Windows binary for no reason at all.',
    image: '/placeholder-life-4.svg',
  },
];

/* ── Skills marquee ───────────────────────────────────────────── */
export const marqueeRows = [
  { speed: 1, items: ['Python', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'Kubernetes'] },
  { speed: -1, items: ['LLM Pipelines', 'Graph Q&A', 'MongoDB', 'Tailwind', 'GitHub Actions', 'Rust', 'Next.js'] },
];

/* ── Skills grid ──────────────────────────────────────────────── */
export const skillGroups = [
  /* SQL moved here from Languages. It was sitting beside Python and Rust
     while the databases it queries sat two rows down, so the split read
     as a mistake. It belongs with what it acts on.

     Java, C and C++ were missing entirely, despite being on the resume's
     own skills line and evidenced by the NPTEL Programming in Java
     certification plus a Java library-management project. */
  { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Rust', 'Java', 'C / C++', 'HTML/CSS'] },
  { group: 'Backend', items: ['Node.js + Express', 'REST design', 'JWT auth', 'Flask', 'Django', 'Layered APIs'] },
  { group: 'Frontend', items: ['Next.js 16', 'React + Vite', 'Tailwind CSS', 'PixiJS', 'Framer Motion'] },
  { group: 'Data', items: ['SQL', 'PostgreSQL', 'MongoDB', 'SQLite (WAL)', 'Schema modelling'] },
  { group: 'Infrastructure', items: ['Docker', 'Kubernetes', 'Prometheus', 'Grafana', 'GitHub Actions'] },
  { group: 'AI & LLM', items: ['Prompt engineering', 'Document extraction', 'Grounded Q&A', 'LangChain', 'NLP'] },
];

/* ── Signal / what's up ───────────────────────────────────────── */
/* PLACEHOLDER — swap for your own images or social cards. */
export const signal = [
  { id: 's1', title: 'Lumora shipped', meta: 'Sept 2026', image: '/placeholder-signal-1.svg', href: 'https://savewithlumora.vercel.app' },
  { id: 's2', title: 'Desktop Cat v1.1.1', meta: 'Oct 2026', image: '/placeholder-signal-2.svg', href: 'https://github.com/Preet8808/desktop-cat' },
  { id: 's3', title: 'Cartify section one', meta: 'Sept 2026', image: '/placeholder-signal-3.svg', href: 'https://cartifyaipowered.vercel.app' },
  { id: 's4', title: 'EcomOps capstone', meta: 'Jun 2026', image: '/placeholder-signal-4.svg', href: 'https://github.com/Preet8808/LifeIsHelm' },
  { id: 's5', title: 'SendQueue rebuild', meta: 'In progress', image: '/placeholder-signal-5.svg', href: 'https://github.com/Preet8808/SendQueue' },
  { id: 's6', title: 'Writing about RAG', meta: 'Draft', image: '/placeholder-signal-6.svg', href: '#' },
];

/* ── Contact ──────────────────────────────────────────────────── */
export const contact = {
  headline: ["Let's build", 'something fast.'],
  links: [
    { label: meta.email, hint: 'Email', href: `mailto:${meta.email}` },
    { label: 'GitHub', hint: '6 repos', href: meta.links.github },
    { label: 'LinkedIn', hint: 'Profile', href: meta.links.linkedin },
    { label: meta.phone, hint: 'Call', href: 'tel:+919987437856' },
  ],
  socials: [
    { label: 'GitHub', href: meta.links.github },
    { label: 'LinkedIn', href: meta.links.linkedin },
    { label: 'Email', href: `mailto:${meta.email}` },
  ],
};

/* ── Full-screen menu ─────────────────────────────────────────── */
/* Preview art is generated by scripts/make-covers.mjs. Each entry must
   point at a DIFFERENT file — removing the Craft row left Skills and
   "What's up" both on menu-5, so two menu items showed the same
   picture. menu-3 is the slot freed up by dropping Craft. */
export const menuLinks = [
  { label: 'Work', href: '#work', image: '/placeholder-menu-1.svg' },
  { label: 'Journey', href: '#journey', image: '/placeholder-menu-2.svg' },
  { label: 'Skills', href: '#skills', image: '/placeholder-menu-3.svg' },
  { label: 'Life', href: '#life', image: '/placeholder-menu-4.svg' },
  { label: "What's up", href: '#signal', image: '/placeholder-menu-5.svg' },
  { label: 'Contact', href: '#contact', image: '/placeholder-menu-6.svg' },
];

/* ── Footer physics tags ──────────────────────────────────────── */
export const floatTags = [
  'Python',
  'Docker',
  'Rust',
  'PostgreSQL',
  'LLM',
  'Kubernetes',
  'TypeScript',
  'MongoDB',
  'Next.js',
  'GitHub Actions',
];