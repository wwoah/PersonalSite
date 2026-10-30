import { useEffect, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, reduceMotion } from "../../anim/gsap";
import SmoothScroll from "../../components/SmoothScroll";
import Decode from "../../components/Decode";
import Art from "../../components/Art";
import PageBar from "../../components/PageBar";
import PageOutro from "../../components/PageOutro";
import Carousel from "../../components/Carousel";
import WorkInProgress from "../../components/WorkInProgress";
import TransitionLink from "../../components/transition/TransitionLink";
import { rich } from "../../components/rich";
import { skillPath } from "../../routes";
import { PROFILE, SKILL_PAGE, SKILLS, getSkill, hasSkillPage } from "../../content";
import type { Highlight, Skill } from "../../content";
import contours from "../../assets/contours-hero.svg?raw";
import "./Skills.css";

/* ──────────────────────────────────────────────────────────────────
   SKILL — one skill from the front page, and the work behind it.

   A tile on the front page says what I do; this page shows it, with a
   handful of real highlights told from that skill's side. Below them
   sits every other skill, grouped as on the front page, so a visitor
   can wander from one to the next without going back.

   Same motion vocabulary as the rest of the site: the contour map
   draws in behind the hero, and the copy and each highlight decode as
   they come into view.
   ────────────────────────────────────────────────────────────────── */

const num = (i: number) => String(i + 1).padStart(2, "0");
/** The subject line of every email started from a skill's page. */
const subject = (skill: Skill) => `About: ${skill.title}`;

/* ──────────────────────────────────────────────────────────────────
   HERO — the tile, at full size
   ────────────────────────────────────────────────────────────────── */
function Hero({ skill }: { skill: Skill }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion()) return;
      gsap.from(".skill-hero__lines path", {
        drawSVG: "50% 50%",
        duration: 2.8,
        ease: "depth",
        stagger: { each: 0.018, from: "random" },
        delay: 0.1,
      });
      gsap.from(".skill-hero__glow", { opacity: 0, scale: 0.6, duration: 2.4, ease: "depth" });
    },
    { scope: root }
  );

  return (
    <header ref={root} className="skill-hero">
      <div className="skill-hero__bg" aria-hidden="true">
        <div className="skill-hero__glow" />
        <div className="skill-hero__map" data-speed="0.75">
          <div className="skill-hero__lines" dangerouslySetInnerHTML={{ __html: contours }} />
        </div>
      </div>

      <Decode immediate speed={1} className="skill-hero__inner">
        <div className="skill-hero__copy">
          <p className="eyebrow skill-hero__crumbs">
            <TransitionLink to="/" label="Portfolio">
              Portfolio
            </TransitionLink>
            <span aria-hidden="true">/</span>
            <TransitionLink to="/#capabilities" label="Skills">
              Skills
            </TransitionLink>
          </p>
          <p className="eyebrow skill-hero__group">
            <span className="skill-hero__num">{skill.num}</span>
            {skill.group}
          </p>
          <h1 className="skill-hero__title">{skill.title}</h1>
          <p className="skill-hero__lead">{skill.desc}</p>
          <ul className="skill-hero__tools" aria-label="Tools">
            {skill.tools.map((t) => (
              <li key={t} className="chip" data-ascii="fade">
                {t}
              </li>
            ))}
          </ul>
        </div>

        <figure className="skill-hero__figure" data-ascii="surface">
          <Art src={skill.image} alt="" width={640} height={420} fetchPriority="high" />
        </figure>
      </Decode>
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────────
   HIGHLIGHTS — one card each: the story on one side, what I did on
   the other, and a screenshot ahead of both when there is one.
   ────────────────────────────────────────────────────────────────── */
function Highlights({ skill }: { skill: Skill }) {
  const count = skill.highlights.length;
  const list = count > 0 && (
    <ol className="highlights__list">
      {skill.highlights.map((h, i) => (
        <HighlightCard key={h.title} highlight={h} index={i} />
      ))}
    </ol>
  );

  /* In progress: the panel goes over whatever highlights there are so
     far, or over placeholders when there are none yet. */
  let body = list || <EmptyNotice skill={skill} />;
  if (skill.inProgress) body = <WorkInProgress subject={subject(skill)}>{list || undefined}</WorkInProgress>;

  return (
    <section className="highlights" aria-labelledby="highlights-title">
      <Decode className="highlights__head" origin="top-left">
        <p className="eyebrow">
          {skill.inProgress ? "In progress" : `${count} ${count === 1 ? "highlight" : "highlights"}`}
        </p>
        <h2 id="highlights-title" className="highlights__title">
          {rich(SKILL_PAGE.highlightsTitle)}
        </h2>
      </Decode>

      {body}
    </section>
  );
}

function HighlightCard({ highlight: h, index }: { highlight: Highlight; index: number }) {
  const specs = h.specs && h.specs.length > 0 && (
    <dl className="highlight__specs">
      {h.specs.map((s) => (
        <div key={s.label}>
          <dt>{s.label}</dt>
          <dd>{s.value}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <Decode
      as="li"
      className={h.images ? "highlight highlight--media" : "highlight"}
      data-ascii="surface"
      origin="top-left"
    >
      {/* An empty list still gets the frame: the photos are on their way.
          With a picture, the spec sheet sits under it, beside the words. */}
      {h.images && (
        <div className="highlight__visual">
          <div className="highlight__media">
            <Carousel images={h.images} label={h.title} />
          </div>
          {specs}
        </div>
      )}

      <div className="highlight__story">
        <p className="highlight__meta">
          <span className="highlight__num">{num(index)}</span>
          {h.context}
        </p>
        <h3 className="highlight__title">{h.title}</h3>
        <p className="highlight__summary">{h.summary}</p>
        {!h.images && specs}
        {h.links && h.links.length > 0 && (
          <div className="highlight__links">
            {h.links.map((l, i) => (
              <a
                key={l.href + l.label}
                className={i === 0 ? "btn btn--small" : "btn btn--small btn--ghost"}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                data-ascii="fade"
              >
                {l.label} <span className="btn__arrow">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="highlight__detail">
        <h4 className="eyebrow highlight__subhead">What I did</h4>
        <ul className="highlight__points">
          {h.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <ul className="highlight__tags" aria-label="Built with">
          {h.tags.map((t) => (
            <li key={t} className="chip" data-ascii="fade">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Decode>
  );
}

/* Only ever seen in development: on the live site, a skill with no
   highlights has no page and its tile doesn't link. */
function EmptyNotice({ skill }: { skill: Skill }) {
  return (
    <div className="highlights__empty">
      <p className="eyebrow">Only shown in development</p>
      <p>
        No highlights yet. Add some under <code>"{skill.id}"</code> in <code>HIGHLIGHTS</code> in
        src/content.ts. Until then, this page and the link to it stay off the live site.
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   EXPLORE — the next and previous skill, then all of them, grouped
   as on the front page.
   ────────────────────────────────────────────────────────────────── */
function Explore({ skill }: { skill: Skill }) {
  const withPages = SKILLS.filter(hasSkillPage);
  const at = withPages.findIndex((s) => s.id === skill.id);
  const prev = withPages[at - 1];
  const next = withPages[at + 1];
  const groups = [...new Set(SKILLS.map((s) => s.group))];

  return (
    <section className="explore" data-theme="ink" aria-labelledby="explore-title">
      <div className="explore__inner">
        <Decode className="explore__head" origin="top-left">
          <h2 id="explore-title" className="explore__title">
            {rich(SKILL_PAGE.exploreTitle)}
          </h2>
          <p className="explore__intro">{SKILL_PAGE.exploreIntro}</p>
        </Decode>

        {(prev || next) && (
          <Decode as="nav" className="pager" aria-label="Previous and next skill">
            {prev && <PagerLink skill={prev} dir="prev" />}
            {next && <PagerLink skill={next} dir="next" />}
          </Decode>
        )}

        <nav className="skill-index" aria-label="All skills">
          {groups.map((group, g) => (
            <Decode key={group} className="skill-index__group" origin="top-left" delay={g * 0.08}>
              <h3 className="eyebrow skill-index__label">{group}</h3>
              <ol className="skill-index__list">
                {SKILLS.filter((s) => s.group === group).map((s) => (
                  <li key={s.id}>
                    <IndexItem skill={s} current={s.id === skill.id} />
                  </li>
                ))}
              </ol>
            </Decode>
          ))}
        </nav>
      </div>
    </section>
  );
}

function PagerLink({ skill, dir }: { skill: Skill; dir: "prev" | "next" }) {
  return (
    <TransitionLink
      to={skillPath(skill.id)}
      label={skill.title}
      className={`pager__link pager__link--${dir}`}
      data-ascii="surface"
    >
      <span className="pager__dir">
        {dir === "prev" && <span aria-hidden="true">← </span>}
        {dir === "prev" ? "Previous" : "Next"}
        {dir === "next" && <span aria-hidden="true"> →</span>}
      </span>
      <span className="pager__title">{skill.title}</span>
      <span className="pager__group">
        {skill.num} · {skill.group}
      </span>
    </TransitionLink>
  );
}

/* The current skill is marked rather than linked, and one with no page
   yet is listed but not linked, so the index still shows the full range. */
function IndexItem({ skill, current }: { skill: Skill; current: boolean }) {
  const count = skill.highlights.length;
  const body = (
    <>
      <span className="skill-index__num">{skill.num}</span>
      <span className="skill-index__title">{skill.title}</span>
      {skill.inProgress ? (
        <span className="skill-index__count skill-index__count--wip">
          WIP<span className="sr-only">: examples in progress</span>
        </span>
      ) : (
        count > 0 && (
          <span className="skill-index__count">
            {count}
            <span className="sr-only"> {count === 1 ? "example" : "examples"}</span>
          </span>
        )
      )}
    </>
  );

  if (current) {
    return (
      <span className="skill-index__item" aria-current="page">
        {body}
      </span>
    );
  }
  if (!hasSkillPage(skill)) {
    return <span className="skill-index__item skill-index__item--plain">{body}</span>;
  }
  return (
    <TransitionLink to={skillPath(skill.id)} label={skill.title} className="skill-index__item">
      {body}
    </TransitionLink>
  );
}

/* ──────────────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────────────── */
function SkillPage({ skill }: { skill: Skill }) {
  const root = useRef<HTMLDivElement>(null);
  /* Both ways back land on this skill's tile, not the top of the page. */
  const back = `/#${skill.id}`;

  useEffect(() => {
    const previous = document.title;
    document.title = `${skill.title} · ${PROFILE.name}`;
    return () => {
      document.title = previous;
    };
  }, [skill]);

  useGSAP(
    () => {
      /* Fonts change every measurement on the page; once they're in,
         re-measure. */
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      if (reduceMotion()) return;
      gsap.from(".page-bar", { yPercent: -120, duration: 1.1, ease: "settle", delay: 0.5 });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="skill-page">
      <PageBar back={{ to: back, label: "Skills" }} subject={subject(skill)} />

      <SmoothScroll>
        <main className="skill" data-theme="paper">
          <Hero skill={skill} />
          <Highlights skill={skill} />
          <Explore skill={skill} />
          <PageOutro
            title={SKILL_PAGE.outroTitle}
            intro={SKILL_PAGE.outroIntro}
            subject={subject(skill)}
            back={back}
          />
        </main>
      </SmoothScroll>
    </div>
  );
}

/* ── /skills/:id ────────────────────────────────────────────────── */
function SkillRoute() {
  const { id = "" } = useParams();
  const skill = getSkill(id);
  if (!skill || !hasSkillPage(skill)) return <Navigate to="/#capabilities" replace />;

  /* Keyed by skill, so going from one skill to the next mounts a fresh
     page: every reveal plays again and the scroll starts at the top. */
  return <SkillPage key={skill.id} skill={skill} />;
}

export default SkillRoute;
