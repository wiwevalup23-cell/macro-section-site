const navLinks = Array.from(document.querySelectorAll(".ticket-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-18% 0px -58% 0px", threshold: [0.08, 0.2, 0.5] }
);

sections.forEach((section) => observer.observe(section));

const topButton = document.querySelector(".top-button");

window.addEventListener("scroll", () => {
  topButton.classList.toggle("is-visible", window.scrollY > 700);
});

topButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const canvas = document.querySelector("#mmd-chart");
const shortInput = document.querySelector("#short-count");
const longInput = document.querySelector("#long-count");
const shortValue = document.querySelector("#short-count-value");
const longValue = document.querySelector("#long-count-value");
const stats = document.querySelector("#mmd-stats");

function fraction(value, total) {
  return total === 0 ? 0 : value / total;
}

function format(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function renderStats(items) {
  stats.innerHTML = items
    .map(
      ([label, value]) => `
        <div>
          <dt>${label}</dt>
          <dd>${value}</dd>
        </div>
      `
    )
    .join("");
}

function drawMmdChart() {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const shortCount = Number(shortInput.value);
  const longCount = Number(longInput.value);
  const shortLength = 1;
  const longLength = 10;
  const totalCount = shortCount + longCount;
  const totalMass = shortCount * shortLength + longCount * longLength;

  const nShort = fraction(shortCount, totalCount);
  const nLong = fraction(longCount, totalCount);
  const wShort = fraction(shortCount * shortLength, totalMass);
  const wLong = fraction(longCount * longLength, totalMass);

  const pn = totalMass / totalCount;
  const pw =
    (shortCount * shortLength * shortLength + longCount * longLength * longLength) /
    totalMass;
  const dispersity = pw / pn;

  shortValue.textContent = shortCount;
  longValue.textContent = longCount;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const padding = { left: 58, right: 28, top: 26, bottom: 52 };
  const chartW = canvas.width - padding.left - padding.right;
  const chartH = canvas.height - padding.top - padding.bottom;

  ctx.strokeStyle = "#202326";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + chartH);
  ctx.lineTo(padding.left + chartW, padding.top + chartH);
  ctx.stroke();

  ctx.fillStyle = "#5d625c";
  ctx.font = "16px Georgia, serif";
  ctx.fillText("доля", 14, padding.top + 10);
  ctx.fillText("l = 1", padding.left + chartW * 0.23, padding.top + chartH + 32);
  ctx.fillText("l = 10", padding.left + chartW * 0.72, padding.top + chartH + 32);

  [0, 0.25, 0.5, 0.75, 1].forEach((tick) => {
    const y = padding.top + chartH - tick * chartH;
    ctx.strokeStyle = tick === 0 ? "#202326" : "#ddd0b8";
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();
    ctx.fillStyle = "#5d625c";
    ctx.font = "13px Georgia, serif";
    ctx.fillText(tick.toFixed(2).replace("0.", "."), 22, y + 4);
  });

  const groups = [
    { x: padding.left + chartW * 0.28, n: nShort, w: wShort },
    { x: padding.left + chartW * 0.74, n: nLong, w: wLong },
  ];

  groups.forEach((group) => {
    const barW = 64;
    const nH = group.n * chartH;
    const wH = group.w * chartH;

    ctx.fillStyle = "rgba(33, 95, 122, 0.72)";
    ctx.fillRect(group.x - barW - 4, padding.top + chartH - nH, barW, nH);

    ctx.fillStyle = "rgba(178, 129, 52, 0.76)";
    ctx.fillRect(group.x + 4, padding.top + chartH - wH, barW, wH);
  });

  ctx.fillStyle = "#215f7a";
  ctx.fillRect(padding.left + 12, padding.top + 8, 18, 14);
  ctx.fillStyle = "#202326";
  ctx.font = "15px Georgia, serif";
  ctx.fillText("числовая доля fN", padding.left + 38, padding.top + 20);
  ctx.fillStyle = "#b28134";
  ctx.fillRect(padding.left + 190, padding.top + 8, 18, 14);
  ctx.fillStyle = "#202326";
  ctx.fillText("весовая доля fW", padding.left + 216, padding.top + 20);

  renderStats([
    ["PN", format(pn)],
    ["PW", format(pw)],
    ["K = PW/PN", format(dispersity)],
    ["масса всего", format(totalMass)],
  ]);
}

[shortInput, longInput].forEach((input) => {
  if (input) input.addEventListener("input", drawMmdChart);
});

drawMmdChart();
