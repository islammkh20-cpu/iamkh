/* ============================================================
   HELPERS
============================================================ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ============================================================
   READING BAR
============================================================ */
const readingBar = $("#readingBar");

function updateReadingBar() {
  if (!readingBar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  readingBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + "%";
}

/* ============================================================
   CUSTOM CURSOR
============================================================ */
const cursorDot = $(".cursor-dot");
const cursorRing = $(".cursor-ring");
const canUseCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (cursorDot && cursorRing && canUseCustomCursor) {
  document.addEventListener("mousemove", (e) => {
    const x = e.clientX + "px";
    const y = e.clientY + "px";
    cursorDot.style.left = x;
    cursorDot.style.top = y;
    cursorRing.style.left = x;
    cursorRing.style.top = y;
  });

  $$("a, button, .hero-card, .skills-card").forEach(el => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("hovered"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("hovered"));
  });
}

/* ============================================================
   THEME TOGGLE
============================================================ */
const themeToggle = $("#themeToggle");
const themeIcon = themeToggle?.querySelector(".theme-icon");
const themeLabel = themeToggle?.querySelector(".theme-label");

(function initTheme() {
  const savedTheme = localStorage.getItem("portfolio-theme");
  const isLight = savedTheme === "light";

  document.body.classList.toggle("light-mode", isLight);
  if (themeIcon) themeIcon.textContent = isLight ? "🌙" : "☀️";
  if (themeLabel) themeLabel.textContent = isLight ? "Dark" : "Light";
})();

themeToggle?.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light-mode");
  if (themeIcon) themeIcon.textContent = isLight ? "🌙" : "☀️";
  if (themeLabel) themeLabel.textContent = isLight ? "Dark" : "Light";
  localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
});

/* ============================================================
   GREETING DYNAMIQUE
============================================================ */
function updateGreeting(lang) {
  const greetingEl = $("#greetingText");
  if (!greetingEl) return;

  const hour = new Date().getHours();
  const greetings = {
    fr: {
      morning: " Bienvenue dans mon portfolio ☀️",
      afternoon: " Bienvenue dans mon portfolio 🌤️",
      evening: " Bienvenue dans mon portfolio 🌙",
      night: " Bienvenue dans mon portfolio 🌟",
    },
    en: {
      morning: " Welcome to my portfolio ☀️",
      afternoon: " Welcome to my portfolio 🌤️",
      evening: " Welcome to my portfolio 🌙",
      night: " Welcome to my portfolio 🌟",
    },
  };

  let period = "night";
  if (hour >= 6 && hour < 12) period = "morning";
  else if (hour >= 12 && hour < 18) period = "afternoon";
  else if (hour >= 18 && hour < 22) period = "evening";

  const safeLang = lang === "en" ? "en" : "fr";
  greetingEl.textContent = greetings[safeLang][period];
}

/* ============================================================
   LANGUAGE TOGGLE (FR / EN)
============================================================ */
const langToggle = $("#langToggle");

function applyLanguage(lang) {
  const safeLang = (lang === "fr" || lang === "en") ? lang : "fr";
  document.documentElement.lang = safeLang;

  $$("[data-fr][data-en]").forEach(el => {
    const value = safeLang === "fr" ? el.dataset.fr : el.dataset.en;
    if (!value) return;

    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.value = value;
    } else {
      el.innerHTML = value;
    }
  });

  const burger = $("#hamburger");
  if (burger) {
    const aria = safeLang === "fr" ? burger.dataset.frAria : burger.dataset.enAria;
    if (aria) burger.setAttribute("aria-label", aria);
  }

  $$("[data-lang]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === safeLang);
  });

  updateGreeting(safeLang);
  if (typeof window.__twReset === "function") window.__twReset();

  localStorage.setItem("siteLang", safeLang);
}

(function initLanguage() {
  const saved = localStorage.getItem("siteLang");
  const browserLang = navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
  applyLanguage(saved || browserLang || "fr");
})();

langToggle?.addEventListener("click", () => {
  const current = document.documentElement.lang === "en" ? "en" : "fr";
  const next = current === "fr" ? "en" : "fr";

  // on sauvegarde la nouvelle langue
  localStorage.setItem("siteLang", next);

  // rafraîchissement de la page
  window.location.reload();
});


/* ============================================================
   TYPEWRITER
============================================================ */
const typewriterEl = $(".typewriter-target");
const typewriterPhrases = {
  fr: [
    "étudiant en Master Systèmes d’Information et Sécurité",
    "alternant data analyst chez Orange",
  ],
  en: [
    "student in Master's degree in Information Systems and Security",
    "data analyst apprentice at Orange Business",
  ]
};

if (typewriterEl) {
  let phrases = typewriterPhrases[document.documentElement.lang === "en" ? "en" : "fr"];
  let pIdx = 0;
  let cIdx = 0;
  let deleting = false;
  let timerId = null;

  function step() {
    const current = phrases[pIdx];

    if (!deleting) {
      cIdx++;
      typewriterEl.textContent = current.slice(0, cIdx);
      if (cIdx >= current.length) {
        deleting = true;
        timerId = setTimeout(step, 1400);
        return;
      }
      timerId = setTimeout(step, 55);
    } else {
      cIdx--;
      typewriterEl.textContent = current.slice(0, cIdx);
      if (cIdx <= 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
        timerId = setTimeout(step, 250);
        return;
      }
      timerId = setTimeout(step, 30);
    }
  }

  function resetTypewriterForLang() {
    clearTimeout(timerId);
    phrases = typewriterPhrases[document.documentElement.lang === "en" ? "en" : "fr"];
    pIdx = 0;
    cIdx = 0;
    deleting = false;
    typewriterEl.textContent = "";
    timerId = setTimeout(step, 250);
  }

  window.__twReset = resetTypewriterForLang;
  timerId = setTimeout(step, 700);
}

/* ============================================================
   REVEAL (global observer)
============================================================ */
let revealObserver = null;

function initRevealObserver() {
  const revealEls = $$(".reveal-up");

  if ("IntersectionObserver" in window && revealEls.length > 0) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("revealed"));
  }
}

function bindRevealAnimations(scope = document) {
  if (!revealObserver) return;
  $$(".reveal-up:not(.is-visible)", scope).forEach(el => revealObserver.observe(el));
}

initRevealObserver();

/* ============================================================
   HAMBURGER
============================================================ */
const hamburger = $("#hamburger");
const nav = $("#nav");

hamburger?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(!!isOpen));
});

nav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    hamburger?.setAttribute("aria-expanded", "false");
  });
});

/* ============================================================
   SKILLS PROGRESS
============================================================ */
$$(".skills-category").forEach(category => {
  const items = $$("li[data-percent]", category);

  function fillBars() {
    items.forEach(item => {
      const val = Math.max(0, Math.min(100, parseInt(item.dataset.percent || "0", 10)));
      const bar = $(".progress-bar", item);
      const txt = $(".percent-text", item);
      if (bar) bar.style.width = val + "%";
      if (txt) txt.textContent = val + "%";
    });
  }

  function resetBars() {
    items.forEach(item => {
      const bar = $(".progress-bar", item);
      if (bar) bar.style.width = "0%";
    });
  }

  category.addEventListener("mouseenter", fillBars);
  category.addEventListener("mouseleave", resetBars);
  category.addEventListener("touchstart", fillBars, { passive: true });
});

/* ============================================================
   SCROLLSPY + SCROLL OPTI
============================================================ */
const sections = $$("section[id]");
const navLinks = $$(".nav a[href^='#']");

function setActiveNav() {
  let currentId = "";
  sections.forEach(s => {
    const r = s.getBoundingClientRect();
    if (r.top - 120 <= 0 && r.bottom - 120 > 0) currentId = s.id;
  });

  navLinks.forEach(link => {
    link.classList.toggle("active", currentId && link.getAttribute("href") === `#${currentId}`);
  });
}

let ticking = false;
function onScrollOptimized() {
  if (ticking) return;
  ticking = true;

  requestAnimationFrame(() => {
    updateReadingBar();
    setActiveNav();
    toggleBackToTop();
    ticking = false;
  });
}

window.addEventListener("scroll", onScrollOptimized, { passive: true });
window.addEventListener("load", () => {
  updateReadingBar();
  setActiveNav();
  toggleBackToTop();
});

const form = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
const submitBtn = form?.querySelector('button[type="submit"]');

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.querySelector("#name")?.value.trim();
    const email = form.querySelector("#email")?.value.trim();
    const message = form.querySelector("#message")?.value.trim();

    if (!name || !email || !message) {
      if (formNote) formNote.textContent = "Merci de remplir tous les champs.";
      return;
    }

    if (formNote) formNote.textContent = "Envoi en cours...";

    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    try {
      const formData = new FormData(form);

      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      // Formspree renvoie souvent JSON
      const data = await response.json().catch(() => null);

      if (response.ok) {
        if (formNote) formNote.textContent = "Message envoyé ✅";
        form.reset();
      } else {
        if (formNote)
          formNote.textContent = "Erreur : " + (data?.error || "Envoi impossible.");
      }
    } catch (err) {
      console.error(err);
      if (formNote) formNote.textContent = "Une erreur réseau s'est produite. Réessayez.";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText || "Envoyer";
      }
    }
  });
}

/* ============================================================
   FOOTER YEAR
============================================================ */
const yearNow = $("#yearNow");
if (yearNow) yearNow.textContent = new Date().getFullYear();

/* ============================================================
   BACK TO TOP
============================================================ */
const backToTop = $("#backToTop");

function toggleBackToTop() {
  if (!backToTop) return;
  backToTop.classList.toggle("show", window.scrollY > 450);
}

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ============================================================
   3D TILT EFFECT
============================================================ */
$$(".tilt-card").forEach(card => {
  const maxTilt = 8;

  function onMove(e) {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * (maxTilt * 2);
    const rotateX = (0.5 - py) * (maxTilt * 2);

    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
  }

  function resetTilt() {
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
  }

  card.addEventListener("mousemove", onMove);
  card.addEventListener("mouseleave", resetTilt);
  card.addEventListener("touchend", resetTilt, { passive: true });
});

/* ============================================================
   ONGOING PROGRESS ANIMATION
============================================================ */
const progressBars = $$(".progress-fill");

if ("IntersectionObserver" in window && progressBars.length) {
  const progressObs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      const val = Math.max(0, Math.min(100, parseInt(bar.dataset.progress || "0", 10)));
      bar.style.width = val + "%";
      observer.unobserve(bar);
    });
  }, { threshold: 0.35 });

  progressBars.forEach(bar => progressObs.observe(bar));
} else {
  progressBars.forEach(bar => {
    const val = Math.max(0, Math.min(100, parseInt(bar.dataset.progress || "0", 10)));
    bar.style.width = val + "%";

    
  });
}

/* ============================================================
   HERO 3D CONTROL
============================================================ */
const hero3D = $(".hero-3d");

function sync3DLang() {
  const current = document.documentElement.lang?.toLowerCase();
  if (current !== "fr" && current !== "en") {
    document.documentElement.lang = "fr";
  }
}

function update3DByViewport() {
  if (!hero3D) return;
  const isDesktop = window.matchMedia("(min-width: 993px)").matches;
  hero3D.style.display = isDesktop ? "" : "none";
}

function handleVisibility3D() {
  if (!hero3D) return;
  hero3D.classList.toggle("paused", document.hidden);
}

sync3DLang();
update3DByViewport();
handleVisibility3D();

window.addEventListener("resize", update3DByViewport, { passive: true });
document.addEventListener("visibilitychange", handleVisibility3D);
langToggle?.addEventListener("click", () => setTimeout(sync3DLang, 0));

/* ============================================================
   EXPERIENCE: TYPEWRITERS + FILTERS
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const langToggle = document.getElementById("langToggle");
  // langToggle n'est pas utilisé ici; je le laisse si tu l’utilises ailleurs

  /* ---------------------------
     1) Typewriter: spécialisation (FR / EN + reset)
  ---------------------------- */
  (function initExperienceTypewriter() {
    const target = document.querySelector(".experience-typewriter-target");
    if (!target) return;

    const wordsFR = [
    "Électronique embarquée",
    "Microcontrôleurs & C",
    "Systèmes temps réel",
    "Bus & Protocoles",
    "Conception FPGA"
    ];

    const wordsEN = [
    "Embedded Electronics",
    "Microcontrollers & C",
    "Real-Time Systems",
    "Buses & Protocols",
    "FPGA Design"
    ];

    let w = 0;
    let c = 0;
    let deleting = false;
    let timer = null;

    const getLang = () => (document.documentElement.lang === "en" ? "en" : "fr");
    const getWords = () => (getLang() === "en" ? wordsEN : wordsFR);

    function clearTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function tick() {
      const words = getWords();

      if (w >= words.length) w = 0;
      const word = words[w];

      if (!deleting) {
        c++;
        target.textContent = word.slice(0, c);

        if (c === word.length) {
          deleting = true;
          timer = setTimeout(tick, 1100);
          return;
        }
      } else {
        c--;
        target.textContent = word.slice(0, c);

        if (c === 0) {
          deleting = false;
          w = (w + 1) % words.length;
        }
      }

      timer = setTimeout(tick, deleting ? 45 : 75);
    }

    function resetExperienceTypewriter() {
      clearTimer();
      w = 0;
      c = 0;
      deleting = false;
      target.textContent = "";
      tick();
    }

    // chaînage avec d'éventuels autres resets (lang change)
    const previousReset = window.__twReset;
    window.__twReset = function () {
      if (typeof previousReset === "function") previousReset();
      resetExperienceTypewriter();
    };

    tick();
  })();


  /* ---------------------------
     2) Typewriter: classement USTHB (FR / EN + reset)
  ---------------------------- */
  (function initAcademicRankingTypewriter() {
    const target = document.querySelector(".experience-ranking-typewriter");
    if (!target) return;

    const textsFR = [
    "1ère au niveau maghrébin en génie électrique et électronique.",
    "parmi les 401–450 meilleures universités au monde en génie électrique et électronique.",
    "1ère au niveau maghrébin en informatique et systèmes d’information.",
    "parmi les 401–450 meilleures universités au monde en informatique et systèmes d’information."
    ];

    const textsEN = [
    "ranked first in the Maghreb in Electrical and Electronic Engineering.",
    "ranked among the world’s top 401–450 universities in Electrical and Electronic Engineering.",
    "ranked first in the Maghreb in Computer Science and Information Systems.",
    "ranked among the world’s top 401–450 universities in Computer Science and Information Systems."
    ];

    let i = 0;
    let j = 0;
    let deleting = false;
    let timer = null;

    const getLang = () => (document.documentElement.lang === "en" ? "en" : "fr");
    const getTexts = () => (getLang() === "en" ? textsEN : textsFR);

    function clearTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function tick() {
      const texts = getTexts();

      if (i >= texts.length) i = 0;
      const current = texts[i];

      if (!deleting) {
        j++;
        target.textContent = current.slice(0, j);

        if (j === current.length) {
          deleting = true;
          timer = setTimeout(tick, 1500);
          return;
        }
      } else {
        j--;
        target.textContent = current.slice(0, j);

        if (j === 0) {
          deleting = false;
          i = (i + 1) % texts.length;
        }
      }

      timer = setTimeout(tick, deleting ? 20 : 32);
    }

    function resetRankingTypewriter() {
      clearTimer();
      i = 0;
      j = 0;
      deleting = false;
      target.textContent = "";
      tick();
    }

    const previousReset = window.__twReset;
    window.__twReset = function () {
      if (typeof previousReset === "function") previousReset();
      resetRankingTypewriter();
    };

    tick();
  })();


/* ---------------------------
     RNCP 39394 Typewriter (FR / EN + reset)
  ---------------------------- */
(function initRncpObjectifTypewriter() {
  const target = document.querySelector(".rncp-objectif-typewriter");
  if (!target) return;

  const objectifsFR = [
    "gérer des systèmes d’information complexes.",
    "maîtriser la cybersécurité.",
    "concevoir des solutions informatiques sécurisées.",
    "diriger des projets informatiques.",
    "s’adapter aux évolutions technologiques."
  ];

  const objectifsEN = [
    "manage complex information systems.",
    "master cybersecurity.",
    "design secure IT solutions.",
    "lead IT projects.",
    "adapt to technological evolutions."
  ];

  let i = 0, j = 0, deleting = false, timer = null;

  const getLang = () => (document.documentElement.lang === "en" ? "en" : "fr");
  const getTexts = () => (getLang() === "en" ? objectifsEN : objectifsFR);

  function clearTimer() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  function tick() {
    const texts = getTexts();
    if (i >= texts.length) i = 0;

    const current = texts[i];

    if (!deleting) {
      j++;
      target.textContent = current.slice(0, j);

      if (j === current.length) {
        deleting = true;
        timer = setTimeout(tick, 1100);
        return;
      }
    } else {
      j--;
      target.textContent = current.slice(0, j);

      if (j === 0) {
        deleting = false;
        i = (i + 1) % texts.length;
      }
    }

    timer = setTimeout(tick, deleting ? 25 : 55);
  }

  function resetRncpObjectifTypewriter() {
    clearTimer();
    i = 0; j = 0; deleting = false;
    target.textContent = "";
    tick();
  }

  const previousReset = window.__twReset;
  window.__twReset = function () {
    if (typeof previousReset === "function") previousReset();
    resetRncpObjectifTypewriter();
  };

  tick();
})();

  /* ---------------------------
     3) Filtres expériences
  ---------------------------- */
  const filterButtons = document.querySelectorAll(".exp-filter");
  const cards = document.querySelectorAll(".experience-card");

  if (!filterButtons.length || !cards.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter?.trim();

      cards.forEach((card) => {
        const type = card.dataset.type?.trim();

        if (filter === "all" || type === filter) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });
});


  /* ---------------------------
     fenaitre 
  ---------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const cvLink = document.querySelector('a[href="cv/Mon-CV.pdf"]');
  const modal = document.getElementById("cvNoticeModal");
  const closeBtn = document.getElementById("cvNoticeClose");
  const dismissBtn = document.getElementById("cvNoticeDismiss");
  const goContactBtn = document.getElementById("cvNoticeGoContact");

  if (!cvLink || !modal) return;

  const openModal = () => {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  };

  cvLink.addEventListener("click", (e) => {
    e.preventDefault(); // empêche le téléchargement direct du PDF
    openModal();
  });

  closeBtn?.addEventListener("click", closeModal);
  dismissBtn?.addEventListener("click", closeModal);

  // Fermer quand on clique sur le fond
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Fermer au clic sur le lien contact
  goContactBtn?.addEventListener("click", closeModal);

  // Option accessibilité : ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") closeModal();
  });
});
