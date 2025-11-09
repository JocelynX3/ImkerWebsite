// Sanfter fliegende Bienen mit langsamer Bewegung
(function () {
  const layer = document.getElementById("bee-layer");
  if (!layer) return;

  const NUM_BEES = 14;
  const bees = [];
  let lastScrollY = window.scrollY;

  const svg = `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="34" cy="34" rx="18" ry="12" fill="#F59E0B" stroke="#2F2A1F" stroke-width="3"/>
      <rect x="20" y="28" width="28" height="12" fill="none" stroke="#2F2A1F" stroke-width="3"/>
      <ellipse cx="22" cy="24" rx="10" ry="6" fill="#FFFFFFAA" stroke="#2F2A1F" stroke-width="2"/>
      <ellipse cx="46" cy="22" rx="10" ry="6" fill="#FFFFFFAA" stroke="#2F2A1F" stroke-width="2"/>
      <circle cx="16" cy="34" r="4" fill="#2F2A1F"/>
    </svg>`;

  function rand(a, b) { return Math.random() * (b - a) + a; }

  for (let i = 0; i < NUM_BEES; i++) {
    const el = document.createElement("div");
    el.className = "bee";
    el.innerHTML = svg;
    layer.appendChild(el);
    bees.push({
      el,
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      vx: rand(-0.06, 0.06),
      vy: rand(-0.02, 0.02),
      sway: rand(0.4, 1.0),
      rot: rand(0, 360)
    });
  }

  function tick() {
    const scrollY = window.scrollY;
    const scrollDelta = scrollY - lastScrollY;
    lastScrollY = scrollY;

    for (const b of bees) {
      b.vy += scrollDelta * 0.00025;
      b.vx += (Math.random() - 0.5) * 0.01;

      b.x += b.vx * 8;
      b.y += b.vy * 8 + Math.sin(performance.now() / 700 * b.sway) * 0.4;
      b.rot += b.vx * 12;

      if (b.x < -40) b.x = window.innerWidth + 20;
      if (b.x > window.innerWidth + 40) b.x = -20;
      if (b.y < -40) b.y = window.innerHeight + 20;
      if (b.y > window.innerHeight + 40) b.y = -20;

      b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg)`;
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => {
    for (const b of bees) {
      b.x = Math.min(b.x, window.innerWidth);
      b.y = Math.min(b.y, window.innerHeight);
    }
  });

  requestAnimationFrame(tick);
})();