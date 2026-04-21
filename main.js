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


/* ---------------------------
   Typewriter: Spécialisation Master (FR / EN + reset)
---------------------------- */
(function initUsthbMasterTypewriters() {
  // 1) Spécialisation
  const specEl = document.querySelector(".usthb-master-typewriter");
  // 2) Classement
  const rankEl = document.querySelector(".usthb-ranking-typewriter");

  if (!specEl && !rankEl) return;

  const typewriterPhrases = {
    // Affichage après "Spécialisation dans"
    fr: {
      spec: [
        "la conception de systèmes embarqués et de systèmes informatiques fiables et robustes.",
        "le développement de systèmes de contrôle et d’automatisation.",
        "l’optimisation des performances en temps réel.",
      ],
      rank: [
    "parmi les meilleures universités du pays.",
    "1ère au niveau maghrébin en génie électrique et électronique.",
    "parmi les 401–450 meilleures universités au monde en génie électrique et électronique.",
    "1ère au niveau maghrébin en informatique et systèmes d’information.",
    "parmi les 401–450 meilleures universités au monde en informatique et systèmes d’information."
      ]
    },
    // Display after "Specialized in"
    en: {
      spec: [
        "design of reliable and robust embedded and computer systems.",
        "development of control and automation systems.",
        "optimization of real-time performance.",
      ],
      rank: [
    "among the leading universities in the country.",
    "ranked first in the Maghreb in Electrical and Electronic Engineering.",
    "ranked among the world’s top 401–450 universities in Electrical and Electronic Engineering.",
    "ranked first in the Maghreb in Computer Science and Information Systems.",
    "ranked among the world’s top 401–450 universities in Computer Science and Information Systems."
      ]
    }
  };

  const lang = document.documentElement.lang === "en" ? "en" : "fr";

  function createTypewriter(el, phrases) {
    if (!el) return;

    let pIdx = 0;
    let cIdx = 0;
    let deleting = false;
    let timerId = null;

    function step() {
      const current = phrases[pIdx];

      if (!deleting) {
        cIdx++;
        el.textContent = current.slice(0, cIdx);

        if (cIdx >= current.length) {
          deleting = true;
          timerId = setTimeout(step, 1200);
          return;
        }
        timerId = setTimeout(step, 45);
      } else {
        cIdx--;
        el.textContent = current.slice(0, cIdx);

        if (cIdx <= 0) {
          deleting = false;
          pIdx = (pIdx + 1) % phrases.length;
          timerId = setTimeout(step, 250);
          return;
        }
        timerId = setTimeout(step, 25);
      }
    }

    function reset() {
      clearTimeout(timerId);
      pIdx = 0;
      cIdx = 0;
      deleting = false;
      el.textContent = "";
      timerId = setTimeout(step, 250);
    }

    // Démarrage
    timerId = setTimeout(step, 600);

    return reset;
  }

  // Instanciation
  const resetSpec = createTypewriter(specEl, typewriterPhrases[lang].spec);
  const resetRank = createTypewriter(rankEl, typewriterPhrases[lang].rank);

  // Si ton site déclenche un reset global (comme dans ton script précédent)
  const previousReset = window.__twReset;
  window.__twReset = function () {
    if (typeof previousReset === "function") previousReset();
    if (typeof resetSpec === "function") resetSpec();
    if (typeof resetRank === "function") resetRank();
  };
})();

/* ---------------------------
   Typewriter: Spécialisation Licence (FR / EN + reset)
---------------------------- */
(function () {
  // Helpers
  const getLang = () =>
    (document.documentElement.lang || "fr").toLowerCase().startsWith("en") ? "en" : "fr";

  const lang = getLang();

  // ====== Specialization typewriter ======
  const specEl = document.querySelector(".usthb-lic-specialization-typewriter");
  if (specEl) {
    const specializationTexts = {
      fr: [
        "la conception et l’analyse de systèmes.",
        "le traitement de l’information et l’automatisation.",
        "le contrôle et la sécurité des systèmes."
      ],
      en: [
        "system design and analysis.",
        "information processing and automation.",
        "system control and security."
      ]
    };
    const phrases = specializationTexts[lang] || specializationTexts.fr;

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer = null;

    function tick() {
      const current = phrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        specEl.textContent = current.slice(0, charIndex);

        if (charIndex >= current.length) {
          deleting = true;
          timer = setTimeout(tick, 1200);
          return;
        }
        timer = setTimeout(tick, 35);
      } else {
        charIndex--;
        specEl.textContent = current.slice(0, charIndex);

        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
        timer = setTimeout(tick, 20);
      }
    }

    function reset() {
      if (timer) clearTimeout(timer);
      phraseIndex = 0;
      charIndex = 0;
      deleting = false;
      specEl.textContent = "";
      timer = setTimeout(tick, 300);
    }

    reset();
  }

  // ====== Ranking typewriter ======
  const rankEl = document.querySelector(".usthb-lic-ranking-typewriter");
  if (rankEl) {
    const rankTexts = {
      fr: [
        "parmi les meilleures universités du pays",
        "reconnue pour la qualité de ses formations",
        "et son expertise en recherche scientifique",
        "avec une forte attractivité académique"
      ],
      en: [
        "among the leading universities in the country",
        "recognized for the quality of its programs",
        "and its expertise in scientific research",
        "with strong academic attractiveness"
      ]
    };

    const phrases = rankTexts[lang] || rankTexts.fr;

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer = null;

    function tickRank() {
      const current = phrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        rankEl.textContent = current.slice(0, charIndex);

        if (charIndex >= current.length) {
          deleting = true;
          timer = setTimeout(tickRank, 1100);
          return;
        }
        timer = setTimeout(tickRank, 35);
      } else {
        charIndex--;
        rankEl.textContent = current.slice(0, charIndex);

        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
        timer = setTimeout(tickRank, 20);
      }
    }

    function resetRank() {
      if (timer) clearTimeout(timer);
      phraseIndex = 0;
      charIndex = 0;
      deleting = false;
      rankEl.textContent = "";
      timer = setTimeout(tickRank, 250);
    }

    resetRank();
  }
})();


/* ---------------------------
   Typewriter: Esic (FR / EN + reset)
---------------------------- */
(function initEsicRncpTypewriter() {
  const el = document.querySelector(".rncp-objectif-typewriter");
  if (!el) return;

  const typewriterPhrases = {
    fr: [
      "gérer des systèmes d'information complexes.",
      "concevoir des solutions informatiques sécurisées.",
      "diriger des projets informatiques.",
      "s'adapter aux évolutions technologiques."
    ],
    en: [
      "manage complex information systems.",
      "design secure IT solutions.",
      "lead IT projects.",
      "adapt to technological evolutions."
    ]
  };

  let phrases = typewriterPhrases[
    document.documentElement.lang === "en" ? "en" : "fr"
  ];

  let pIdx = 0;
  let cIdx = 0;
  let deleting = false;
  let timerId = null;

  function step() {
    const current = phrases[pIdx];

    if (!deleting) {
      cIdx++;
      el.textContent = current.slice(0, cIdx);

      if (cIdx >= current.length) {
        deleting = true;
        timerId = setTimeout(step, 1200);
        return;
      }
      timerId = setTimeout(step, 45);
    } else {
      cIdx--;
      el.textContent = current.slice(0, cIdx);

      if (cIdx <= 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
        timerId = setTimeout(step, 250);
        return;
      }
      timerId = setTimeout(step, 25);
    }
  }

  function resetTypewriterForLang() {
    clearTimeout(timerId);
    phrases = typewriterPhrases[
      document.documentElement.lang === "en" ? "en" : "fr"
    ];
    pIdx = 0;
    cIdx = 0;
    deleting = false;
    el.textContent = "";
    timerId = setTimeout(step, 250);
  }

  const previousReset = window.__twReset;
  window.__twReset = function () {
    if (typeof previousReset === "function") previousReset();
    resetTypewriterForLang();
  };

  timerId = setTimeout(step, 600);
})();

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

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".exp-filter");
  const cards = document.querySelectorAll(".experience-card");

  function applyFilter(filter) {
    cards.forEach(card => {
      const type = card.getAttribute("data-type");

      // show all
      if (filter === "all") {
        card.style.display = "";
        return;
      }

      // show matching
      card.style.display = (type === filter) ? "" : "none";
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // active class
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter") || "all";
      applyFilter(filter);
    });
  });

  // initial
  applyFilter("all");
});
