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

// ===== Project preview slideshow (cycles while hovered) =====
document.querySelectorAll("[data-slides]").forEach((preview) => {
  const card = preview.closest(".project");
  const imgs = preview.querySelectorAll(".project__slides img");
  const bg = preview.querySelector(".project__preview-bg");
  const label = preview.querySelector(".project__slide-label");
  let idx = 0;
  let timer = null;
  let resetTimer = null;
  const show = (i) => {
    imgs[idx].classList.remove("on");
    idx = i;
    imgs[idx].classList.add("on");
    bg.style.backgroundImage = `url('${imgs[idx].getAttribute("src")}')`;
    label.textContent = imgs[idx].dataset.label;
  };
  card.addEventListener("mouseenter", () => {
    clearTimeout(resetTimer);
    timer = setInterval(() => show((idx + 1) % imgs.length), 1000);
  });
  card.addEventListener("mouseleave", () => {
    clearInterval(timer);
    // 미리보기가 사라진 뒤 첫 화면으로 되돌린다
    resetTimer = setTimeout(() => show(0), 300);
  });
});

// ===== Footer year =====
document.getElementById("year").textContent = new Date().getFullYear();
