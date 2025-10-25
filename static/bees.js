// Bienen: bewegen sich nur beim aktiven Scrollen, entgegen der Scrollrichtung
(function () {
  const layer = document.getElementById("bee-layer");
  if (!layer) return;

  const beeSrc = layer.getAttribute("data-bee-src") || "/static/img/bee.png";
  const NUM_BEES = 14;
  const bees = [];
  let lastY = window.scrollY;

  function rand(a, b) { return Math.random() * (b - a) + a; }

  // Bienen als <img> aus deinem Bild erzeugen
  for (let i = 0; i < NUM_BEES; i++) {
    const img = document.createElement("img");
    img.src = beeSrc;
    img.alt = "";
    img.className = "bee";
    layer.appendChild(img);

    const bee = {
      el: img,
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      rot: rand(-10, 10)
    };
    bees.push(bee);
    img.style.transform = `translate(${bee.x}px, ${bee.y}px) rotate(${bee.rot}deg)`;
  }

  // nur bei Scroll aktualisieren
  function onScroll() {
    const y = window.scrollY;
    const dy = y - lastY;   // + -> nach unten gescrollt
    lastY = y;

    for (const b of bees) {
      // invertiert: runter scrollen -> bienen nach oben
      b.y -= dy * 0.6;                       // Faktor = Geschwindigkeit
      b.x += (Math.random() - 0.5) * 4;      // sanftes seitliches Wackeln
      b.rot += (Math.random() - 0.5) * 2;    // minimale Drehung

      // Wrap an den Rändern
      if (b.x < -60) b.x = window.innerWidth + 30;
      if (b.x > window.innerWidth + 60) b.x = -30;
      if (b.y < -60) b.y = window.innerHeight + 30;
      if (b.y > window.innerHeight + 60) b.y = -30;

      b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg)`;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener("resize", () => {
    for (const b of bees) {
      b.x = Math.min(b.x, window.innerWidth);
      b.y = Math.min(b.y, window.innerHeight);
    }
  });
})();