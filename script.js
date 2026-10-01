// ===== Theme toggle =====
const root = document.documentElement;
const toggle = document.getElementById("themeToggle");
toggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

// ===== Mobile menu =====
const burger = document.getElementById("burger");
const links = document.querySelector(".nav__links");
burger.addEventListener("click", () => links.classList.toggle("open"));
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => links.classList.remove("open"))
);

// ===== Nav shadow on scroll =====
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// ===== Reveal on scroll =====
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 60}ms`;
  io.observe(el);
});

// ===== Count-up stats =====
const counters = document.querySelectorAll("[data-count]");
const countIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      let cur = 0;
      const step = Math.max(1, Math.round(target / 28));
      const tick = () => {
        cur += step;
        if (cur >= target) {
          el.textContent = target + "+";
        } else {
          el.textContent = cur;
          requestAnimationFrame(tick);
        }
      };
      tick();
      countIO.unobserve(el);
    });
  },
  { threshold: 0.5 }
);
counters.forEach((c) => countIO.observe(c));

// ===== Notion database =====
(async () => {
  const grid = document.getElementById("notionGrid");
  const status = document.getElementById("notionStatus");
  if (!grid) return;

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  try {
    const res = await fetch("/api/notion");
    if (!res.ok) throw new Error("request failed");
    const { items } = await res.json();

    if (!items || !items.length) {
      status.textContent = "표시할 항목이 없습니다.";
      return;
    }

    status.remove();
    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "notion-card";
      const fieldsHtml = item.fields
        .map((f) =>
          f.type === "multi"
            ? f.value.map((v) => `<span>${escapeHtml(v)}</span>`).join("")
            : `<span>${escapeHtml(f.value)}</span>`
        )
        .join("");
      card.innerHTML = `
        <a class="notion-card__link" href="${item.url}" target="_blank" rel="noopener">
          <h3>${escapeHtml(item.title || "제목 없음")}</h3>
          <div class="notion-fields">${fieldsHtml}</div>
        </a>`;
      grid.appendChild(card);
    });
  } catch (err) {
    status.textContent = "데이터를 불러오지 못했습니다.";
  }
})();

// ===== Footer year =====
document.getElementById("year").textContent = new Date().getFullYear();
