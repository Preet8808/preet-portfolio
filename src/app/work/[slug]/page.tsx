import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { projects, meta } from '@/data/data';
import { CaseStudyHero } from '@/components/CaseStudyHero';
import { Footer } from '@/components/Footer';

/** Pre-render one static page per project. */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    title: `${project.title} — ${meta.name}`,
    description: project.summary,
    openGraph: {
      title: `${project.title} — ${meta.name}`,
      description: project.summary,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  /* Split the tech list so the hero can show a subset and the body all. */
  const heroTech = project.tech.slice(0, 3);

  return (
    <>
      <main id="main">
        {/* ── Hero: shares the card's view-transition-name ── */}
        <CaseStudyHero project={project} heroTech={heroTech} />

        {/* ── Overview ── */}
        <section className="shell py-20">
          <div className="grid gap-12 lg:grid-cols-[0.35fr_1fr] lg:gap-20">
            <span className="label text-accent">Overview</span>
            <div>
              <p className="max-w-[52ch] text-[clamp(1.1rem,2.1vw,1.6rem)] leading-[1.5] text-ink">
                {project.summary}
              </p>
            </div>
          </div>
        </section>

        {/* ── Full-bleed image ── */}
        <section className="shell pb-20">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-white/10">
            <img
              src={project.hoverImage}
              alt={`${project.title} — detail`}
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        {/* ── Tech ── */}
        <section className="shell pb-20">
          <div className="grid gap-10 lg:grid-cols-[0.35fr_1fr] lg:gap-20">
            <span className="label text-accent">Built with</span>
            <ul className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Outcome ── */}
        <section className="border-y border-white/8 bg-base-raised">
          <div className="shell py-20">
            <div className="grid gap-12 lg:grid-cols-[0.35fr_1fr] lg:gap-20">
              <span className="label text-accent">Outcome</span>
              <div>
                <p className="max-w-[58ch] text-[clamp(1.05rem,1.8vw,1.35rem)] leading-[1.55] text-ink">
                  {project.outcome}
                </p>

                <div className="mt-10 flex flex-wrap gap-3">
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="label rounded-full border border-white/20 px-5 py-3 transition-colors hover:border-accent hover:text-accent"
                    >
                      Source →
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="label rounded-full border border-accent bg-accent px-5 py-3 text-base transition-colors hover:bg-transparent hover:text-accent"
                    >
                      Visit live site →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Next project ── */}
        <section className="shell py-20">
          <span className="label text-ink-3">Next project</span>
          <Link
            href={`/work/${next.slug}`}
            data-cursor="Next"
            className="group mt-6 flex flex-wrap items-end justify-between gap-6"
          >
            <span className="display text-[clamp(2rem,8vw,6rem)] transition-colors duration-300 group-hover:text-accent">
              {next.title}
            </span>
            <span className="label text-ink-3 transition-transform duration-300 group-hover:translate-x-2">
              {next.category} →
            </span>
          </Link>

          <Link
            href="/#work"
            data-cursor="Back"
            className="label mt-14 inline-block text-ink-3 transition-colors hover:text-accent"
          >
            ← All work
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}