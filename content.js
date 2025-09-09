import { gsap } from "gsap";
import { animateHeroEnter } from "./animations.js";

import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const wrap = document.querySelector(".overview .image-wrap");
const img = wrap?.querySelector("img");

function setupParallaxFor(wrapEl, imgEl, amount = 18) {
  if (!wrapEl || !imgEl) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.fromTo(
    imgEl,
    { yPercent: -amount },
    {
      yPercent: amount,
      ease: "none",
      scrollTrigger: {
        trigger: wrapEl,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );
}

function setupParallax() {
  if (!wrap || !img) return;
  setupParallaxFor(wrap, img, 18);
}

// ensure layout is correct after the image loads
if (img?.complete && img.naturalWidth) {
  setupParallax();
} else {
  img?.addEventListener("load", () => {
    setupParallax();
    ScrollTrigger.refresh();
  });
}

(async () => {
  const $ = (id) => document.getElementById(id);
  const section = (n) => document.querySelector(`#section-${n}`);
  const hide = (el) => {
    if (el) el.style.display = "none";
  };

  async function inlineSvg(url, targetEl) {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`Failed to load SVG: ${url}`);
    const svgText = await res.text();
    targetEl.innerHTML = svgText;
  }

  const params = new URLSearchParams(location.search);
  const slug = params.get("slug") || "exoApe";

  let data;
  try {
    data = await fetch("./content.json").then((r) => {
      if (!r.ok) throw new Error("content.json not found");
      return r.json();
    });
  } catch (e) {
    document.title = "Data error";
    $("pageTitle").textContent = "Data error";
    console.error(e);
    return;
  }

  const proj = data[slug];
  if (!proj) {
    document.title = "Project not found";
    $("pageTitle").textContent = "Project not found";
    const main = document.createElement("main");
    main.style.padding = "4rem 2rem";
    main.innerHTML = `<h1>Project not found</h1><p>No data for slug "<code>${slug}</code>".</p>`;
    document.body.appendChild(main);
    for (let i = 1; i <= 11; i++) hide(section(i));
    return;
  }

  document.title = `${proj.title}`;
  $("pageTitle").textContent = proj.title;

  if (proj.hero?.image) {
    $("heroImg").src = proj.hero.image;
    $("heroImg").alt = proj.title || "Hero";
  } else {
    hide(section(1));
  }
  $("heroTitle").textContent = proj.title || "";

  // Run entry animation for the first hero after image is ready
  const heroEl = section(1);
  const heroImgEl = $("heroImg");
  const runHeroAnim = () => animateHeroEnter(heroEl);
  if (heroImgEl?.complete && heroImgEl.naturalWidth) {
    runHeroAnim();
    // setup parallax matching overview
    setupParallaxFor(heroEl.querySelector(".slide-img"), heroImgEl, 18);
    ScrollTrigger.refresh();
  } else {
    heroImgEl?.addEventListener(
      "load",
      () => {
        runHeroAnim();
        setupParallaxFor(heroEl.querySelector(".slide-img"), heroImgEl, 18);
        ScrollTrigger.refresh();
      },
      { once: true }
    );
  }

  if (proj.overview) {
    $("overviewTitle").textContent = proj.overview.title || "Project Overview";
    $("overviewDesc").textContent = proj.overview.description || "";
    $("dateText").textContent = proj.overview.date || "";
    $("clientText").textContent = proj.overview.client || "";
    if (proj.overview.image) {
      $("overviewImg").src = proj.overview.image;
      $("overviewImg").alt = "Project preview";
    } else {
      $("overviewImg")?.remove();
    }

    const ul = $("servicesList");
    ul.innerHTML = "";
    (proj.overview.services || []).forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      ul.appendChild(li);
    });
  } else {
    hide(section(2));
  }

  if (proj.initialConcept) {
    $("initialTitle").textContent = proj.initialConcept.title || "Initial concepts";
    const paras = proj.initialConcept.paragraphs || [];
    $("initialP1").textContent = paras[0] || "";
    $("initialP2").textContent = paras[1] || "";
    if (proj.initialConcept.image) {
      $("initialImg").src = proj.initialConcept.image;
      $("initialImg").alt = "Initial concept image";
    } else {
      $("initialImg")?.remove();
    }
  } else {
    hide(section(3));
  }

  const media = Array.isArray(proj.media) ? proj.media : [];

  const takeNext = (type) => {
    const idx = media.findIndex((m) => m?.type === type && !m._used);
    if (idx === -1) return null;
    media[idx]._used = true;
    return media[idx];
  };

  const v1 = takeNext("video");
  if (v1?.src) {
    $("video1Src").src = v1.src;
    $("video1").load();
    // Animate video from fullscreen-like scale to CSS size on scroll
    const sec4 = section(4);
    const wrap4 = sec4?.querySelector(".video-wrap");
    const setupVideoAnim1 = () => {
      if (!wrap4) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = wrap4.getBoundingClientRect();
      // Calculate start scale so the element roughly covers the viewport
      const startScale = Math.max(window.innerWidth / Math.max(rect.width, 1), window.innerHeight / Math.max(rect.height, 1));
      gsap.set(wrap4, { willChange: "transform", overflow: "hidden" });
      gsap.fromTo(
        wrap4,
        { scale: Math.max(1.05, startScale), transformOrigin: "50% 50%" },
        {
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sec4,
            start: "top 80%",
            end: "top 30%",
            toggleActions: "play none none none",
            once: true,
          },
          immediateRender: false,
          onComplete: () => gsap.set(wrap4, { clearProps: "willChange" }),
        }
      );
    };
    // Ensure layout is stable before measuring
    requestAnimationFrame(() => setupVideoAnim1());
  } else {
    hide(section(4));
  }

  const img1 = takeNext("image");
  if (img1?.src) {
    $("chapterImg1").src = img1.src;
    $("chapterImg1").alt = "Project preview";
    // Scale-in reveal from fullscreen-like to CSS size on scroll for section 5
    const sec5 = section(5);
    const wrap5 = sec5?.querySelector(".image-wrap2");
    const imgEl5 = $("chapterImg1");
    const setupImgAnim1 = () => {
      if (!wrap5) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = wrap5.getBoundingClientRect();
      const startScale = Math.max(window.innerWidth / Math.max(rect.width, 1), window.innerHeight / Math.max(rect.height, 1));
      gsap.set(wrap5, { willChange: "transform" });
      gsap.fromTo(
        wrap5,
        { scale: Math.max(1.05, startScale), transformOrigin: "50% 50%" },
        {
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sec5,
            start: "top 80%",
            end: "top 30%",
            toggleActions: "play none none none",
            once: true,
          },
          onComplete: () => gsap.set(wrap5, { clearProps: "willChange" }),
        }
      );
    };
    if (imgEl5?.complete && imgEl5.naturalWidth) {
      requestAnimationFrame(() => setupImgAnim1());
    } else {
      imgEl5?.addEventListener("load", () => requestAnimationFrame(() => setupImgAnim1()), { once: true });
    }
  } else {
    hide(section(5));
  }

  const img2 = takeNext("image");
  if (img2?.src) {
    $("chapterImg2").src = img2.src;
    $("chapterImg2").alt = "Project preview";
    // Parallax only for section 6 (no scale reveal)
    const sec6 = section(6);
    const wrap6 = sec6?.querySelector(".image-wrap2");
    const imgEl6 = $("chapterImg2");
    const setupImgAnim2 = () => {
      if (!wrap6 || !imgEl6) return;
      setupParallaxFor(wrap6, imgEl6, 18);
      ScrollTrigger.refresh();
    };
    if (imgEl6?.complete && imgEl6.naturalWidth) {
      requestAnimationFrame(() => setupImgAnim2());
    } else {
      imgEl6?.addEventListener("load", () => requestAnimationFrame(() => setupImgAnim2()), { once: true });
    }
  } else {
    hide(section(6));
  }

  const v2 = takeNext("video");
  if (v2?.src) {
    $("video2Src").src = v2.src;
    $("video2").load();
    const sec7 = section(7);
    const wrap7 = sec7?.querySelector(".video-wrap");
    const setupVideoAnim2 = () => {
      if (!wrap7) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = wrap7.getBoundingClientRect();
      const startScale = Math.max(window.innerWidth / Math.max(rect.width, 1), window.innerHeight / Math.max(rect.height, 1));
      gsap.set(wrap7, { willChange: "transform", overflow: "hidden" });
      gsap.fromTo(
        wrap7,
        { scale: Math.max(1.05, startScale), transformOrigin: "50% 50%" },
        {
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sec7,
            start: "top 80%",
            end: "top 30%",
            toggleActions: "play none none none",
            once: true,
          },
          immediateRender: false,
          onComplete: () => gsap.set(wrap7, { clearProps: "willChange" }),
        }
      );
    };
    requestAnimationFrame(() => setupVideoAnim2());
  } else {
    hide(section(7));
  }

  const img3 = takeNext("image");
  if (img3?.src) {
    $("heroImg2").src = img3.src;
    $("heroImg2").alt = "Project image";
    // Animate the last hero as well once loaded
    const hero2El = section(8);
    const heroImg2El = $("heroImg2");
    const runHero2Anim = () => animateHeroEnter(hero2El);
    if (heroImg2El?.complete && heroImg2El.naturalWidth) {
      runHero2Anim();
      setupParallaxFor(hero2El.querySelector(".slide-img"), heroImg2El, 18);
      ScrollTrigger.refresh();
    } else {
      heroImg2El?.addEventListener(
        "load",
        () => {
          runHero2Anim();
          setupParallaxFor(hero2El.querySelector(".slide-img"), heroImg2El, 18);
          ScrollTrigger.refresh();
        },
        { once: true }
      );
    }
  } else {
    hide(section(8));
  }

  const img4 = takeNext("image");
  if (img4?.src) {
    $("storyImg").src = img4.src;
    $("storyImg").alt = "Project image";
    if (img4.style?.backgroundColor) {
      section(9).style.backgroundColor = img4.style.backgroundColor;
    }
  } else {
    hide(section(9));
  }

  const img5 = takeNext("image");
  if (img5?.src) {
    $("framesImg").src = img5.src;
    $("framesImg").alt = "Project image";
    // Add parallax to section 10 image similar to hero/overview
    const sec10 = section(10);
    const wrap10 = sec10?.querySelector(".slide-img");
    const framesImgEl = $("framesImg");
    const setupParallax10 = () => {
      if (!wrap10 || !framesImgEl) return;
      setupParallaxFor(wrap10, framesImgEl, 18);
      ScrollTrigger.refresh();
    };
    if (framesImgEl?.complete && framesImgEl.naturalWidth) {
      requestAnimationFrame(() => setupParallax10());
    } else {
      framesImgEl?.addEventListener("load", () => requestAnimationFrame(() => setupParallax10()), { once: true });
    }
  } else {
    hide(section(10));
  }

  const svgPath = proj.statement?.svg;
  if (svgPath) {
    try {
      await inlineSvg(svgPath, $("statementSvg"));
    } catch (e) {
      console.error(e);
      const img = document.createElement("img");
      img.src = svgPath;
      img.alt = `${proj.title} statement`;
      $("statementSvg").replaceChildren(img);
    }
  }
  $("scriptText").textContent = proj.statement?.scriptText || "";
  $("clientWords").textContent = proj.statement?.clientWords || "";

  // Nav color swap based on underlying section background (content page)
  (function handleNavContrastContent() {
    const nav = document.querySelector("nav");
    if (!nav) return;
    const darkBgSelectors = ["#section-1", "#section-4", "#section-7"]; // dark sections
    const lightBgSelectors = ["#section-2", "#section-3", "#section-5", "#section-6", "#section-8", "#section-9", "#section-10", "#section-11"]; // light sections
    const candidates = [...darkBgSelectors, ...lightBgSelectors].map((s) => document.querySelector(s)).filter(Boolean);

    const update = () => {
      const navTop = nav.getBoundingClientRect().top;
      let active = null;
      for (const sec of candidates) {
        const r = sec.getBoundingClientRect();
        if (r.top <= navTop + 40 && r.bottom >= navTop + 40) {
          active = sec;
          break;
        }
      }
      if (!active) return;
      const isDark = darkBgSelectors.some((s) => document.querySelector(s) === active);
      nav.classList.toggle("nav--light", isDark);
      nav.classList.toggle("nav--dark", !isDark);
    };

    update();
    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
  })();
})();
