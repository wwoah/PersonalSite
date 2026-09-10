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
import { Prompt, Cmd, PromptLine, TermWindow } from "../components/Term";
import "./FrontPage.css";

/* ──────────────────────────────────────────────────────────────────
   Section register.

   Declaring the whole running order in one place keeps the numbering
   and the headers from drifting apart, and gives the progress rail its
   stops for free.

   `kicker` is the command the section answers. Every one of them is a
   cmdlet that would actually run, in the Verb-Noun form PowerShell
   requires, because a made-up command in a page that is otherwise this
   literal about the shell is the one thing a reader would catch.
   ────────────────────────────────────────────────────────────────── */
const META = {
  hero: { id: "hero", num: "00", kicker: "Get-Host", title: "Phillip Bishop" },
  about: {
    id: "about",
    num: "01",
    kicker: "Get-Profile",
    title: "Full-stack engineer who actually likes both halves.",
  },
  /* Projects and experience sit directly under the prose, because they
     are the only sections a stranger can verify without taking any of
     it on faith. Everything below them is supporting depth for a reader
     already interested. */
  work: {
    id: "work",
    num: "02",
    kicker: "Get-ChildItem .\\projects",
    title: "Things I've built.",
  },
  exp: {
    id: "exp",
    num: "03",
    kicker: "Get-Experience | Format-Table",
    title: "Where I've shipped.",
  },
  code: {
    id: "code",
    num: "04",
    kicker: "Get-Content .\\samples\\*",
    title: "A sample from each half.",
  },
  stack: {
    id: "stack",
    num: "05",
    kicker: "Get-Module -ListAvailable",
    title: "What I reach for.",
  },
  contact: {
    id: "contact",
    num: "06",
    kicker: "Send-MailMessage",
    title: "Let's build something.",
  },
} satisfies Record<string, PanelMeta>;

/* The rail sets these vertically in a ~14ch column, so they are the
   command's subject rather than the command itself. */
const RAIL_STOPS: RailStop[] = [
  { id: "hero", num: "00", label: "host" },
  { id: "about", num: "01", label: "profile" },
  { id: "work", num: "02", label: "projects" },
  { id: "exp", num: "03", label: "experience" },
  { id: "code", num: "04", label: "samples" },
  { id: "stack", num: "05", label: "modules" },
  { id: "contact", num: "06", label: "contact" },
];

const EXPERIENCE = [
  {
    year: "2024 — 2026",
    role: "Full-Stack Software Developer",
    company: "ELB US, Inc.",
    companyLink: "https://www.elbeducation.com/",
    stack: "React · TypeScript · C# · .NET Framework · EF6 · T-SQL",
    desc: "Completed the creation of an inhouse ERP/accounting software web application. Front end was created using React with TypeScript heavily styled with the Mantine React UI library. Backend support included C# and .NET for api calls and database communication. All data was stored in a SQL database.",
  },
];

const STACK = [
  {
    label: "Languages",
    chips: ["TypeScript", "C#", "JavaScript", "T-SQL", "HTML", "CSS", "PowerShell"],
  },
  {
    label: "Frontend",
    chips: ["React", "Vite", "GSAP", "Tailwind", "CSS Modules", "React Router"],
  },
  {
    label: "Backend",
    chips: [".NET 8", ".NET Framework", "ASP.NET Web API", "ASP.NET MVC", "Blazor", "REST"],
  },
  {
    label: "Data",
    chips: ["Entity Framework", "EF Core", "SQL Server", "Stored Procedures", "Migrations"],
  },
  {
    label: "Tools & Platforms",
    chips: ["Visual Studio", "VS Code", "Git", "Azure DevOps", "Docker", "xUnit", "Postman"],
  },
];

const PROJECTS = [
  {
    num: "001",
    title: "InkSync",
    category: "React · TypeScript",
    desc: "A hub for collabrative drawing features, such as a live canvas, private chat rooms and a drawing guessing minigame.",
    link: "https://inksync-1-o3dk.onrender.com/",
  },
  {
    num: "002",
    title: "Peel Riot (WIP)",
    category: "MongoDB · Typescript - React · GSAP",
    desc: "Purely custom sticker website. Slight plug, but still worth highlighting.",
    link: "https://peelriot.com",
  },
];

/* ──────────────────────────────────────────────────────────────────
   SAMPLES

   One window, two files. These were two full sections — a TypeScript
   one and a T-SQL one — which between them spent a quarter of the page
   on code that demonstrates style rather than evidencing work. Behind
   tabs they make the same point in one section and the height of the
   taller of the two.

   The tab strip was always drawn here; it just did not do anything.
   Now it does, which is both the honest reading of that chrome and the
   reason the merge costs no new furniture.
   ────────────────────────────────────────────────────────────────── */
const SAMPLE_TABS = [
  { id: "ts", label: "useUser.ts" },
  { id: "sql", label: "top-orders.sql" },
];

function Samples() {
  const [tab, setTab] = useState("ts");

  return (
    <>
      <p className="sample-intro">
        Both halves of the same request: the hook the interface calls, and
        the query it ultimately lands on.
      </p>

      <TermWindow
        id="samples"
        className="code-window"
        tabs={SAMPLE_TABS}
        active={tab}
        onSelect={setTab}
      >
        <div className="term__body">
          {/* Both tabs are a file listing, so both open with the same
              command — `Get-Content` prints a file, which is what the
              line numbers below are numbering. */}
          <PromptLine
            cmd={
              tab === "ts"
                ? "Get-Content .\\src\\hooks\\useUser.ts"
                : "Get-Content .\\sql\\top-orders.sql"
            }
            caret={false}
          />

          {tab === "ts" ? (
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
                <div className="code-line">    <span className="c-fn">fetch</span>(<span className="c-str">{"`/api/users/${id}`"}</span>, {"{"} signal: ctrl.signal {"}"})</div>
                <div className="code-line">      .<span className="c-fn">then</span>(r =&gt; r.<span className="c-fn">json</span>() <span className="c-kw">as</span> <span className="c-type">Promise</span>&lt;<span className="c-type">User</span>&gt;)</div>
                <div className="code-line">      .<span className="c-fn">then</span>(setUser, setError);</div>
                <div className="code-line">    <span className="c-kw">return</span> () =&gt; ctrl.<span className="c-fn">abort</span>();</div>
                <div className="code-line">  {"}"}, [id]);</div>
                <div className="code-line">&nbsp;</div>
                <div className="code-line">  <span className="c-kw">return</span> {"{"} user, error {"}"};</div>
                <div className="code-line">{"}"}</div>
              </code>
            </pre>
          ) : (
            <pre className="code-body">
              <code>
                <div className="code-line"><span className="sql-keyword">WITH</span> <span className="sql-obj">RankedOrders</span> <span className="sql-keyword">AS</span> (</div>
                <div className="code-line">    <span className="sql-keyword">SELECT</span> o.CustomerId, o.OrderId, o.TotalAmount,</div>
                <div className="code-line">        <span className="sql-fn">ROW_NUMBER</span>() <span className="sql-keyword">OVER</span> (</div>
                <div className="code-line">            <span className="sql-keyword">PARTITION BY</span> o.CustomerId</div>
                <div className="code-line">            <span className="sql-keyword">ORDER BY</span> o.OrderDate <span className="sql-keyword">DESC</span></div>
                <div className="code-line">        ) <span className="sql-keyword">AS</span> rn</div>
                <div className="code-line">    <span className="sql-keyword">FROM</span> <span className="sql-obj">dbo.Orders</span> o</div>
                <div className="code-line">    <span className="sql-keyword">WHERE</span> o.OrderDate &gt;= <span className="sql-fn">DATEADD</span>(<span className="sql-keyword">MONTH</span>, -6, <span className="sql-fn">GETUTCDATE</span>())</div>
                <div className="code-line">)</div>
                <div className="code-line"><span className="sql-keyword">SELECT</span> c.CustomerName, r.OrderId, r.TotalAmount</div>
                <div className="code-line"><span className="sql-keyword">FROM</span> <span className="sql-obj">RankedOrders</span> r</div>
                <div className="code-line"><span className="sql-keyword">INNER JOIN</span> <span className="sql-obj">dbo.Customers</span> c <span className="sql-keyword">ON</span> c.CustomerId = r.CustomerId</div>
                <div className="code-line"><span className="sql-keyword">WHERE</span> r.rn = 1</div>
                <div className="code-line"><span className="sql-keyword">ORDER BY</span> r.TotalAmount <span className="sql-keyword">DESC</span>;</div>
              </code>
            </pre>
          )}
        </div>
      </TermWindow>
    </>
  );
}

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
              text: "phillip\\full-stack · react · typescript · .NET · sql",
              chars: "01<>/\\$_",
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
        /* The Format-List block reveals as one unit with the command
           that produced it. `.hero-meta-item` is `display: contents`
           so the colons line up across rows — a contents box has no
           box to transform, which is why the stagger targets the
           label and value cells themselves. */
        .from(
          q(".hero-meta-cmd, .hero-meta-item > *"),
          { opacity: 0, y: 12, duration: 0.45, stagger: 0.045 },
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
          <Prompt /> <Cmd text="whoami" />
        </p>
        <p className="boot-line boot-output boot-scramble">&nbsp;</p>
      </div>

      {/* Two lines, not one. In monospace "PHILLIP BISHOP" is 8.4em
          wide on a single line and caps out around 6rem before it
          overruns the measure; split, it runs to 8.5rem. */}
      <h1 className="hero-name" data-hero>
        <span className="hero-name-line">Phillip</span>
        <span className="hero-name-line">
          Bishop
          <span className="cursor" aria-hidden="true">
            _
          </span>
        </span>
      </h1>

      <p className="hero-tagline" data-hero data-speed="0.94">
        I build both ends, the interface you click and the API it talks to. The
        kind of full-stack work where the same person worries about the button's
        hover state and the database index it ultimately hits.
      </p>

      <div className="hero-meta-block" data-hero>
        <PromptLine
          cmd="Get-Author | Format-List"
          className="hero-meta-cmd"
          caret={false}
        />

        <dl className="hero-meta">
          <div className="hero-meta-item">
            <dt className="meta-label">Role</dt>
            <dd className="meta-value">Full-Stack Engineer</dd>
          </div>
          <div className="hero-meta-item">
            <dt className="meta-label">Location</dt>
            <dd className="meta-value">Danville, CA</dd>
          </div>
          <div className="hero-meta-item">
            <dt className="meta-label">Status</dt>
            <dd className="meta-value">
              <span className="status-dot" /> Open to work
            </dd>
          </div>
          <div className="hero-meta-item">
            <dt className="meta-label">Arcade</dt>
            <dd className="meta-value">
              <Link to="/arcade" className="arcade-link">
                .\arcade.exe
              </Link>
            </dd>
          </div>
        </dl>
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
   section responds to input, not just to scroll position. The filters
   are styled as switch parameters because that is what they are: one
   more argument on the Get-Module call in the header.
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
   MARQUEE

   The strip loops by sliding exactly one copy's width and starting
   over, which is seamless only while the copies left on screen still
   span the viewport at the instant it resets. That needs one copy to
   fill the screen and one more behind it to cover the jump.

   The count is measured rather than assumed. It was hardcoded at two,
   which held only while a single copy was wider than the screen — the
   terminal restyle took the type from 1.25rem down to 0.875rem, one
   copy fell to 994px, and the reset started exposing bare track: a
   445px gap at 1440 and 925px at 1920. Phones never showed it, because
   there a copy is still wider than the screen.
   ────────────────────────────────────────────────────────────────── */

/** Scroll speed in px/sec, held constant however many copies there are. */
const MARQUEE_SPEED = 33;

const MARQUEE_LINE = (
  <>
    <span className="marquee-dot">●</span> Open to full-stack &amp; frontend
    roles
    <span className="marquee-dot">●</span> Remote, hybrid or on site
    <span className="marquee-dot">●</span> React · TypeScript · .NET · SQL
    Server
  </>
);

function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);

  useGSAP(
    () => {
      const wrap = root.current;
      const track = wrap?.querySelector<HTMLElement>(".marquee-track");
      const one = wrap?.querySelector<HTMLElement>(".marquee-content");
      if (!wrap || !track || !one) return;

      let tween: gsap.core.Tween | undefined;

      const fit = () => {
        const w = one.getBoundingClientRect().width;
        if (!w) return;

        /* One copy to fill the viewport, plus one to cover the reset.
           Returning the current value when it already fits lets React
           bail out, so this cannot loop against its own dependency. */
        const need = Math.ceil(wrap.clientWidth / w) + 1;
        setCopies((c) => (c === need ? c : need));

        tween?.kill();
        gsap.set(track, { x: 0 });
        if (reduceMotion()) return;

        tween = gsap.to(track, {
          x: -w,
          duration: w / MARQUEE_SPEED,
          ease: "none",
          repeat: -1,
        });
      };

      fit();

      /* Both of these change a copy's width, and either one alone would
         leave the strip mis-measured: the webfont replacing the
         fallback, and the viewport resizing across the font-size
         clamp. */
      const ro = new ResizeObserver(fit);
      ro.observe(wrap);
      document.fonts?.ready.then(fit);

      return () => {
        ro.disconnect();
        tween?.kill();
      };
    },
    { scope: root, dependencies: [copies] }
  );

  return (
    <div className="marquee" ref={root} aria-hidden="true">
      <div className="marquee-track">
        {Array.from({ length: copies }).map((_, i) => (
          <span key={i} className="marquee-content">
            {MARQUEE_LINE}
          </span>
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

      /* The page is set in one webfont at several weights. It still
         changes every heading's height when it lands, and without this
         every pin start/end is measured against the fallback and drifts
         once the real face arrives. */
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      if (reduceMotion()) return;

      /* Source viewer */
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

      /* The query's keywords used to ignite one by one as you scrolled
         through them. That needed the reader to scroll the length of
         the block, which is exactly what tabbing the samples together
         removed — behind a tab the query is either shown or it is not.
         The keywords simply render lit. */

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

      /* The marquee drives itself — it has to measure its own copies to
         know how far to travel, so it owns its tween rather than being
         animated from out here. */

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
        <Panel {...META.hero} bare>
          <Hero />
        </Panel>

        <Panel {...META.about}>
          <div className="about-body">
            <p className="about-lead">
              On the back I write C# the way a carpenter measures twice, clean
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

        <Panel {...META.work}>
          <div className="projects-list">
            {/* The `dir` column header. The real headings are on each
                row, so this is decoration and is hidden from AT. */}
            <div className="projects-head" aria-hidden="true">
              <span>Mode</span>
              <span>Name</span>
            </div>

            {PROJECTS.map((p) => (
              /* `data-linked` drives the row's clickable dressing —
                 cursor, hover wash, sliding arrow — so a project with
                 no link yet stays inert instead of promising a
                 destination it does not have. */
              <article
                key={p.num}
                className="project"
                data-linked={p.link ? "" : undefined}
              >
                <div className="project-mode" aria-hidden="true">
                  <b>d----</b> {p.num}
                </div>
                <div className="project-body">
                  <p className="project-category">{p.category}</p>
                  <h3 className="project-title">
                    {p.link ? (
                      <a
                        className="link-out"
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {p.title}
                        <span className="link-out__mark" aria-hidden="true">
                          ↗
                        </span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      p.title
                    )}
                  </h3>
                  <p className="project-desc">{p.desc}</p>
                </div>
                <div className="project-arrow" aria-hidden="true">
                  →
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel {...META.exp}>
          <div className="timeline">
            <div className="timeline-line" />
            {EXPERIENCE.map((job) => (
              <article key={job.year} className="experience-item">
                <div className="experience-year">{job.year}</div>
                <div className="experience-body">
                  <h3 className="experience-role">{job.role}</h3>
                  <p className="experience-company">
                    {job.companyLink ? (
                      <a
                        className="link-out"
                        href={job.companyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {job.company}
                        {/* The arrow is in the markup rather than a CSS
                            ::after so it can be hidden from the
                            accessibility tree outright — screen readers
                            announce generated content inconsistently,
                            and "north east arrow" is not information. */}
                        <span className="link-out__mark" aria-hidden="true">
                          ↗
                        </span>
                        {/* A link that opens elsewhere should say so, and
                            saying it invisibly costs the layout nothing. */}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      job.company
                    )}
                  </p>
                  <p className="experience-stack">{job.stack}</p>
                  <p className="experience-desc">{job.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel {...META.code}>
          <Samples />
        </Panel>

        <Panel {...META.stack}>
          <StackBody />
        </Panel>

        {/* ── Outro ticker ── */}
        <Marquee />

        <footer className="footer" id="contact">
          <div className="footer-content">
            <p className="footer-kicker">
              <Prompt /> <Cmd text="Send-MailMessage -To phillipkbishop@gmail.com" />
            </p>
            <h2 className="footer-title">Let's build something.</h2>
            <a href="mailto:phillipkbishop@gmail.com" className="footer-email">
              phillipkbishop@gmail.com
            </a>
            <div className="footer-links">
              <a href="#">GitHub</a>
              <a href="#">LinkedIn</a>
              <a href="#">Resume.pdf</a>
            </div>

            {/* The page signs off the way a shell does. */}
            <p className="footer-status">
              <span>
                ExitCode <b>0</b>
              </span>
              <span>
                pwsh <b>7.4</b>
              </span>
              <span>UTF-8</span>
              <span>
                sections <b>07/07</b>
              </span>
            </p>
            <p className="footer-copy">
              # built with TypeScript, React and GSAP. Deployed on caffeine.
            </p>
          </div>
        </footer>
      </SmoothScroll>
    </div>
  );
}

export default FrontPage;
