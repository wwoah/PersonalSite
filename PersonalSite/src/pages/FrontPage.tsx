import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  Flip,
  reduceMotion,
} from "../anim/gsap";
import SmoothScroll from "../components/SmoothScroll";
import ProgressRail from "../components/ProgressRail";
import type { RailStop } from "../components/ProgressRail";
import Panel from "../components/panels/Panel";
import type { PanelMeta } from "../components/panels/Panel";
import "./FrontPage.css";

/* ──────────────────────────────────────────────────────────────────
   Section register.

   Each panel needs to know the one after it — the successor's header
   is what rises through the seam and takes focus. Declaring the whole
   running order in one place keeps that wiring honest and gives the
   progress rail its stops for free.
   ────────────────────────────────────────────────────────────────── */
const META = {
  hero: { id: "hero", num: "00", kicker: "// intro", title: "Phillip Bishop" },
  about: {
    id: "about",
    num: "01",
    kicker: "// about",
    title: "Full-stack engineer who actually likes both halves.",
  },
  code: {
    id: "code",
    num: "02",
    kicker: "// how I work",
    title: "A small sample.",
  },
  exp: {
    id: "exp",
    num: "03",
    kicker: "// experience",
    title: "Where I've shipped.",
  },
  stack: {
    id: "stack",
    num: "04",
    kicker: "// the stack",
    title: "What I reach for.",
  },
  sql: {
    id: "sql",
    num: "05",
    kicker: "// data layer",
    title: "SQL is still half the job.",
  },
  work: {
    id: "work",
    num: "06",
    kicker: "// selected work",
    title: "Things I've built.",
  },
  contact: {
    id: "contact",
    num: "07",
    kicker: "// contact",
    title: "Let's build something.",
  },
} satisfies Record<string, PanelMeta>;

const RAIL_STOPS: RailStop[] = [
  { id: "hero", num: "00", label: "intro" },
  { id: "about", num: "01", label: "about" },
  { id: "code", num: "02", label: "how I work" },
  { id: "exp", num: "03", label: "experience" },
  { id: "stack", num: "04", label: "the stack" },
  { id: "sql", num: "05", label: "data layer" },
  { id: "work", num: "06", label: "selected work" },
  { id: "contact", num: "07", label: "contact" },
];

const EXPERIENCE = [
  {
    year: "2023 — Now",
    role: "Senior Full-Stack Engineer",
    company: "Company Name",
    stack: "React · TypeScript · C# · .NET 8 · EF Core · SQL Server · Azure",
    desc: "Owned the customer-facing app end to end. Rebuilt the React frontend in TypeScript with proper component boundaries and a typed API layer, and migrated the .NET 4.7 backend to .NET 8 — together cutting p95 page-render time by 60% and infrastructure cost by a third.",
  },
  {
    year: "2020 — 2023",
    role: "Full-Stack Developer",
    company: "Company Name",
    stack: "React · TypeScript · C# · .NET Framework · EF6 · T-SQL",
    desc: "Built the billing and reporting modules of a B2B SaaS product on both sides of the API. Authored ~80 stored procedures and tuned indexes that took our worst report from 90s to 2s, while shipping the React dashboard that visualized the results.",
  },
];

const STACK = [
  {
    label: "Languages",
    chips: ["TypeScript", "C#", "JavaScript", "T-SQL", "HTML", "CSS", "PowerShell"],
  },
  {
    label: "Frontend",
    chips: ["React", "Vite", "GSAP", "Tailwind", "CSS Modules", "React Router", "Zustand"],
  },
  {
    label: "Backend",
    chips: [".NET 8", ".NET Framework", "ASP.NET Web API", "ASP.NET MVC", "Blazor", "REST", "SignalR"],
  },
  {
    label: "Data",
    chips: ["Entity Framework", "EF Core", "Dapper", "SQL Server", "Stored Procedures", "Query Tuning", "Migrations"],
  },
  {
    label: "Tools & Platforms",
    chips: ["Visual Studio", "VS Code", "Rider", "Git", "Azure DevOps", "Docker", "xUnit", "Vitest", "Postman"],
  },
];

const PROJECTS = [
  {
    num: "001",
    title: "Project Name",
    category: "Full-Stack · React · TypeScript · .NET 8",
    desc: "End-to-end build — typed API layer, React frontend with optimistic UI, EF Core data layer. Brief description of what you built, what problem it solved, and the impact (latency, conversion, etc).",
  },
  {
    num: "002",
    title: "Project Name",
    category: "Frontend · React · TypeScript · GSAP",
    desc: "A scroll-driven UI you'd point to as proof you care about the frontend. Mention the tricky bits — animation performance, accessibility tradeoffs, state machine design.",
  },
  {
    num: "003",
    title: "Project Name",
    category: "Migration · .NET Framework → .NET 8 + React rebuild",
    desc: "Migration story across both halves. Always good to have one of these — shows you can modernize legacy systems on both the API and UI without breaking production.",
  },
  {
    num: "004",
    title: "Peel Riot",
    category: "MongoDB · Typescript - React · GSAP",
    desc: "Purely custom sticker website. Slight plug, but still worth highlighting.",
  },
];

/* ──────────────────────────────────────────────────────────────────
   HERO
   ────────────────────────────────────────────────────────────────── */
function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion()) {
        gsap.set(root.current!.querySelectorAll("[data-hero]"), { opacity: 1 });
        return;
      }

      const q = gsap.utils.selector(root);

      // Chars are masked so they rise out of a hard edge rather than
      // fading in — reads as type being set, not content loading.
      const split = SplitText.create(q(".hero-name"), {
        type: "chars",
        mask: "chars",
        charsClass: "name-char",
        // The cursor lives inside the heading so it sits on the text
        // baseline, but it is chrome, not type — leave it whole.
        ignore: ".cursor",
      });

      /* Release the CSS reveal guard BEFORE the timeline is built.
         `from` tweens immediate-render at construction and record the
         value they find as their END state — with the guard still at
         opacity 0 they animate 0 → 0, which is why the tagline and the
         scroll hint never appeared. Setting them first has to happen
         here, not as the timeline's first tween. */
      gsap.set(q("[data-hero]"), { opacity: 1 });

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(q(".boot-line"), { opacity: 0, x: -10, duration: 0.4, stagger: 0.15 })
        .to(
          q(".boot-scramble"),
          {
            duration: 1.1,
            scrambleText: {
              text: "→ full-stack engineer · React · TypeScript · .NET",
              chars: "01·/<>_",
              speed: 0.7,
              revealDelay: 0.25,
            },
          },
          "-=0.2"
        )
        .from(
          split.chars,
          { yPercent: 118, duration: 0.7, ease: "settle", stagger: 0.03 },
          "-=0.7"
        )
        .from(q(".hero-tagline"), { opacity: 0, y: 20, duration: 0.8 }, "-=0.35")
        .from(
          q(".hero-meta-item"),
          { opacity: 0, y: 15, duration: 0.5, stagger: 0.08 },
          "-=0.4"
        )
        .from(q(".hero-scroll-hint"), { opacity: 0, y: 10, duration: 0.5 }, "-=0.15");

      gsap.to(q(".cursor"), {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "steps(1)",
      });

      return () => split.revert();
    },
    { scope: root }
  );

  return (
    <div className="hero" ref={root}>
      <div className="boot-sequence" data-hero data-speed="1.06">
        <p className="boot-line">
          <span className="prompt">$</span> whoami
        </p>
        <p className="boot-line boot-output boot-scramble">&nbsp;</p>
        <p className="boot-line">
          <span className="prompt">$</span> cat ./about.md
        </p>
      </div>

      <h1 className="hero-name" data-hero>
        Phillip Bishop
        <span className="cursor" aria-hidden="true">
          _
        </span>
      </h1>

      <p className="hero-tagline" data-hero data-speed="0.94">
        I build both ends — the interface you tap and the API it talks to. The
        kind of full-stack work where the same person worries about the button's
        hover state and the database index it ultimately hits.
      </p>

      <div className="hero-meta" data-hero>
        <div className="hero-meta-item">
          <span className="meta-label">// role</span>
          <span className="meta-value">Full-Stack Engineer</span>
        </div>
        <div className="hero-meta-item">
          <span className="meta-label">// location</span>
          <span className="meta-value">Danville, CA</span>
        </div>
        <div className="hero-meta-item">
          <span className="meta-label">// status</span>
          <span className="meta-value">
            <span className="status-dot" /> open to work
          </span>
        </div>
        <div className="hero-meta-item">
          <span className="meta-label">// also</span>
          <Link to="/arcade" className="arcade-link">
            ▸ play the arcade
          </Link>
        </div>
      </div>

      <p className="hero-scroll-hint" aria-hidden="true" data-hero>
        scroll <span className="hero-scroll-rule" />
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   STACK — Flip-driven filtering

   Chips reflow rather than repaint when you change category, so the
   section responds to input, not just to scroll position.
   ────────────────────────────────────────────────────────────────── */
function StackBody() {
  const root = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("All");
  const pending = useRef<ReturnType<typeof Flip.getState> | null>(null);

  const categories = ["All", ...STACK.map((c) => c.label)];
  const visible = filter === "All" ? STACK : STACK.filter((c) => c.label === filter);

  const change = (next: string) => {
    if (next === filter) return;
    // Capture geometry before React re-renders — Flip needs the "before"
    // state recorded while the old layout is still on screen.
    if (!reduceMotion() && root.current) {
      pending.current = Flip.getState(
        root.current.querySelectorAll(".stack-chip, .stack-category")
      );
    }
    setFilter(next);
  };

  useGSAP(
    () => {
      const state = pending.current;
      if (!state) return;
      pending.current = null;

      Flip.from(state, {
        duration: 0.55,
        ease: "settle",
        scale: true,
        absolute: true,
        stagger: 0.015,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
          ),
        onLeave: (els) =>
          gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.25 }),
      });
    },
    { scope: root, dependencies: [filter] }
  );

  /* First-view reveal only. Once the reader starts filtering, Flip owns
     chip motion — replaying this on every filter change would fight it. */
  useGSAP(
    () => {
      if (reduceMotion()) return;
      const q = gsap.utils.selector(root);

      q(".stack-category").forEach((cat) => {
        gsap.from(cat.querySelectorAll(".stack-chip"), {
          opacity: 0,
          y: 20,
          scale: 0.92,
          duration: 0.45,
          ease: "back.out(1.4)",
          stagger: 0.035,
          scrollTrigger: {
            trigger: cat,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <div className="stack-wrap" ref={root}>
      <div className="stack-filters" role="group" aria-label="Filter stack by category">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className="stack-filter"
            data-active={c === filter || undefined}
            aria-pressed={c === filter}
            onClick={() => change(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="stack-categories">
        {visible.map((cat) => (
          <div key={cat.label} className="stack-category" data-flip-id={`cat-${cat.label}`}>
            <p className="stack-label">{cat.label}</p>
            <div className="stack-chips">
              {cat.chips.map((chip) => (
                <span
                  key={chip}
                  className="stack-chip"
                  data-flip-id={`${cat.label}-${chip}`}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────────────── */
function FrontPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(container);

      /* Fraunces arrives after first paint and changes every heading's
         height. Without this every pin start/end is measured against
         the fallback serif and drifts once the real font lands. */
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      if (reduceMotion()) return;

      /* Code window */
      gsap.from(q(".code-window"), {
        opacity: 0,
        y: 40,
        rotateX: 12,
        transformOrigin: "50% 100%",
        duration: 0.9,
        ease: "depth",
        scrollTrigger: {
          trigger: ".code-window",
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(q(".code-line"), {
        opacity: 0,
        x: -10,
        duration: 0.3,
        ease: "none",
        stagger: 0.08,
        scrollTrigger: {
          trigger: ".code-window",
          start: "top 72%",
          toggleActions: "play none none reverse",
        },
      });

      /* Experience */
      gsap.from(q(".timeline-line"), {
        scaleY: 0,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: {
          trigger: ".timeline",
          start: "top 72%",
          end: "bottom 62%",
          scrub: 0.5,
        },
      });

      q(".experience-item").forEach((item) => {
        gsap.from(item, {
          x: -30,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        });
      });

      /* SQL — keywords ignite as you scroll through the query */
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".sql-block",
            start: "top 78%",
            end: "bottom 62%",
            scrub: 1,
          },
        })
        .from(".sql-block", { opacity: 0, y: 30, duration: 1 })
        .from(
          ".sql-keyword",
          { color: "var(--fg-dim)", stagger: 0.4, duration: 0.4 },
          0.3
        );

      /* Projects */
      q(".project").forEach((project, i) => {
        gsap.from(project, {
          x: i % 2 === 0 ? -60 : 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: project,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      });

      /* Marquee */
      gsap.to(q(".marquee-track"), {
        xPercent: -50,
        ease: "none",
        duration: 30,
        repeat: -1,
      });

      /* Footer */
      gsap.from(q(".footer-content > *"), {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".footer", start: "top 85%" },
      });
    },
    { scope: container }
  );

  return (
    <div ref={container} className="resume">
      <ProgressRail stops={RAIL_STOPS} />

      <SmoothScroll>
        {/* ── 00 → 01 · SLASH ── */}
        <Panel {...META.hero} exit="slash" next={META.about} cut={[60, 30]} bare>
          <Hero />
        </Panel>

        {/* ── 01 → 02 · DEPTH ── */}
        <Panel {...META.about} exit="depth" next={META.code}>
          <div className="about-body">
            <p className="about-lead">
              On the back I write C# the way a carpenter measures twice — clean
              DbContexts, stored procedures that return in under 50ms, indexes
              that earn their keep. On the front I build React with TypeScript,
              where I care about component boundaries the same way I care about
              transaction scopes.
            </p>
            <p>
              I've spent years on production .NET systems with Entity Framework
              and T-SQL, and just as long shipping React UIs that people actually
              want to use. I think in <code>useEffect</code> dependency arrays and{" "}
              <code>AsNoTracking()</code> queries with equal comfort, and I write
              code that reads cleanly on either side of the API boundary.
            </p>
          </div>
        </Panel>

        {/* ── 02 → 03 · WIPE ── */}
        <Panel {...META.code} exit="wipe" next={META.exp}>
          <div className="code-window">
            <div className="code-titlebar">
              <span className="dot dot-r" />
              <span className="dot dot-y" />
              <span className="dot dot-g" />
              <span className="code-filename">useUser.ts</span>
            </div>
            <pre className="code-body">
              <code>
                <div className="code-line"><span className="c-kw">type</span> <span className="c-type">User</span> = {"{"} id: <span className="c-type">number</span>; name: <span className="c-type">string</span>; roles: <span className="c-type">string</span>[] {"}"};</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line"><span className="c-kw">export function</span> <span className="c-fn">useUser</span>(id: <span className="c-type">number</span>) {"{"}</div>
                <div className="code-line">  <span className="c-kw">const</span> [user, setUser] = <span className="c-fn">useState</span>&lt;<span className="c-type">User</span> | <span className="c-kw">null</span>&gt;(<span className="c-kw">null</span>);</div>
                <div className="code-line">  <span className="c-kw">const</span> [error, setError] = <span className="c-fn">useState</span>&lt;<span className="c-type">Error</span> | <span className="c-kw">null</span>&gt;(<span className="c-kw">null</span>);</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line">  <span className="c-fn">useEffect</span>(() =&gt; {"{"}</div>
                <div className="code-line">    <span className="c-kw">const</span> ctrl = <span className="c-kw">new</span> <span className="c-fn">AbortController</span>();</div>
                <div className="code-line">    <span className="c-fn">fetch</span>(`/api/users/${"${id}"}`, {"{"} signal: ctrl.signal {"}"})</div>
                <div className="code-line">      .<span className="c-fn">then</span>(r =&gt; r.<span className="c-fn">json</span>() <span className="c-kw">as</span> <span className="c-type">Promise</span>&lt;<span className="c-type">User</span>&gt;)</div>
                <div className="code-line">      .<span className="c-fn">then</span>(setUser, setError);</div>
                <div className="code-line">    <span className="c-kw">return</span> () =&gt; ctrl.<span className="c-fn">abort</span>();</div>
                <div className="code-line">  {"}"}, [id]);</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line">  <span className="c-kw">return</span> {"{"} user, error {"}"};</div>
                <div className="code-line">{"}"}</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line"><span className="c-comment">// Talks to GetActiveUserAsync() on the .NET side.</span></div>
              </code>
            </pre>
          </div>
        </Panel>

        {/* ── 03 → 04 · SLASH (opposite diagonal) ── */}
        <Panel {...META.exp} exit="slash" next={META.stack} cut={[32, 62]}>
          <div className="timeline">
            <div className="timeline-line" />
            {EXPERIENCE.map((job) => (
              <article key={job.year} className="experience-item">
                <div className="experience-year">{job.year}</div>
                <div className="experience-body">
                  <h3 className="experience-role">{job.role}</h3>
                  <p className="experience-company">{job.company}</p>
                  <p className="experience-stack">{job.stack}</p>
                  <p className="experience-desc">{job.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        {/* ── 04 → 05 · CURTAIN ── */}
        <Panel {...META.stack} exit="curtain" next={META.sql}>
          <StackBody />
        </Panel>

        {/* ── 05 → 06 · SLASH (shallow) ── */}
        <Panel {...META.sql} exit="slash" next={META.work} cut={[50, 22]}>
          <p className="sql-intro">
            The UI is only as fast as the query feeding it. A real one I'd ship —
            window functions, a CTE, and a covering index in mind. Scroll slowly
            to see each keyword come alive.
          </p>

          <pre className="sql-block">
            <code>
              <div><span className="sql-keyword">WITH</span> RankedOrders <span className="sql-keyword">AS</span> (</div>
              <div>    <span className="sql-keyword">SELECT</span></div>
              <div>        o.CustomerId,</div>
              <div>        o.OrderId,</div>
              <div>        o.TotalAmount,</div>
              <div>        <span className="sql-keyword">ROW_NUMBER</span>() <span className="sql-keyword">OVER</span> (</div>
              <div>            <span className="sql-keyword">PARTITION BY</span> o.CustomerId</div>
              <div>            <span className="sql-keyword">ORDER BY</span> o.OrderDate <span className="sql-keyword">DESC</span></div>
              <div>        ) <span className="sql-keyword">AS</span> rn</div>
              <div>    <span className="sql-keyword">FROM</span> dbo.Orders o <span className="sql-keyword">WITH</span> (<span className="sql-keyword">NOLOCK</span>)</div>
              <div>    <span className="sql-keyword">WHERE</span> o.OrderDate &gt;= <span className="sql-keyword">DATEADD</span>(<span className="sql-keyword">MONTH</span>, -6, <span className="sql-keyword">GETUTCDATE</span>())</div>
              <div>)</div>
              <div><span className="sql-keyword">SELECT</span> c.CustomerName, r.OrderId, r.TotalAmount</div>
              <div><span className="sql-keyword">FROM</span> RankedOrders r</div>
              <div><span className="sql-keyword">INNER JOIN</span> dbo.Customers c <span className="sql-keyword">ON</span> c.CustomerId = r.CustomerId</div>
              <div><span className="sql-keyword">WHERE</span> r.rn = 1</div>
              <div><span className="sql-keyword">ORDER BY</span> r.TotalAmount <span className="sql-keyword">DESC</span>;</div>
            </code>
          </pre>
        </Panel>

        {/* ── 06 → 07 · DEPTH ── */}
        <Panel {...META.work} exit="depth" next={META.contact}>
          <div className="projects-list">
            {PROJECTS.map((p) => (
              <article key={p.num} className="project">
                <div className="project-num">{p.num}</div>
                <div className="project-body">
                  <p className="project-category">{p.category}</p>
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-desc">{p.desc}</p>
                </div>
                <div className="project-arrow">→</div>
              </article>
            ))}
          </div>
        </Panel>

        {/* ── Outro ticker ── */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="marquee-content">
                <span className="marquee-dot">●</span> Open to full-stack &amp;
                frontend roles
                <span className="marquee-dot">●</span> Remote or hybrid
                <span className="marquee-dot">●</span> React · TypeScript · .NET
                · SQL Server
                <span className="marquee-dot">●</span> Available Spring
                2026&nbsp;
              </span>
            ))}
          </div>
        </div>

        <footer className="footer" id="contact">
          <div className="footer-content">
            <p className="footer-kicker">// contact</p>
            <h2 className="footer-title">Let's build something.</h2>
            <a href="mailto:phillipkbishop@gmail.com" className="footer-email">
              phillipkbishop@gmail.com
            </a>
            <div className="footer-links">
              <a href="#">GitHub</a>
              <a href="#">LinkedIn</a>
              <a href="#">Resume.pdf</a>
            </div>
            <p className="footer-copy">
              // built with Typescript - React, and GSAP, deployed on caffeine.
            </p>
          </div>
        </footer>
      </SmoothScroll>
    </div>
  );
}

export default FrontPage;
