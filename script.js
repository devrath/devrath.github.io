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
