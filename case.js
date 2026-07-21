// Reading-progress bar for case-study pages.
(() => {
  const bar = document.getElementById("cs-progress");
  if (!bar) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? Math.min(100, (scrollY / h) * 100) : 0) + "%";
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", update);
  update();
})();
