// Configuration des horaires - à modifier facilement ici
const HORARIOS = {
  default: [
    { start: "13:00", end: "16:00" },
    { start: "19:00", end: "24:00" }
  ],
  overrides: {
    5: [{ start: "19:00", end: "24:30" }],
    6: [{ start: "13:00", end: "16:00" }, { start: "19:00", end: "26:00" }],
    0: [{ start: "13:00", end: "16:00" }, { start: "19:00", end: "26:00" }]
  }
};

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function isOpenNow() {
  const now = new Date();
  const day = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const ranges = HORARIOS.overrides[day] || HORARIOS.default;
  return ranges.some(r => nowMin >= toMinutes(r.start) && nowMin < toMinutes(r.end));
}

function updateStatusBadge() {
  const el = document.getElementById("statusBadge");
  if (!el) return;
  if (isOpenNow()) {
    el.textContent = "🟢 ABIERTO";
  } else {
    el.textContent = "🔴 CERRADO";
  }
}

updateStatusBadge();
setInterval(updateStatusBadge, 60000);

function openLightbox(src) {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  img.src = src;
  box.classList.add("open");
}
function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
}
