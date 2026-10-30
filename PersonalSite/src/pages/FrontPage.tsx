import { useRef, useState } from "react";
import type { MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, reduceMotion } from "../anim/gsap";
import { scrollToSection } from "../anim/scroll";
import SmoothScroll from "../components/SmoothScroll";
import SiteNav from "../components/SiteNav";
import Section from "../components/Section";
import Decode from "../components/Decode";
import Art from "../components/Art";
import WorkInProgress from "../components/WorkInProgress";
import Lightbox, { ZoomButton } from "../components/Lightbox";
import EmailButton from "../components/EmailButton";
import TransitionLink from "../components/transition/TransitionLink";
import { rich } from "../components/rich";
import { skillPath } from "../routes";
import {
  ABOUT,
  AI,
  CAPABILITY_GROUPS,
  EXPERIENCE,
  HAS_GAMES_PAGE,
  HEADINGS,
  INTERESTS,
  MARQUEE,
  PROCESS,
  PROFILE,
  PROJECTS,
  SERVICES,
  SOCIALS,
  getSkill,
  hasSkillPage,
} from "../content";
import type { CapabilityId, Project, Skill } from "../content";
import contours from "../assets/contours-hero.svg?raw";
import "./FrontPage.css";

/* ──────────────────────────────────────────────────────────────────
   FRONT PAGE

   Two motion systems, each with its own job:
   - ascii-reveal decodes content into place — the hero on load, every
     card, image and block of copy as it scrolls into view (see
     Decode.tsx for the rules that keep it aligned).
   - GSAP owns everything that moves: the contour lines drawing in,
     the glow chasing the pointer, section grounds opening out, titles
     rising, the marquee answering scroll speed, and ScrollSmoother
     underneath all of it.
   ────────────────────────────────────────────────────────────────── */

/** In-page links scroll through ScrollSmoother rather than jumping. */
const jump = (id: string) => (e: MouseEvent) => {
  e.preventDefault();
  scrollToSection(id);
};

/* ──────────────────────────────────────────────────────────────────
   HERO
   ────────────────────────────────────────────────────────────────── */
function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const hero = root.current;
      if (!hero || reduceMotion()) return;
      const q = gsap.utils.selector(hero);

      /* The map draws itself while the copy decodes — two different
         kinds of "arriving" that read as one moment. Each line grows
         from its own midpoint, in random order, so the field fills in
         like ink spreading rather than a wipe. */
      gsap.from(q(".hero__art path"), {
        drawSVG: "50% 50%",
        duration: 2.8,
        ease: "depth",
        stagger: { each: 0.018, from: "random" },
        delay: 0.1,
      });
      gsap.from(q(".hero__glow"), { opacity: 0, scale: 0.6, duration: 2.4, ease: "depth" });

      /* The glow trails the pointer and the map leans away from it.
         quickTo reuses one tween per axis instead of spawning one per
         pointermove. */
      const glow = q(".hero__glow")[0];
      const art = q(".hero__art")[0];
      const gx = gsap.quickTo(glow, "x", { duration: 1.8, ease: "power3" });
      const gy = gsap.quickTo(glow, "y", { duration: 1.8, ease: "power3" });
      const ax = gsap.quickTo(art, "x", { duration: 2.4, ease: "power3" });
      const ay = gsap.quickTo(art, "y", { duration: 2.4, ease: "power3" });
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        gx(nx * r.width * 0.55);
        gy(ny * r.height * 0.55);
        ax(nx * -28);
        ay(ny * -18);
      };
      hero.addEventListener("pointermove", onMove);

      gsap.to(q(".hero__badge-ring"), { rotate: 360, duration: 26, ease: "none", repeat: -1 });
      gsap.from(q(".hero__badge"), {
        scale: 0,
        rotate: -120,
        duration: 1.3,
        ease: "back.out(1.5)",
        delay: 1.9,
      });

      gsap.fromTo(
        q(".hero__cue-line"),
        { scaleY: 0, transformOrigin: "top center" },
        { scaleY: 1, duration: 1.1, ease: "sweep", repeat: -1, yoyo: true, repeatDelay: 0.3 }
      );

      /* Leaving the hero, the content lifts and dims a little faster
         than the page scrolls — the Decode root moves as one piece, so
         its overlay goes with it. */
      gsap.to(q(".hero__inner"), {
        yPercent: -10,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });

      return () => hero.removeEventListener("pointermove", onMove);
    },
    { scope: root }
  );

  return (
    <header ref={root} id="top" className="hero" data-theme="paper">
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__glow" />
        {/* Outer layer takes ScrollSmoother's parallax, inner layer the
            pointer drift — one transform each, so they never fight. */}
        <div className="hero__map" data-speed="0.75">
          <div className="hero__art" dangerouslySetInnerHTML={{ __html: contours }} />
        </div>
      </div>

      <Decode immediate speed={1} className="hero__inner">
        <div className="hero__copy">
          {/* Boxes the decode should hold back with the text, rather
              than leave standing empty while the copy is still glyphs:
              `fade` for pills and buttons, `surface` for the cards. */}
          <p className="hero__status" data-ascii="fade">
            <span className="hero__dot" aria-hidden="true" />
            {PROFILE.status}
          </p>

          <h1 className="hero__name">
            <span className="hero__name-line">{PROFILE.first}</span>
            <span className="hero__name-line">
              <em>{PROFILE.last}</em>
              <span className="hero__period">.</span>
            </span>
          </h1>

          <p className="hero__headline">{PROFILE.headline}</p>
          <p className="hero__intro">{PROFILE.intro}</p>

          <div className="hero__actions">
            <a className="btn" href="#work" onClick={jump("work")} data-ascii="fade">
              See my work <span className="btn__arrow">→</span>
            </a>
            <a className="btn btn--ghost" href="#contact" onClick={jump("contact")} data-ascii="fade">
              Get in touch
            </a>
            {/* A new tab, so the PDF doesn't take the reader off the site. */}
            <a className="btn btn--ghost" href={PROFILE.resume} target="_blank" rel="noopener" data-ascii="fade">
              Résumé <span className="btn__arrow">↗</span>
            </a>
          </div>
        </div>

        <figure className="hero__portrait">
          <div className="hero__frame" data-ascii="surface">
            <Art
              src={PROFILE.portrait}
              alt={PROFILE.portraitAlt}
              width={800}
              height={1000}
              fetchPriority="high"
            />
          </div>
          <figcaption className="hero__caption">
            <span>{PROFILE.location}</span>
            <span>37.82° N, 122.00° W</span>
          </figcaption>

          {/* Skipped by the decode: it is set on a path, and GSAP spins
              it, so there is nothing for a glyph grid to line up with. */}
          <div className="hero__badge" data-ascii="skip" aria-hidden="true">
            <svg className="hero__badge-ring" viewBox="0 0 120 120">
              <defs>
                <path id="badge-path" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" />
              </defs>
              <text>
                <textPath href="#badge-path" textLength="282" lengthAdjust="spacing">
                  OPEN TO WORK • SOFTWARE, AI &amp; IT •
                </textPath>
              </text>
            </svg>
            <span className="hero__badge-core">✦</span>
          </div>
        </figure>

        <div className="hero__foot">
          <dl className="hero__meta">
            <div>
              <dt>Role</dt>
              <dd>{PROFILE.role}</dd>
            </div>
            <div>
              <dt>Covers</dt>
              <dd>{PROFILE.covers}</dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>{PROFILE.location}</dd>
            </div>
            <div>
              <dt>On site</dt>
              <dd>{PROFILE.area}</dd>
            </div>
          </dl>
          <a className="hero__cue" href="#about" onClick={jump("about")}>
            Scroll
            <span className="hero__cue-track" aria-hidden="true">
              <span className="hero__cue-line" />
            </span>
          </a>
        </div>
      </Decode>
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────────
   MARQUEE

   The strip loops by sliding exactly one copy's width and starting
   over, which is seamless only while the copies left on screen still
   span the viewport at the instant it resets — so the copy count is
   measured, not assumed (one to fill the screen, one to cover the
   jump). Scroll speed pushes it along, and scroll direction steers it.
   ────────────────────────────────────────────────────────────────── */

/** Resting speed in px/sec, held constant however many copies there are. */
const MARQUEE_SPEED = 42;

function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);

  useGSAP(
    () => {
      const wrap = root.current;
      const track = wrap?.querySelector<HTMLElement>(".marquee__track");
      const one = wrap?.querySelector<HTMLElement>(".marquee__copy");
      if (!wrap || !track || !one) return;

      let tween: gsap.core.Tween | undefined;
      let dir = 1;

      const fit = () => {
        const w = one.getBoundingClientRect().width;
        if (!w) return;
        /* Returning the current value when it already fits lets React
           bail out, so this cannot loop against its own dependency. */
        const need = Math.ceil(wrap.clientWidth / w) + 1;
        setCopies((c) => (c === need ? c : need));

        tween?.kill();
        gsap.set(track, { x: 0 });
        if (reduceMotion()) return;
        tween = gsap.fromTo(
          track,
          { x: 0 },
          { x: -w, duration: w / MARQUEE_SPEED, ease: "none", repeat: -1 }
        );
      };

      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(wrap);
      document.fonts?.ready.then(fit);

      const boost = reduceMotion()
        ? undefined
        : ScrollTrigger.create({
            trigger: wrap,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              if (!tween) return;
              dir = self.direction;
              const v = Math.min(Math.abs(self.getVelocity()) / 260, 5);
              gsap.to(tween, {
                timeScale: dir * (1 + v),
                duration: 0.2,
                overwrite: true,
                onComplete: () => {
                  gsap.to(tween!, { timeScale: dir, duration: 1.4, ease: "power2.out" });
                },
              });
            },
          });

      return () => {
        ro.disconnect();
        tween?.kill();
        boost?.kill();
      };
    },
    { scope: root, dependencies: [copies] }
  );

  return (
    <div className="marquee" data-theme="ink" ref={root} aria-hidden="true">
      <div className="marquee__track">
        {Array.from({ length: copies }).map((_, i) => (
          <span key={i} className="marquee__copy">
            {MARQUEE.map((item) => (
              <span key={item} className="marquee__item">
                {item}
                <span className="marquee__star">✦</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   ABOUT
   ────────────────────────────────────────────────────────────────── */
function About() {
  return (
    <Section id="about" title={rich(HEADINGS.about.title)}>
      <div className="about">
        <Decode className="about__text" origin="top-left">
          <p className="about__lead">{ABOUT.lead}</p>
          <p className="about__body">{ABOUT.it}</p>
          <p className="about__body">{ABOUT.more}</p>
          <p className="about__body">{ABOUT.ai}</p>
          
        </Decode>

        <Decode as="aside" className="about__card" data-ascii="surface" delay={0.15}>
          <p className="eyebrow">At a glance</p>
          <dl className="about__facts">
            {ABOUT.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          {HAS_GAMES_PAGE && (
            <TransitionLink to="/games" label="Games" className="about__games" data-ascii="fade">
              <span>
                <span className="about__games-kicker">Off the clock</span>
                I make games in Unity and Roblox Studio. Take a look?
              </span>
              <span className="about__games-arrow" aria-hidden="true">
                →
              </span>
            </TransitionLink>
          )}
        </Decode>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   WORK

   Each project's picture opens larger in the lightbox on a click.
   ────────────────────────────────────────────────────────────────── */
function ProjectMedia({ project }: { project: Project }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      <ZoomButton onClick={() => setZoomed(true)}>
        <Art
          src={project.image}
          alt={project.imageAlt}
          width={1440}
          height={900}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </ZoomButton>
      {zoomed && (
        <Lightbox
          images={[{ src: project.image, alt: project.imageAlt }]}
          index={0}
          onClose={() => setZoomed(false)}
          label={project.title}
        />
      )}
    </>
  );
}

function Work() {
  return (
    <Section
      id="work"
      theme="ink"
      title={rich(HEADINGS.work.title)}
      intro={HEADINGS.work.intro}
      art={
        <>
          <div className="art-glow art-glow--work" />
          <div className="art-contours" data-speed="0.85" />
        </>
      }
    >
      <div className="work">
        {PROJECTS.map((p, i) => (
          <Decode as="article" key={p.title} className="project">
            <div className="project__media" data-ascii="surface">
              <ProjectMedia project={p} />
            </div>

            <div className="project__body">
              <p className="project__meta eyebrow">
                <span>{String(i + 1).padStart(2, "0")}</span>
                {p.status && <span className="project__status" color = "yellow">
                  {p.status}
                </span>}
              </p>
              <h3 className="project__title">
                {p.link ? (
                  <a className="project__link" href={p.link} target="_blank" rel="noopener noreferrer">
                    {p.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  p.title
                )}
              </h3>
              <p className="project__desc">{p.desc}</p>
              <ul className="project__tags" aria-label="Built with">
                {p.tags.map((t) => (
                  <li key={t} className="chip" data-ascii="fade">
                    {t}
                  </li>
                ))}
              </ul>
              {p.link && (
                <span className="project__cta" aria-hidden="true">
                  Visit site <span className="project__cta-arrow">↗</span>
                </span>
              )}
            </div>
          </Decode>
        ))}
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   CAPABILITIES

   A light follows the pointer across the cards. It is a CSS variable
   on the grid, not a transform on a card, so it never disturbs the
   decode running inside them.

   A card opens its skill's own page once it has highlights to show
   (see SKILL PAGES in content.ts). Its number, link and call to action
   all come from that skill, so the numbering here and on the skill
   pages can't drift apart.
   ────────────────────────────────────────────────────────────────── */
const skillFor = (id: CapabilityId) => getSkill(id)!;

/** A card's title, linked to its skill page once there is one. The
    link stretches over the whole card, as on the work section. */
function SkillTitle({ skill, className }: { skill: Skill; className: string }) {
  if (!hasSkillPage(skill)) return <h4 className={className}>{skill.title}</h4>;

  /* Swapping this page's address for /#<id> first means coming back,
     by any route including the browser's Back button, lands on this
     card rather than the top of the page. */
  const markReturn = () => window.history.replaceState(window.history.state, "", `#${skill.id}`);

  return (
    <h4 className={className}>
      <TransitionLink to={skillPath(skill.id)} label={skill.title} className="cap__link" onClick={markReturn}>
        {skill.title}
        <span className="sr-only">: see examples</span>
      </TransitionLink>
    </h4>
  );
}

/** "See 3 examples →" along the foot of a card that opens a page. */
function SkillCta({ skill }: { skill: Skill }) {
  if (!hasSkillPage(skill)) return null;
  const n = skill.highlights.length;
  let label = n > 0 ? `See ${n} example${n === 1 ? "" : "s"}` : "See examples";
  if (skill.inProgress) label = "Examples in progress";

  return (
    <span className="cap__cta" aria-hidden="true">
      {label}
      <span className="cap__cta-arrow">→</span>
    </span>
  );
}

function Capabilities() {
  const onMove = (e: ReactPointerEvent<HTMLOListElement>) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".cap");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <Section id="capabilities" title={rich(HEADINGS.capabilities.title)} intro={HEADINGS.capabilities.intro}>
      {CAPABILITY_GROUPS.map((group) => (
        <div key={group.label} className="caps-group">
          <div className="caps-group__head">
            <h3 className="caps-group__title">{group.label}</h3>
            <p className="caps-group__note">{group.note}</p>
          </div>
          <ol className="caps" onPointerMove={onMove} start={Number(skillFor(group.items[0].id).num)}>
            {group.items.map((c, i) => {
              const skill = skillFor(c.id);
              return (
                <Decode
                  as="li"
                  key={skill.id}
                  className="cap"
                  data-ascii="surface"
                  origin="top-left"
                  delay={(i % 2) * 0.12}
                >
                  <span id={skill.id} className="cap__anchor" />
                  <div className="cap__media">
                    <Art src={skill.image} alt="" width={640} height={420} loading="lazy" decoding="async" />
                  </div>
                  <div className="cap__body">
                    <p className="cap__num eyebrow">{skill.num}</p>
                    <SkillTitle skill={skill} className="cap__title" />
                    <p className="cap__desc">{skill.desc}</p>
                    <ul className="cap__tools" aria-label="Tools">
                      {skill.tools.map((t) => (
                        <li key={t} className="chip" data-ascii="fade">
                          {t}
                        </li>
                      ))}
                    </ul>
                    <SkillCta skill={skill} />
                  </div>
                </Decode>
              );
            })}
          </ol>
        </div>
      ))}
      <AiGroup />
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   AI — one illustration beside four compact cards

   Under the work-in-progress panel for now: the heading stays readable
   so it's clear what's coming, and the cards show through blurred.
   While it's up, each card's /#<skill-id> lands on the whole group
   rather than on a blurred card inside the panel.

   Once the AI examples are in, render <AiCards /> on its own in place
   of the panel, and drop the anchors above the heading.
   ────────────────────────────────────────────────────────────────── */
function AiGroup() {
  return (
    <div className="caps-group ai">
      {AI.items.map((item) => (
        <span key={item.id} id={item.id} className="cap__anchor" />
      ))}
      <div className="caps-group__head">
        <h3 className="caps-group__title">{AI.label}</h3>
        <p className="caps-group__note">{AI.note}</p>
      </div>
      <WorkInProgress className="ai__wip" title={AI.wip.title} note={AI.wip.note} subject={`About: ${AI.label}`}>
        <AiCards anchors={false} />
      </WorkInProgress>
    </div>
  );
}

/** The illustration and the four cards. `anchors` puts each card's
    /#<skill-id> landing spot on the card itself. */
function AiCards({ anchors = true }: { anchors?: boolean }) {
  return (
    <div className="ai__body">
      {/* Both shapes are here and the stylesheet shows one: tall beside
          the cards, the wide banner once they stack above it. */}
      <Decode className="ai__visual" data-ascii="surface">
        <Art className="ai__art--tall" src={AI.image} alt="" width={600} height={1000} loading="lazy" decoding="async" />
        <Art className="ai__art--wide" src={AI.banner} alt="" width={640} height={420} loading="lazy" decoding="async" />
      </Decode>
      <ol className="ai__list" start={Number(skillFor(AI.items[0].id).num)}>
        {AI.items.map((item, i) => {
          const skill = skillFor(item.id);
          return (
            <Decode
              as="li"
              key={skill.id}
              className="ai__item"
              data-ascii="surface"
              origin="top-left"
              delay={(i % 2) * 0.1}
            >
              {anchors && <span id={skill.id} className="cap__anchor" />}
              <p className="cap__num eyebrow">{skill.num}</p>
              <SkillTitle skill={skill} className="ai__title" />
              <p className="ai__desc">{skill.desc}</p>
              <ul className="cap__tools" aria-label="Tools">
                {skill.tools.map((t) => (
                  <li key={t} className="chip" data-ascii="fade">
                    {t}
                  </li>
                ))}
              </ul>
              <SkillCta skill={skill} />
            </Decode>
          );
        })}
      </ol>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   SERVICES

   The client-facing half of the page: what a small business or a
   person can ask for, and how that goes. Every "ask" opens an email
   with the service already in the subject, so the first message is
   half written.
   ────────────────────────────────────────────────────────────────── */
function Services() {
  return (
    <Section
      id="services"
      theme="ink"
      title={rich(HEADINGS.services.title)}
      intro={HEADINGS.services.intro}
      art={
        <>
          <div className="art-glow art-glow--services" />
          <div className="art-contours" data-speed="0.85" />
        </>
      }
    >
      <div className="services">
        <ol className="services__list">
          {SERVICES.map((s, i) => (
            <Decode as="li" key={s.title} className="service" origin="top-left" delay={i * 0.05}>
              <span className="service__num">{String(i + 1).padStart(2, "0")}</span>
              <div className="service__body">
                <h3 className="service__title">
                  <EmailButton className="service__link" subject={`Help with: ${s.title}`}>
                    {s.title}
                    <span className="sr-only"> — email me about this</span>
                  </EmailButton>
                </h3>
                <p className="service__desc">{s.desc}</p>
                <ul className="service__tags" aria-label="Involves">
                  {s.tags.map((t) => (
                    <li key={t} className="chip" data-ascii="fade">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="service__arrow" aria-hidden="true">
                ↗
              </span>
            </Decode>
          ))}
        </ol>

        <Decode as="aside" className="process" data-ascii="surface" delay={0.15}>
          <p className="eyebrow">How it works</p>
          <ol className="process__steps">
            {PROCESS.map((p, i) => (
              <li key={p.title}>
                <span className="process__num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3 className="process__title">{p.title}</h3>
                  <p className="process__desc">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <EmailButton className="btn" subject="IT help request" data-ascii="fade">
            Tell me what you need <span className="btn__arrow">→</span>
          </EmailButton>
          <p className="process__note">
            Small businesses and individuals both welcome. I'll come to you anywhere around the
            Bay, or help remotely.
          </p>
        </Decode>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   EXPERIENCE
   ────────────────────────────────────────────────────────────────── */
function Experience() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion()) return;
      gsap.from(".timeline__line", {
        scaleY: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 60%", scrub: 0.5 },
      });
    },
    { scope: root }
  );

  return (
    <Section id="experience" title={rich(HEADINGS.experience.title)}>
      <div className="timeline" ref={root}>
        <span className="timeline__line" aria-hidden="true" />

        {EXPERIENCE.map((job) => (
          <Decode as="article" key={job.company + job.years} className="job" origin="top-left">
            <p className="job__years">{job.years}</p>
            <div className="job__body">
              <h3 className="job__role">{job.role}</h3>
              <p className="job__company">
                <a href={job.companyLink} target="_blank" rel="noopener noreferrer">
                  {job.company}
                  <span aria-hidden="true"> ↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
              <p className="job__summary">{job.summary}</p>
              <ul className="job__points">
                {job.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
              <ul className="job__stack" aria-label="Stack">
                {job.stack.map((t) => (
                  <li key={t} className="chip" data-ascii="fade">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Decode>
        ))}

        {/* The open end of the timeline. */}
        <Decode className="job job--next" origin="top-left">
          <p className="job__years">Next</p>
          <div className="job__body">
            <h3 className="job__role">Your team?</h3>
            <p className="job__summary">
              I'm looking for my next development or IT role, remote, hybrid or on site, and I'm
              happy to commute anywhere in the Bay Area. I take on IT consulting and freelance
              projects too.
            </p>
            <a className="btn" href="#contact" onClick={jump("contact")} data-ascii="fade">
              Start a conversation <span className="btn__arrow">→</span>
            </a>
          </div>
        </Decode>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   INTERESTS
   ────────────────────────────────────────────────────────────────── */
function Interests() {
  return (
    <Section
      id="interests"
      theme="ink"
      title={rich(HEADINGS.interests.title)}
      intro={HEADINGS.interests.intro}
      art={<div className="art-glow art-glow--interests" />}
    >
      <ul className="interests">
        {INTERESTS.map((it, i) => (
          <Decode
            as="li"
            key={it.title}
            className="interest"
            data-ascii="surface"
            delay={(i % 2) * 0.1}
          >
            <div className="interest__media">
              <Art src={it.image} alt={it.imageAlt} width={800} height={600} loading="lazy" decoding="async" />
            </div>
            <div className="interest__body">
              <h3 className="interest__title">{it.title}</h3>
              <p className="interest__desc">{it.desc}</p>
              {it.cta && (
                <TransitionLink to={it.cta.to} label={it.cta.page} className="interest__cta">
                  {it.cta.label} <span aria-hidden="true">→</span>
                </TransitionLink>
              )}
            </div>
          </Decode>
        ))}
      </ul>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   CONTACT

   The orange panel grows out of the dark section above it rather than
   out of the page, so its corners show ink, not paper.
   ────────────────────────────────────────────────────────────────── */
function Contact() {
  const [copied, setCopied] = useState(false);
  const address = useRef<HTMLSpanElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* No clipboard access: select the address, so Ctrl+C does it. */
      const range = document.createRange();
      if (address.current) range.selectNodeContents(address.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  };

  return (
    <Section
      id="contact"
      theme="signal"
      className="section--contact"
      title={rich(HEADINGS.contact.title)}
      intro={HEADINGS.contact.intro}
      art={<div className="art-contours art-contours--contact" data-speed="0.9" />}
    >
      <Decode className="contact">
        <EmailButton className="contact__email">
          <span ref={address}>{PROFILE.email}</span>
        </EmailButton>
        <div className="contact__actions">
          <button type="button" className="btn" onClick={copy} data-ascii="fade">
            {copied ? "Copied to clipboard" : "Copy email"}
          </button>
          <EmailButton className="btn btn--ghost" data-ascii="fade">
            Write to me <span className="btn__arrow">↗</span>
          </EmailButton>
        </div>
        <span className="sr-only" role="status">
          {copied ? "Email address copied" : ""}
        </span>
        <ul className="contact__socials">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a href={s.href}>
                {s.label} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </Decode>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} {PROFILE.name}
        </p>
        <p>
          Built with React, TypeScript and GSAP. Transitions by{" "}
          <a href="https://github.com/quanhoangindex/ascii-reveal" target="_blank" rel="noopener noreferrer">
            ascii-reveal
          </a>
          .
        </p>
        <a className="footer__top" href="#top" onClick={jump("top")}>
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </footer>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────────────── */
function FrontPage() {
  useGSAP(() => {
    /* Three webfonts change every heading's height when they land; the
       triggers measured before that would fire early or late. Once
       they're in, honour a /#<id> link: a section, or the skill card a
       visitor has just come back to. */
    document.fonts?.ready.then(() => {
      ScrollTrigger.refresh();
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && document.getElementById(id)) scrollToSection(id, false);
    });
  });

  return (
    <div className="site">
      <a
        className="skip-link"
        href="#about"
        onClick={(e) => {
          jump("about")(e);
          document.getElementById("about")?.focus({ preventScroll: true });
        }}
      >
        Skip to content
      </a>

      <SiteNav />

      <SmoothScroll>
        <main>
          <Hero />
          <Marquee />
          <About />
          <Work />
          <Capabilities />
          <Services />
          <Experience />
          <Interests />
          <Contact />
        </main>
      </SmoothScroll>
    </div>
  );
}

export default FrontPage;
