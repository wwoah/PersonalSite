import { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./FrontPage.css";

gsap.registerPlugin( ScrollTrigger);

function FrontPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // ────────────────────────────────────────────────────────────────
      // 1. HERO — terminal-style boot sequence
      // ────────────────────────────────────────────────────────────────
      const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });
      heroTl
        .from(".boot-line", { opacity: 0, x: -10, duration: 0.4, stagger: 0.15 })
        .from(".hero-name .name-char", {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: "power4.out",
          stagger: 0.04,
        }, "-=0.2")
        .from(".hero-tagline", { opacity: 0, y: 20, duration: 0.8 }, "-=0.3")
        .from(".hero-meta-item", { opacity: 0, y: 15, duration: 0.5, stagger: 0.08 }, "-=0.4");

      // Blinking cursor — separate infinite loop
      gsap.to(".cursor", {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "steps(1)",
      });

      // ────────────────────────────────────────────────────────────────
      // 2. SECTION NUMERALS — parallax
      // ────────────────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>(".section").forEach((section) => {
        const num = section.querySelector(".section-num");
        if (!num) return;
        gsap.to(num, {
          yPercent: -40,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      // ────────────────────────────────────────────────────────────────
      // 3. SECTION HEADERS
      // ────────────────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>(".section-header").forEach((header) => {
        gsap.from(header.children, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: header,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // ────────────────────────────────────────────────────────────────
      // 4. CODE WINDOW
      // ────────────────────────────────────────────────────────────────
      gsap.from(".code-line", {
        opacity: 0,
        x: -10,
        duration: 0.3,
        ease: "none",
        stagger: 0.08,
        scrollTrigger: {
          trigger: ".code-window",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".code-window", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".code-window",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // ────────────────────────────────────────────────────────────────
      // 5. EXPERIENCE TIMELINE
      // ────────────────────────────────────────────────────────────────
      gsap.from(".timeline-line", {
        scaleY: 0,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: {
          trigger: ".timeline",
          start: "top 70%",
          end: "bottom 60%",
          scrub: 0.5,
        },
      });

      gsap.utils.toArray<HTMLElement>(".experience-item").forEach((item) => {
        gsap.from(item, {
          x: -30,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // ────────────────────────────────────────────────────────────────
      // 6. STACK
      // ────────────────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>(".stack-category").forEach((category) => {
        const chips = gsap.utils.toArray<HTMLElement>(
  category.querySelectorAll(".stack-chip")
);
       gsap.fromTo(
        chips,
        {
          opacity: 0,
          y: 20,
          scale: 0.92,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: "back.out(1.4)",
          stagger: 0.035,
          immediateRender: false,
          scrollTrigger: {
            trigger: category,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

        gsap.from(category.querySelector(".stack-label"), {
          opacity: 0,
          x: -20,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: category,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // ────────────────────────────────────────────────────────────────
      // 7. SQL QUERY BLOCK
      // ────────────────────────────────────────────────────────────────
      const sqlTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".sql-block",
          start: "top 75%",
          end: "bottom 60%",
          scrub: 1,
        },
      });
      sqlTl
        .from(".sql-block", { opacity: 0, y: 30, duration: 1 })
        .from(".sql-keyword", { color: "var(--ash-grey)", stagger: 0.5, duration: 0.5 }, 0.3);

      // ────────────────────────────────────────────────────────────────
      // 8. PROJECTS
      // ────────────────────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>(".project").forEach((project, i) => {
        gsap.from(project, {
          x: i % 2 === 0 ? -60 : 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: project,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // ────────────────────────────────────────────────────────────────
      // 9. MARQUEE
      // ────────────────────────────────────────────────────────────────
      gsap.to(".marquee-track", {
        xPercent: -50,
        ease: "none",
        duration: 30,
        repeat: -1,
      });

      // ────────────────────────────────────────────────────────────────
      // 10. FOOTER
      // ────────────────────────────────────────────────────────────────
      gsap.from(".footer-content > *", {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".footer",
          start: "top 85%",
        },
      });
    },
    { scope: container }
  );

  const name = "Phillip Bishop";

  return (
    <div ref={container} className="resume">
      {/* ───────── HERO ───────── */}
      <header className="hero">
        <div className="boot-sequence">
          <p className="boot-line"><span className="prompt">$</span> whoami</p>
          <p className="boot-line boot-output">→ full-stack engineer · React · TypeScript · .NET</p>
          <p className="boot-line"><span className="prompt">$</span> cat ./about.md</p>
        </div>

        <h1 className="hero-name">
          {name.split("").map((c, i) => {
            const isLast = i === name.length - 1;
            const char = c === " " ? " " : c;

            if (isLast) {
              return (
                <span key={i} className="name-tail">
                  <span className="name-char">{char}</span>
                  <span className="cursor">_</span>
                </span>
              );
            }
            return (
              <span key={i} className="name-char">{char}</span>
            );
          })}
        </h1>

        <p className="hero-tagline">
          I build both ends — the interface you tap and the API it talks to. The kind
          of full-stack work where the same person worries about the button's hover
          state and the database index it ultimately hits.
        </p>

        <div className="hero-meta">
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
            <span className="meta-value"><span className="status-dot" /> open to work</span>
          </div>
          <div className="hero-meta-item">
            <span className="meta-label">// also</span>
            <Link to="/arcade" className="arcade-link">▸ play the arcade</Link>
          </div>
        </div>
      </header>

      {/* ───────── ABOUT ───────── */}
      <section className="section about">
        <div className="section-num">01</div>
        <div className="section-header">
          <p className="section-kicker">// about</p>
          <h2 className="section-title">Full-stack engineer who actually likes both halves.</h2>
        </div>
        <div className="about-body">
          <p className="about-lead">
            On the back I write C# the way a carpenter measures twice — clean DbContexts,
            stored procedures that return in under 50ms, indexes that earn their keep.
            On the front I build React with TypeScript, where I care about component
            boundaries the same way I care about transaction scopes.
          </p>
          <p>
            I've spent years on production .NET systems with Entity Framework and T-SQL,
            and just as long shipping React UIs that people actually want to use. I think
            in <code>useEffect</code> dependency arrays and <code>AsNoTracking()</code>{" "}
            queries with equal comfort, and I write code that reads cleanly on either
            side of the API boundary.
          </p>
        </div>
      </section>

      {/* ───────── CODE WINDOW ───────── */}
      <section className="section code-section">
        <div className="section-num">02</div>
        <div className="section-header">
          <p className="section-kicker">// how I work</p>
          <h2 className="section-title">A small sample.</h2>
        </div>

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
      </section>

      {/* ───────── EXPERIENCE ───────── */}
      <section className="section experience">
        <div className="section-num">03</div>
        <div className="section-header">
          <p className="section-kicker">// experience</p>
          <h2 className="section-title">Where I've shipped.</h2>
        </div>

        <div className="timeline">
          <div className="timeline-line" />

          {[
            {
              year: "2023 — Now",
              role: "Senior Full-Stack Engineer",
              company: "Company Name",
              stack: "React · TypeScript · C# · .NET 8 · EF Core · SQL Server · Azure",
              desc: "Owned the customer-facing app end to end. Rebuilt the React frontend in TypeScript with proper component boundaries and a typed API layer, and migrated the .NET 4.7 backend to .NET 8 — together cutting p95 page-render time by 60% and infrastructure cost by a third."
            },
            {
              year: "2020 — 2023",
              role: "Full-Stack Developer",
              company: "Company Name",
              stack: "React · TypeScript · C# · .NET Framework · EF6 · T-SQL",
              desc: "Built the billing and reporting modules of a B2B SaaS product on both sides of the API. Authored ~80 stored procedures and tuned indexes that took our worst report from 90s to 2s, while shipping the React dashboard that visualized the results."
            },
            // {
            //   year: "2018 — 2020",
            //   role: "Software Developer",
            //   company: "Company Name",
            //   stack: "JavaScript · React · C# · MVC · ADO.NET · SQL Server",
            //   desc: "Built internal tools for operations and finance. First serious React work — and learned the hard way why you write integration tests against a real database, not a mocked one."
            // },
            // {
            //   year: "2016 — 2018",
            //   role: "Junior Developer",
            //   company: "Company Name",
            //   stack: "C# · WinForms · SQL Server",
            //   desc: "First real job. Inherited a 200k-line WinForms app and somehow kept it running. Wrote my first stored procedure here and never looked back."
            // }
          ].map((job, i) => (
            <article key={i} className="experience-item">
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
      </section>

      {/* ───────── MARQUEE ───────── */}
      <div className="marquee">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="marquee-content">
              <span className="marquee-dot">●</span> Open to full-stack &amp; frontend roles
              <span className="marquee-dot">●</span> Remote or hybrid
              <span className="marquee-dot">●</span> React · TypeScript · .NET · SQL Server
              <span className="marquee-dot">●</span> Available Spring 2026&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ───────── STACK ───────── */}
      <section className="section stack">
        <div className="section-num">04</div>
        <div className="section-header">
          <p className="section-kicker">// the stack</p>
          <h2 className="section-title">What I reach for.</h2>
        </div>

        <div className="stack-categories">
          {[
            {
              label: "Languages",
              chips: ["TypeScript", "C#", "JavaScript", "T-SQL", "HTML", "CSS", "PowerShell"]
            },
            {
              label: "Frontend",
              chips: ["React", "TypeScript", "Vite", "GSAP", "Tailwind", "CSS Modules", "React Router", "Zustand"]
            },
            {
              label: "Backend",
              chips: [".NET 8", ".NET Framework", "ASP.NET Web API", "ASP.NET MVC", "Blazor", "REST", "SignalR"]
            },
            {
              label: "Data",
              chips: ["Entity Framework", "EF Core", "Dapper", "SQL Server", "Stored Procedures", "Query Tuning", "Migrations"]
            },
            {
              label: "Tools & Platforms",
              chips: ["Visual Studio", "VS Code", "Rider", "Git", "Azure DevOps", "Docker", "xUnit", "Vitest", "Postman"]
            }
          ].map((cat) => (
            <div key={cat.label} className="stack-category">
              <p className="stack-label">{cat.label}</p>
              <div className="stack-chips">
                {cat.chips.map((chip) => (
                  <span key={chip} className="stack-chip">{chip}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── SQL BLOCK ───────── */}
      <section className="section sql-section">
        <div className="section-num">05</div>
        <div className="section-header">
          <p className="section-kicker">// data layer</p>
          <h2 className="section-title">SQL is still half the job.</h2>
        </div>

        <p className="sql-intro">
          The UI is only as fast as the query feeding it. A real one I'd ship — window
          functions, a CTE, and a covering index in mind. Scroll slowly to see each
          keyword come alive.
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
      </section>

      {/* ───────── PROJECTS ───────── */}
      <section className="section projects">
        <div className="section-num">06</div>
        <div className="section-header">
          <p className="section-kicker">// selected work</p>
          <h2 className="section-title">Things I've built.</h2>
        </div>

        <div className="projects-list">
          {[
            {
              num: "001",
              title: "Project Name",
              category: "Full-Stack · React · TypeScript · .NET 8",
              desc: "End-to-end build — typed API layer, React frontend with optimistic UI, EF Core data layer. Brief description of what you built, what problem it solved, and the impact (latency, conversion, etc)."
            },
            {
              num: "002",
              title: "Project Name",
              category: "Frontend · React · TypeScript · GSAP",
              desc: "A scroll-driven UI you'd point to as proof you care about the frontend. Mention the tricky bits — animation performance, accessibility tradeoffs, state machine design."
            },
            {
              num: "003",
              title: "Project Name",
              category: "Migration · .NET Framework → .NET 8 + React rebuild",
              desc: "Migration story across both halves. Always good to have one of these — shows you can modernize legacy systems on both the API and UI without breaking production."
            },
            {
              num: "004",
              title: "Peel Riot",
              category: "MongoDB · Typescript - React · GSAP",
              desc: "Purely custom sticker website. Slight plug, but still worth highlighting."
            }
          ].map((p) => (
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
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-kicker">// contact</p>
          <h2 className="footer-title">Let's build something.</h2>
          <a href="mailto:phillipkbishop@gmail.com" className="footer-email">
            phillipkbishop@gmail.com
          </a>
          <div className="footer-links">
            <a href="#">GitHub</a>
            <a href="#">LinkedIn</a>
            {/* <a href="#">Stack Overflow</a> */}
            <a href="#">Resume.pdf</a>
          </div>
          <p className="footer-copy">// built with Typescript - React, and GSAP, deployed on caffeine.</p>
        </div>
      </footer>
    </div>
  );
}

export default FrontPage;