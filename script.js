// Generative constellation background — with a secret: every so often the
// particles gather into the Android bugdroid, hold, then dissolve back.
(() => {
  const canvas = document.getElementById("constellation");
  if (!canvas) return;
  const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(hover: none)").matches;
  if (rm || coarse) { canvas.remove(); return; }
  const ctx = canvas.getContext("2d");
  let W, H, dpr, accent;
  const mouse = { x: -9999, y: -9999 };
  const readAccent = () => {
    // Fixed sRGB values: --accent may now be oklch(), which canvas rgba() strings can't use.
    const light = document.documentElement.getAttribute("data-theme") === "light";
    accent = light ? [10, 143, 78] : [61, 220, 132];
  };
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  readAccent(); size();
  const N = Math.min(74, Math.floor(innerWidth / 20));
  const pts = Array.from({ length: N }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
    tx: 0, ty: 0,
  }));
  addEventListener("resize", size);
  addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  new MutationObserver(readAccent).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  document.addEventListener("visibilitychange", () => { slow = 0; last = performance.now(); });

  // --- Bugdroid silhouette as normalized outline points ---
  const droidPoints = (count) => {
    const segs = [];
    const arc = (cx, cy, r, a0, a1, n) => { for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * (i / (n - 1)); segs.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
    const line = (x0, y0, x1, y1, n) => { for (let i = 0; i < n; i++) { const t = i / (n - 1); segs.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]); } };
    arc(0, -0.52, 0.55, Math.PI, 2 * Math.PI, 16);            // head dome
    line(-0.55, -0.45, 0.55, -0.45, 8);                       // head base / body top
    line(-0.55, -0.38, -0.55, 0.52, 7);                       // body left
    line(0.55, -0.38, 0.55, 0.52, 7);                         // body right
    line(-0.55, 0.52, 0.55, 0.52, 7);                         // body bottom
    line(-0.78, -0.38, -0.78, 0.12, 5);                       // arm left
    line(0.78, -0.38, 0.78, 0.12, 5);                         // arm right
    line(-0.26, 0.52, -0.26, 0.88, 4);                        // leg left
    line(0.26, 0.52, 0.26, 0.88, 4);                          // leg right
    line(-0.28, -1.0, -0.44, -1.22, 3);                       // antenna left
    line(0.28, -1.0, 0.44, -1.22, 3);                         // antenna right
    segs.push([-0.22, -0.72], [0.22, -0.72]);                 // eyes (last two)
    // resample to exactly `count`
    const out = [];
    for (let i = 0; i < count; i++) out.push(segs[Math.floor(i * segs.length / count)]);
    out[out.length - 2] = [-0.22, -0.72];
    out[out.length - 1] = [0.22, -0.72];
    return out;
  };

  // formation state machine: float -> gather -> hold -> release -> float
  let mode = "float";
  let modeT = 0;
  const GATHER = 110, HOLD = 260;   // in frames (~60fps)
  const startFormation = () => {
    if (mode !== "float" || pts.length < 24 || document.hidden) return;
    const scale = Math.min(W, H) * 0.19;
    const cx = W * 0.5, cy = H * 0.46;
    const targets = droidPoints(pts.length).map(([x, y]) => [cx + x * scale, cy + y * scale]);
    // greedy nearest assignment so particles travel short, organic paths
    const free = new Set(pts.map((_, i) => i));
    for (const [tx, ty] of targets) {
      let best = -1, bd = Infinity;
      for (const i of free) {
        const d = (pts[i].x - tx) ** 2 + (pts[i].y - ty) ** 2;
        if (d < bd) { bd = d; best = i; }
      }
      pts[best].tx = tx; pts[best].ty = ty;
      free.delete(best);
    }
    mode = "gather"; modeT = 0;
  };
  window.__summonDroid = startFormation;
  setTimeout(startFormation, 7000);
  setInterval(startFormation, 42000);

  const LINK = 110, CURSOR = 160;
  let frames = 0, slow = 0, last = performance.now(), degraded = false;
  const frame = () => {
    const now = performance.now();
    const dt = now - last; last = now;
    if (frames++ > 90 && !document.hidden && dt < 150) {
      if (dt > 24) slow++; else slow = Math.max(0, slow - 1);
      if (slow > 45) {
        if (!degraded) { pts.length = Math.max(36, Math.floor(pts.length / 2)); degraded = true; slow = 0; }
        else { canvas.remove(); return; }
      }
    }
    if (!document.hidden) {
      ctx.clearRect(0, 0, W, H);
      const [r, g, b] = accent;
      const formed = mode === "hold";
      const forming = mode === "gather" || formed;

      if (forming) {
        modeT++;
        const pull = mode === "gather" ? 0.075 : 0.16;
        for (const p of pts) {
          p.x += (p.tx - p.x) * pull;
          p.y += (p.ty - p.y) * pull;
        }
        if (mode === "gather" && modeT > GATHER) { mode = "hold"; modeT = 0; }
        else if (formed && modeT > HOLD) {
          mode = "float";
          for (const p of pts) { p.vx = (Math.random() - 0.5) * 0.5; p.vy = (Math.random() - 0.5) * 0.5; }
        }
      } else {
        for (const p of pts) {
          p.x += p.vx; p.y += p.vy;
          p.vx = Math.max(-0.25, Math.min(0.25, p.vx * 0.999));
          p.vy = Math.max(-0.25, Math.min(0.25, p.vy * 0.999));
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
      }

      const dotA = formed ? 0.7 : 0.35;
      const linkA = formed ? 0.26 : 0.10;
      const linkD = formed ? 64 : LINK;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        ctx.fillStyle = `rgba(${r},${g},${b},${dotA})`;
        const s = formed ? 2.2 : 1.6;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      // glowing eyes while the droid is formed
      if (formed) {
        const scale = Math.min(W, H) * 0.19;
        for (const ex of [-0.22, 0.22]) {
          ctx.beginPath();
          ctx.arc(W * 0.5 + ex * scale, H * 0.46 - 0.72 * scale, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
          ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      for (let i = 0; i < pts.length; i++) {
        for (let k = i + 1; k < pts.length; k++) {
          const dx = pts[i].x - pts[k].x, dy = pts[i].y - pts[k].y;
          const d = Math.hypot(dx, dy);
          if (d < linkD) {
            ctx.strokeStyle = `rgba(${r},${g},${b},${linkA * (1 - d / linkD)})`;
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[k].x, pts[k].y); ctx.stroke();
          }
        }
        if (!forming) {
          const dm = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
          if (dm < CURSOR) {
            ctx.strokeStyle = `rgba(${r},${g},${b},${0.22 * (1 - dm / CURSOR)})`;
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();

// Scroll-spy: highlight the nav link of the section in view
const navLinks = document.querySelectorAll(".nav-link");
const sections = [...navLinks].map((link) =>
  document.querySelector(link.getAttribute("href"))
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  },
  { rootMargin: "-30% 0px -60% 0px" }
);

sections.forEach((section) => section && observer.observe(section));

// ---------------------------------------------------------------------------
// Recommendations received on LinkedIn (visible ones only), newest first.
// ---------------------------------------------------------------------------
const RECOMMENDATIONS = [
  {
    name: "Joy Cruz Vargas",
    title: "Senior Product Designer at The Economist",
    relationship: "Worked with Devrath on the same team",
    date: "January 2026",
    text: "I had the pleasure of working with Dev while he served as an Android software engineer on our team. From the start, Dev stood out for his proactive mindset, strong collaboration skills, and solid engineering expertise. He never hesitates to ask thoughtful questions, clarify requirements, or suggest improvements, which made cross-functional work smooth and enjoyable. As a designer, I especially appreciated his clear communication and genuine effort to build positive relationships with every team member. Beyond his technical abilities, Dev brings optimism and energy to the team — he's fun to work with and consistently helps boost team morale. I'd happily recommend Dev to any team looking for a talented Android engineer who is highly skilled, deeply collaborative, and a joy to work with.",
  },
  {
    name: "Richard Chao",
    title: "Project Manager · Certified SAFe® 6 Lean Portfolio Manager",
    relationship: "Managed Devrath directly",
    date: "August 2025",
    text: "I've had the pleasure of working with Devrath, one of the most driven and collaborative professionals I've met. His curiosity to learn inspires those around him and raises the bar for the whole team. Devrath is also highly skilled in Android development, but what sets him apart is his mindset. For him, work isn't just a job — it's a chance to create meaningful change. Whatever the task, he approaches it with full commitment and determination. Devrath also leads with a people-first attitude: customers first, then his team, never his ego. His positivity and curiosity build camaraderie and trust, creating an environment free of drama and full of good energy. Any team would be lucky to have him.",
  },
  {
    name: "Neil Vinas",
    title: "Staff Software Engineer",
    relationship: "Managed Devrath directly",
    date: "August 2025",
    text: "I had the pleasure of working with Devrath on the Economist Mobile App. He's a talented software engineer with a passion for problem-solving and a great enthusiasm for learning and sharing knowledge. Dependable and independent, he consistently delivers while collaborating seamlessly with product, delivery, and engineering teams to keep everyone aligned. Reliable, collaborative, and always a positive presence — he's a great teammate to work with.",
  },
  {
    name: "Sreenivas Makam",
    title: "Ex: KGeN (CTO), Google, Cisco · Engineering Leader · Author",
    relationship: "Was Devrath's client",
    date: "March 2024",
    text: "I have known Devrath last 1 year and I hired him for few freelance assignments for Indigg/Kratos for native Android development. Devrath takes full ownership of projects and brings them to completion. He goes beyond the scope of work when needed. Devrath worked as an extended developer of our team and brought new ideas to solve problems. Devrath is a good communicator as well.",
  },
  {
    name: "Prabhanjan Raghavendra",
    title: "Mobile Engineering · JioHotstar, PayTM",
    relationship: "Worked with Devrath on the same team",
    date: "October 2023",
    text: "I had the pleasure of working with Devrath at TEKsystems and again at MPL. He is an exceptionally good Android Dev whom everyone respected for his depth of knowledge, his passion about latest tech and commendable work ethics. I can definitely say that he is an asset to any company and team he works for, I look upto him as a developer.",
  },
  {
    name: "Divyanshu Grover",
    title: "Vice President at Mobile Premier League (MPL)",
    relationship: "Managed Devrath directly",
    date: "August 2023",
    text: "Brilliant engineer! Devrath is really good and understands problems of scale and bakes that in his solutions and coding! He is always upto date with tech and is very hard working and sincere!",
  },
  {
    name: "Amit Kumar Singh",
    title: "Senior Engineering Manager · Mobile Engineering Leadership",
    relationship: "Managed Devrath directly",
    date: "August 2023",
    text: "Devrath is a valuable team member because of his extensive knowledge in MVVM and clean architecture in Android development. This expertise allows him to effectively design and implement scalable and maintainable code structures. He consistently follows best practices and industry standards in his work, ensuring high-quality code and efficient development processes. He is not only able to deliver excellent results on his own, but also contributes to the team's success by sharing his knowledge and assisting others whenever needed.",
  },
  {
    name: "Sudarshan Shetty",
    title: "Software Development Engineer @ MPL",
    relationship: "Worked with Devrath on different teams",
    date: "August 2023",
    text: "I am thrilled to wholeheartedly recommend my colleague with whom I've collaborated on various projects that required seamless integration between Android Native and Unity. Particularly, our collaboration on embedding Unity as a library in Android native apps showcased his exceptional skills. His deep understanding of Android native development has consistently impressed me, and his dedication and diligence are truly commendable. His swift learning ability, combined with his meticulous and organized work approach, sets him apart. A true team player.",
  },
  {
    name: "Alok Singh Baghel",
    title: "Talent Advisor @ Recro",
    relationship: "Worked with Devrath on different teams",
    date: "May 2023",
    text: "Devrath possesses a deep understanding of the Android platform and has consistently demonstrated the ability to deliver high-quality applications. He is proficient in both Java and Kotlin programming languages, allowing him to adapt to any project requirement seamlessly. Throughout our collaboration, I have been impressed by Devrath's strong communication skills and ability to work effectively in a team environment. He actively contributes ideas, provides constructive feedback, and is always willing to assist his colleagues.",
  },
  {
    name: "Advait Alai",
    title: "Product Head · Amazon Japan",
    relationship: "Worked with Devrath on the same team",
    date: "July 2022",
    text: "Fantastic tech partner. A breeze to work with and brings deep technical mobile expertise to the table. As a senior dev, Devrath was instrumental in leading a new group & launching large scale streaming services. Kept a high bar on code quality which greatly minimised issues typically seen with first launches. Any team will be lucky to have him!",
  },
  {
    name: "Swapna M",
    title: "Chief Human Resources Officer at Recro",
    relationship: "Worked with Devrath at Recro",
    date: "January 2022",
    text: "Devrath did an exceptional job at Recro. He is a very productive and multi-skilled person with vast knowledge. He is careful, proactive, self motivated and intelligent team player. It's a pleasure working with Devrath and knowing him as a customer-service oriented employee. Thanks to interpersonal skills, Devrath has great relations with both our clients and internal employees. Talented employee with very strong problem solving skills, Devrath is an asset to any company.",
  },
  {
    name: "Scott Blomquist Junior",
    title: "Senior Engineering Manager",
    relationship: "Managed Devrath directly",
    date: "January 2021",
    text: "Devrath worked as a contractor for DealerSocket, through Recro.io, for 2 quarters in 2020. His work ethic, technical capability, and attention to detail were key in enabling our delivery of a new major mobile application for our company. Thank you for everything Devrath! I hope our paths cross again in the future.",
  },
];

// Curated: the strongest four render as cards; the rest live on LinkedIn.
const FEATURED_RECOS = ["Amit Kumar Singh", "Richard Chao", "Advait Alai", "Sreenivas Makam"];

function renderRecommendations() {
  const grid = document.getElementById("reco-grid");
  const fallback = document.getElementById("reco-fallback");
  if (!grid) return;

  const picks = FEATURED_RECOS
    .map((n) => RECOMMENDATIONS.find((r) => r.name === n))
    .filter(Boolean);
  if (!picks.length) return; // fallback text stays visible

  picks.forEach((rec) => {
    const card = document.createElement("article");
    card.className = "reco-card clamped";

    const quote = document.createElement("blockquote");
    quote.textContent = `“${rec.text}”`;

    const more = document.createElement("button");
    more.type = "button";
    more.className = "reco-more";
    more.textContent = "Read more";
    more.addEventListener("click", () => {
      const clamped = card.classList.toggle("clamped");
      more.textContent = clamped ? "Read more" : "Show less";
    });

    const meta = document.createElement("footer");
    meta.className = "reco-meta";

    const name = document.createElement("span");
    name.className = "reco-name";
    name.textContent = rec.name;

    const title = document.createElement("span");
    title.className = "reco-sub";
    title.textContent = rec.title;

    const context = document.createElement("span");
    context.className = "reco-sub muted";
    context.textContent = [rec.relationship, rec.date]
      .filter(Boolean)
      .join(" · ");

    meta.append(name, title, context);
    card.append(quote, more, meta);
    grid.appendChild(card);

    // Hide the toggle when the quote fits without clamping.
    requestAnimationFrame(() => {
      if (quote.scrollHeight <= quote.clientHeight + 2) more.hidden = true;
    });
  });

  grid.hidden = false;
  if (fallback) fallback.hidden = true;
}

renderRecommendations();

// Scroll-reveal: fade sections and cards up as they enter the viewport.
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealTargets = document.querySelectorAll(
    "section, .honor-list li, .tl-node, .stat, .signature"
  );
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  const perParent = new Map(); // stagger siblings that reveal together
  revealTargets.forEach((el) => {
    const n = perParent.get(el.parentElement) || 0;
    perParent.set(el.parentElement, n + 1);
    el.style.transitionDelay = `${Math.min(n, 6) * 70}ms`;
    el.classList.add("will-reveal");
    revealObserver.observe(el);
  });
}

// Light / dark theme toggle (persisted in localStorage; dark is default).
const themeToggle = document.getElementById("theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function applyThemeColor() {
  const light = document.documentElement.getAttribute("data-theme") === "light";
  if (themeColorMeta) themeColorMeta.content = light ? "#f1f5f9" : "#0f172a";
}

applyThemeColor();

themeToggle.addEventListener("click", () => {
  const root = document.documentElement;
  const light = root.getAttribute("data-theme") === "light";
  if (light) {
    root.removeAttribute("data-theme");
    localStorage.setItem("theme", "dark");
  } else {
    root.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }
  applyThemeColor();
});

// Intro loader: hexagon draws, letter fades in — then the mark flies into
// the corner and becomes the monogram (shared-element continuity).
const loader = document.getElementById("loader");
if (loader) {
  const finish = () => {
    document.body.classList.add("morphed");
    loader.remove();
  };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.body.classList.remove("loading");
    finish();
  } else {
    setTimeout(() => {
      document.body.classList.remove("loading");
      document.body.classList.add("cascade"); // hero rises while the mark flies
      loader.classList.add("done");           // backdrop fades, svg stays
      const svg = loader.querySelector("svg");
      const target = document.querySelector("#monogram svg");
      if (svg && target) {
        const a = svg.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        const anim = svg.animate([
          { transform: "none", opacity: 1 },
          { transform: `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width})`, opacity: 1 },
        ], { duration: 620, easing: "cubic-bezier(0.5, 0, 0.2, 1)", fill: "forwards" });
        svg.style.transformOrigin = "top left";
        anim.onfinish = finish;
      } else {
        finish();
      }
    }, 1900);
  }
}

// Scroll progress bar
const progress = document.getElementById("progress");
if (progress) {
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = max > 0 ? `${(scrollY / max) * 100}%` : "0";
    ticking = false;
  };
  addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

// Count-up animation for the stat values (e.g. 42.9k, 70+, 25+)
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      statObserver.unobserve(entry.target);
      const node = entry.target.firstChild; // leading text node
      const match = node && node.nodeType === 3 && node.textContent.match(/^([\d.]+)(.*)$/s);
      if (!match) return;
      const target = parseFloat(match[1]);
      const decimals = (match[1].split(".")[1] || "").length;
      const suffix = match[2];
      const t0 = performance.now();
      const dur = 1200;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        node.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(".stat-value").forEach((el) => statObserver.observe(el));
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Typewriter: retype the tagline once the hero cascade has landed.
const taglineText = document.getElementById("tagline-text");
if (taglineText && !reducedMotion && loader) {
  const full = taglineText.textContent;
  taglineText.textContent = "";
  setTimeout(() => {
    document.body.classList.add("typing");
    let i = 0;
    const type = () => {
      taglineText.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(type, 16 + Math.random() * 24);
      else setTimeout(() => document.body.classList.remove("typing"), 1200);
    };
    type();
  }, 2350); // loader (1.9s) + start of cascade
}

// 3D tilt on stat and list cards (max ~5deg, resets on leave).
if (!reducedMotion && matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".stat, .honor-list li").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
      card.style.transform = `perspective(600px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// Parallax: the trailer cover drifts gently as it moves through the viewport.
const coverImg = document.querySelector(".project-cover video, .project-cover img");
if (coverImg && !reducedMotion) {
  let coverTick = false;
  const parallax = () => {
    const r = coverImg.parentElement.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) {
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -0.5..0.5
      coverImg.style.transform = `scale(1.12) translateY(${(-p * 24).toFixed(1)}px)`;
    }
    coverTick = false;
  };
  addEventListener("scroll", () => {
    if (!coverTick) { requestAnimationFrame(parallax); coverTick = true; }
  }, { passive: true });
  parallax();
}


// Print: expand every experience accordion so the paper resume is complete,
// then restore the reader's open/closed state afterwards.
let printSnapshot = null;
addEventListener("beforeprint", () => {
  const details = [...document.querySelectorAll("details.tl-details")];
  printSnapshot = details.map((d) => d.open);
  details.forEach((d) => { d.open = true; });
});
addEventListener("afterprint", () => {
  if (!printSnapshot) return;
  [...document.querySelectorAll("details.tl-details")].forEach((d, i) => {
    d.open = printSnapshot[i];
  });
  printSnapshot = null;
});

// Theme toggle: circular reveal via the View Transitions API when available.
if (themeToggle && document.startViewTransition && !reducedMotion) {
  const applyToggle = () => {
    const root = document.documentElement;
    const light = root.getAttribute("data-theme") === "light";
    if (light) { root.removeAttribute("data-theme"); localStorage.setItem("theme", "dark"); }
    else { root.setAttribute("data-theme", "light"); localStorage.setItem("theme", "light"); }
    applyThemeColor();
  };
  // replace the plain listener with the animated one
  const clone = themeToggle.cloneNode(true);
  themeToggle.replaceWith(clone);
  clone.addEventListener("click", () => {
    const r = clone.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    const vt = document.startViewTransition(applyToggle);
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`] },
        { duration: 550, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
      );
    });
  });
}

// Easter egg: five quick clicks on the monogram sends a robot across the screen.
const monogram = document.getElementById("monogram");
if (monogram) {
  let clicks = 0, timer = null;
  monogram.addEventListener("click", () => {
    clicks += 1;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 1600);
    if (clicks >= 5 && !document.getElementById("egg-bot") && !reducedMotion) {
      clicks = 0;
      const bot = document.createElement("div");
      bot.id = "egg-bot";
      bot.title = "beep boop";
      bot.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.46 11.46 0 0 0-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83l1.84 3.18C3.45 11.15 1.5 13.09 1.5 16h21c0-2.91-1.95-4.85-4.9-6.52zM7 14.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/></svg>`;
      document.body.appendChild(bot);
      bot.addEventListener("animationend", () => bot.remove(), { once: true });
    }
  });
}

// Heading anchor links (GitHub-style, discoverable on hover).
document.querySelectorAll(".content section[id] .section-heading h3").forEach((h3) => {
  const id = h3.closest("section").id;
  const a = document.createElement("a");
  a.className = "anchor-link";
  a.href = `#${id}`;
  a.textContent = "#";
  a.setAttribute("aria-label", `Link to the ${id} section`);
  h3.appendChild(a);
});

// Rotating hero pull-quote (best lines from the recommendations).
const HERO_QUOTES = [
  ["“Brilliant engineer!”", "— Divyanshu Grover · VP, Mobile Premier League"],
  ["“One of the most driven and collaborative professionals I've met.”", "— Richard Chao · Project Manager"],
  ["“Kept a high bar on code quality — any team will be lucky to have him.”", "— Advait Alai · Product Head, Amazon Japan"],
];
const quoteEl = document.getElementById("hero-quote-text");
const quoteBy = document.getElementById("hero-quote-by");
if (quoteEl && quoteBy && !reducedMotion) {
  let qi = 0;
  setInterval(() => {
    if (document.hidden) return;
    const fig = quoteEl.closest(".hero-quote");
    fig.classList.add("fading");
    setTimeout(() => {
      qi = (qi + 1) % HERO_QUOTES.length;
      quoteEl.textContent = HERO_QUOTES[qi][0];
      quoteBy.textContent = HERO_QUOTES[qi][1];
      fig.classList.remove("fading");
    }, 460);
  }, 7000);
}

// Command palette (⌘K / Ctrl+K)
const palette = document.getElementById("palette");
if (palette) {
  const input = document.getElementById("palette-input");
  const list = document.getElementById("palette-list");
  const COMMANDS = [
    ...[...document.querySelectorAll(".content section[id]")].map((sec) => ({
      label: sec.querySelector("h3")?.textContent.replace("#", "").trim() || sec.id,
      kind: "Jump",
      run: () => sec.scrollIntoView({ behavior: "smooth" }),
    })),
    { label: "Summon the droid", kind: "Action", run: () => window.__summonDroid?.() },
    { label: "Toggle theme", kind: "Action", run: () => document.getElementById("theme-toggle").click() },
    { label: "Copy email address", kind: "Action", run: () => navigator.clipboard?.writeText("devrath.dev595@gmail.com") },
    { label: "Email me", kind: "Action", run: () => { location.href = "mailto:devrath.dev595@gmail.com"; } },
    { label: "GitHub", kind: "Open", run: () => open("https://github.com/devrath", "_blank") },
    { label: "LinkedIn", kind: "Open", run: () => open("https://www.linkedin.com/in/devrath-ad-01b59022/", "_blank") },
    { label: "Stack Overflow", kind: "Open", run: () => open("https://stackoverflow.com/users/1083093/devrath", "_blank") },
    { label: "Medium", kind: "Open", run: () => open("https://medium.com/@devrath.dev595", "_blank") },
    { label: "Tunify on Google Play", kind: "Open", run: () => open("https://play.google.com/store/apps/details?id=com.istudio.tunify", "_blank") },
  ];
  let filtered = COMMANDS;
  let sel = 0;

  const render = () => {
    list.innerHTML = "";
    filtered.forEach((cmd, i) => {
      const li = document.createElement("li");
      li.textContent = cmd.label;
      const kind = document.createElement("span");
      kind.className = "p-kind";
      kind.textContent = cmd.kind;
      li.appendChild(kind);
      li.setAttribute("role", "option");
      if (i === sel) li.classList.add("selected");
      li.addEventListener("click", () => { runCmd(cmd); });
      li.addEventListener("mousemove", () => { sel = i; render(); });
      list.appendChild(li);
    });
  };

  const openPalette = () => {
    palette.hidden = false;
    input.value = "";
    filtered = COMMANDS;
    sel = 0;
    render();
    input.focus();
  };
  const closePalette = () => { palette.hidden = true; };
  const runCmd = (cmd) => { closePalette(); cmd.run(); };

  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      palette.hidden ? openPalette() : closePalette();
    } else if (!palette.hidden) {
      if (e.key === "Escape") closePalette();
      else if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); render(); list.children[sel]?.scrollIntoView({ block: "nearest" }); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); list.children[sel]?.scrollIntoView({ block: "nearest" }); }
      else if (e.key === "Enter" && filtered[sel]) runCmd(filtered[sel]);
    }
  });

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(q));
    sel = 0;
    render();
  });

  palette.querySelector("[data-close]").addEventListener("click", closePalette);
  document.getElementById("palette-hint")?.addEventListener("click", openPalette);
}

// Terminal easter egg (press ` outside of inputs).
const term = document.getElementById("terminal");
if (term) {
  const tin = document.getElementById("term-in");
  const tout = document.getElementById("term-out");
  const println = (text, accent) => {
    const div = document.createElement("div");
    if (accent) div.className = "t-accent";
    div.textContent = text;
    tout.appendChild(div);
    tout.scrollTop = tout.scrollHeight;
  };
  const CMDS = {
    help: () => println("commands: whoami · stack · awards · droid · open <github|linkedin|stackoverflow|medium|tunify> · theme · clear · exit"),
    whoami: () => println("Devrath AD — Senior Software Engineer · Android. Building at The Economist. Bengaluru, India."),
    stack: () => println("Kotlin · Jetpack Compose · Coroutines & Flow · Media3/ExoPlayer · MVI · Clean Architecture · Hilt"),
    awards: () => println("🏆 PPA Video Content of the Year '26 · ⭐ Code Star (MPL) · 🥇 390th Android Gold badge worldwide"),
    droid: () => { window.__summonDroid ? (window.__summonDroid(), println("watch the stars…")) : println("the sky is asleep on this device"); },
    theme: () => { document.getElementById("theme-toggle").click(); println("theme toggled"); },
    clear: () => { tout.innerHTML = ""; },
    exit: () => { term.hidden = true; },
  };
  const OPEN = {
    github: "https://github.com/devrath",
    linkedin: "https://www.linkedin.com/in/devrath-ad-01b59022/",
    stackoverflow: "https://stackoverflow.com/users/1083093/devrath",
    medium: "https://medium.com/@devrath.dev595",
    tunify: "https://play.google.com/store/apps/details?id=com.istudio.tunify",
  };
  addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName);
    if (e.key === "`" && !typing) {
      e.preventDefault();
      term.hidden = !term.hidden;
      if (!term.hidden) {
        if (!tout.childElementCount) { println("Devrath AD portfolio — type 'help' to get started.", true); }
        tin.focus();
      }
    } else if (!term.hidden && e.key === "Escape") term.hidden = true;
  });
  tin.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const raw = tin.value.trim();
    tin.value = "";
    if (!raw) return;
    println(`devrath@portfolio:~$ ${raw}`, true);
    const [cmd, arg] = raw.toLowerCase().split(/\s+/);
    if (cmd === "open" && OPEN[arg]) { open(OPEN[arg], "_blank"); println(`opening ${arg}…`); }
    else if (CMDS[cmd]) CMDS[cmd]();
    else println(`command not found: ${cmd} — try 'help'`);
  });
}

// Text-decode: section headings scramble into place on first reveal.
if (!reducedMotion) {
  const GLYPHS = "!<>-_\\/[]{}=+*^?#";
  const decodeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      decodeObserver.unobserve(entry.target);
      const node = [...entry.target.childNodes].find(
        (n) => n.nodeType === 3 && n.textContent.trim()
      );
      if (!node) return;
      const label = node.textContent;
      const clean = label.trim();
      const t0 = performance.now();
      const dur = 420;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const solved = Math.floor(clean.length * p);
        let out = clean.slice(0, solved);
        for (let i = solved; i < clean.length; i++) {
          out += clean[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        node.textContent = ` ${out} `;
        if (p < 1) requestAnimationFrame(tick);
        else node.textContent = label;
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".content section .section-heading h3").forEach((h) => {
    const node = [...h.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (node) h.setAttribute("aria-label", node.textContent.trim());
    decodeObserver.observe(h);
  });
}

// Magnetic pull: the Say-hello button and the monogram lean toward the cursor.
if (!reducedMotion && matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".cta-button, #monogram").forEach((el) => {
    const strength = el.id === "monogram" ? 0.35 : 0.3;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transition = "transform 0.1s ease-out";
      el.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform 0.45s var(--ease-spring)";
      el.style.transform = "";
    });
  });
}

// Trailer videos: poster-first with preload="none"; play only while on screen.
const lazyVideos = document.querySelectorAll("video.lazy-video");
if (lazyVideos.length && !reducedMotion && "IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.play().catch(() => {});
      else target.pause();
    });
  }, { threshold: 0.25 });
  lazyVideos.forEach((v) => videoObserver.observe(v));
}

// Cursor spotlight: cards glow softly where the pointer is (pairs with the tilt).
if (matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".honor-list li, .stat").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      card.style.setProperty("--spot-y", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    });
  });
}

// KALIMA carousel: swipeable design showcase — snap scrolling, drag on
// desktop, dot sync, and heavy GIFs that only load once they're needed.
const kalimaCarousel = document.getElementById("kalima-carousel");
if (kalimaCarousel) {
  const track = kalimaCarousel.querySelector(".carousel-track");
  const slides = [...track.querySelectorAll(".carousel-slide")];
  const dotsWrap = kalimaCarousel.querySelector(".carousel-dots");

  const centerOn = (slide, behavior) => {
    track.scrollTo({
      left: slide.offsetLeft - track.offsetLeft - (track.clientWidth - slide.clientWidth) / 2,
      behavior: behavior || (reducedMotion ? "auto" : "smooth"),
    });
  };

  const dots = slides.map((slide, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Go to slide ${i + 1} of ${slides.length}`);
    b.addEventListener("click", () => centerOn(slide));
    dotsWrap.appendChild(b);
    return b;
  });

  const loadGif = (slide) => {
    const img = slide.querySelector("img[data-gif]");
    if (img) { img.src = img.dataset.gif; delete img.dataset.gif; }
  };

  // Active-slide tracking drives the dot state, the scale/fade animation,
  // and lazy GIF upgrades (the 9 MB demo only loads when its slide shows).
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const i = slides.indexOf(entry.target);
      entry.target.classList.toggle("is-active", entry.isIntersecting);
      dots[i].classList.toggle("active", entry.isIntersecting);
      if (entry.isIntersecting) loadGif(entry.target);
    });
  }, { root: track, threshold: 0.6 });
  slides.forEach((s) => activeObserver.observe(s));

  // Upgrade the first slide's GIF as soon as the carousel scrolls into view.
  new IntersectionObserver((entries, obs) => {
    if (entries.some((e) => e.isIntersecting)) {
      loadGif(slides[0]);
      obs.disconnect();
    }
  }, { threshold: 0.2 }).observe(kalimaCarousel);

  // Mouse drag-to-swipe (touch uses native scrolling + snap).
  let dragging = false, moved = false, downX = 0, startLeft = 0;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    dragging = true; moved = false;
    downX = e.clientX; startLeft = track.scrollLeft;
    track.classList.add("dragging");
  });
  addEventListener("pointermove", (e) => {
    if (!dragging) return;
    if (Math.abs(e.clientX - downX) > 4) moved = true;
    track.scrollLeft = startLeft - (e.clientX - downX);
  });
  addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    const center = track.scrollLeft + track.clientWidth / 2;
    const nearest = slides.reduce((a, s) =>
      Math.abs(s.offsetLeft + s.clientWidth / 2 - center) <
      Math.abs(a.offsetLeft + a.clientWidth / 2 - center) ? s : a);
    centerOn(nearest);
    setTimeout(() => track.classList.remove("dragging"), 500);
  });
  track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
}

// Scroll-scrubbed intro: About paragraphs brighten word by word as you scroll.
if (!reducedMotion && CSS.supports("animation-timeline: view()")) {
  document.querySelectorAll("#about > p").forEach((p) => {
    [...p.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const s = document.createElement("span");
            s.className = "scrub-word";
            s.textContent = part;
            frag.appendChild(s);
          }
        });
        p.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.classList.add("scrub-word");
      }
    });
  });
}

// Live stats: current GitHub / Stack Overflow numbers, cached for 12h in
// localStorage and fetched at idle. Hardcoded markup values are the fallback.
(() => {
  const kFmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${n}`);

  const apply = (s) => {
    if (!s) return;
    const repos = document.getElementById("stat-repos");
    if (repos && s.repos > 0) repos.textContent = `${s.repos}`;
    const so = document.getElementById("stat-so");
    if (so && s.rep > 0) {
      const dot = (cls) => {
        const el = document.createElement("span");
        el.className = `badge-dot ${cls}`;
        return el;
      };
      so.replaceChildren(
        `${kFmt(s.rep)} · ${s.gold}`, dot("gold"),
        `${s.silver}`, dot("silver"),
        `${s.bronze}`, dot("bronze")
      );
    }
  };

  let cached = null;
  try { cached = JSON.parse(localStorage.getItem("live-stats")); } catch { /* ignore */ }
  apply(cached);
  if (cached && Date.now() - cached.t < 12 * 60 * 60 * 1000) return;

  const refresh = async () => {
    const next = { ...(cached || {}), t: Date.now() };
    try {
      const r = await fetch("https://api.github.com/users/devrath");
      if (r.ok) next.repos = (await r.json()).public_repos;
    } catch { /* keep fallback */ }
    try {
      const r = await fetch("https://api.stackexchange.com/2.3/users/1083093?site=stackoverflow");
      if (r.ok) {
        const u = ((await r.json()).items || [])[0];
        if (u && u.badge_counts) {
          next.rep = u.reputation;
          next.gold = u.badge_counts.gold;
          next.silver = u.badge_counts.silver;
          next.bronze = u.badge_counts.bronze;
        }
      }
    } catch { /* keep fallback */ }
    apply(next);
    try { localStorage.setItem("live-stats", JSON.stringify(next)); } catch { /* ignore */ }
  };

  ("requestIdleCallback" in window ? requestIdleCallback : (f) => setTimeout(f, 2500))(refresh);
})();

// Footer year: always current.
const footerYear = document.getElementById("footer-year");
if (footerYear) footerYear.textContent = new Date().getFullYear();

// Hover-prefetch: warm a case-study page when the pointer enters its card/row,
// so the click (with its view-transition morph) lands on a cached document.
(() => {
  const seen = new Set();
  const warm = (href) => {
    if (!href || seen.has(href) || /^https?:/.test(href)) return;
    seen.add(href);
    const l = document.createElement("link");
    l.rel = "prefetch";
    l.href = href;
    document.head.appendChild(l);
  };
  document.querySelectorAll('#projects a[href$=".html"], .mini-projects a[href$=".html"]').forEach((a) => {
    a.addEventListener("pointerenter", () => warm(a.getAttribute("href")), { once: true });
    a.addEventListener("focus", () => warm(a.getAttribute("href")), { once: true });
  });
})();

// Click-to-copy email on the hero mail icon, with a toast. "Say hello" still
// opens the mail client; the icon copies (falls back to mailto if no clipboard).
(() => {
  const EMAIL = "devrath.dev595@gmail.com";
  const toast = document.getElementById("copy-toast");
  let hideT = null;
  const flash = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(hideT);
    hideT = setTimeout(() => toast.classList.remove("show"), 1800);
  };
  document.querySelectorAll('.socials a[href^="mailto:"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      if (!navigator.clipboard) return; // let the mailto proceed
      e.preventDefault();
      navigator.clipboard.writeText(EMAIL).then(
        () => flash("Email copied ✓"),
        () => { location.href = a.getAttribute("href"); }
      );
    });
  });
})();
