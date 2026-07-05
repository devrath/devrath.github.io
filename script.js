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
      navLinks.forEach((link) =>
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        )
      );
    });
  },
  { rootMargin: "-30% 0px -60% 0px" }
);

sections.forEach((section) => section && observer.observe(section));

// ---------------------------------------------------------------------------
// Recommendations — add entries here and they render as an auto-scrolling
// carousel. Every field is shown on the card.
//
// {
//   text: "The recommendation text…",
//   name: "Recommender Name",
//   title: "Their Title · Their Company",
//   relationship: "Managed Devrath directly",   // how you worked together
//   date: "March 2024",                          // when it was written
// }
// ---------------------------------------------------------------------------
const RECOMMENDATIONS = [];

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

  // ~10s of scroll per card keeps the pace readable at any count.
  track.style.setProperty("--reco-dur", `${RECOMMENDATIONS.length * 10}s`);
  carousel.hidden = false;
  if (fallback) fallback.hidden = true;
}

renderRecommendations();
