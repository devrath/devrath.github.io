// Cursor spotlight
const spotlight = document.getElementById("spotlight");
window.addEventListener("mousemove", (e) => {
  spotlight.style.setProperty("--x", `${e.clientX}px`);
  spotlight.style.setProperty("--y", `${e.clientY}px`);
});

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

function renderRecommendations() {
  if (!RECOMMENDATIONS.length) return; // fallback text stays visible

  const carousel = document.getElementById("reco-carousel");
  const track = document.getElementById("reco-track");
  const fallback = document.getElementById("reco-fallback");

  // Two copies of the list make the marquee loop seamless.
  [...RECOMMENDATIONS, ...RECOMMENDATIONS].forEach((rec) => {
    const card = document.createElement("article");
    card.className = "reco-card";

    const quote = document.createElement("blockquote");
    quote.textContent = `“${rec.text}”`;

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
    card.append(quote, meta);
    track.appendChild(card);
  });

  // ~12s of scroll per card keeps long quotes readable.
  track.style.setProperty("--reco-dur", `${RECOMMENDATIONS.length * 12}s`);
  carousel.hidden = false;
  if (fallback) fallback.hidden = true;
}

renderRecommendations();

// Scroll-reveal: fade sections and cards up as they enter the viewport.
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealTargets = document.querySelectorAll(
    "section, .honor-list li, .tl-node, .stat"
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

// Intro loader: hexagon draws, letter fades in, overlay melts away.
const loader = document.getElementById("loader");
if (loader) {
  const dismiss = () => {
    loader.classList.add("done");
    document.body.classList.remove("loading");
    setTimeout(() => loader.remove(), 450);
  };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    dismiss();
  } else {
    setTimeout(() => {
      dismiss();
      document.body.classList.add("cascade"); // hero elements rise in sequence
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

// Live Bengaluru clock in the footer.
const localTime = document.getElementById("local-time");
if (localTime) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
  });
  const tickClock = () => { localTime.textContent = `${fmt.format(new Date())} IST, Bengaluru`; };
  tickClock();
  setInterval(tickClock, 15000);
}

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

// Trailer blur-up: keep the tiny poster visible until the GIF has loaded.
const trailerImg = document.querySelector(".project-cover video, .project-cover img");
if (trailerImg) {
  const ready = trailerImg.tagName === "VIDEO" ? trailerImg.readyState >= 2 : trailerImg.complete;
  if (!ready) {
    trailerImg.classList.add("gif-loading");
    const evt = trailerImg.tagName === "VIDEO" ? "loadeddata" : "load";
    trailerImg.addEventListener(evt, () => trailerImg.classList.remove("gif-loading"), { once: true });
  }
  if (trailerImg.tagName === "VIDEO" && reducedMotion) trailerImg.pause();
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
