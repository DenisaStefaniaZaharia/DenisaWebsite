import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const section = document.querySelector("#section-3");
const video = document.getElementById("showreel");
const src = "https://stream.mux.com/bGeZOk8pDzOhnN2D62bVUWLeN00OWZewZXDFjIOs1Aas.m3u8";

function attachSrc() {
  if (video.src) return; // already attached
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src; // Safari (native HLS)
  } else if (window.Hls && Hls.isSupported()) {
    const hls = new Hls({ lowLatencyMode: true });
    hls.loadSource(src);
    hls.attachMedia(video);
  } else {
    // ultimate fallback: progressive MP4
    video.src = "https://stream.mux.com/bGeZOk8pDzOhnN2D62bVUWLeN00OWZewZXDFjIOs1Aas/medium.mp4";
  }
}

const io = new IntersectionObserver(
  ([e]) => {
    if (e.isIntersecting) {
      attachSrc();
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  },
  { threshold: 0.6 }
);

io.observe(section);

//Explore Hover
const explore = document.querySelector("#explore");
const cards = explore.querySelectorAll(".explore-fan .card");
const c1 = explore.querySelector(".c1");
const c2 = explore.querySelector(".c2");
const c3 = explore.querySelector(".c3");
const glow = explore.querySelector(".explore-fan::before");

gsap.set(cards, {
  xPercent: 100,
  yPercent: -50,
  x: 0,
  y: 0,
  rotate: 0,
  scale: 0.9,
  opacity: 0,
});

gsap.set(explore.querySelector(".explore-fan"), { "--glow": 0 });

const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out", duration: 0.8 } });

tl.to(c1, { opacity: 1, x: -110, y: -40, rotate: -18, scale: 1 }, 0.0)
  .to(c2, { opacity: 1, x: -10, y: -10, rotate: -2, scale: 1 }, 0.05)
  .to(c3, { opacity: 1, x: 110, y: -20, rotate: 15, scale: 1 }, 0.1)
  .to(
    explore.querySelector(".explore-fan"),
    {
      onStart: () => explore.querySelector(".explore-fan").style.setProperty("opacity", "1"),
    },
    0
  );

tl.fromTo(explore.querySelector(".explore-link"), { scale: 1 }, { scale: 1.05, duration: 0.35, ease: "power2.out" }, 0);

explore.addEventListener("mouseenter", () => tl.play());
explore.addEventListener("mouseleave", () => tl.reverse());

// ABOUT hover
const navAbout = document.querySelector("#nav-about");
if (navAbout) {
  const a1 = navAbout.querySelector(".about-fan .a1");
  const a2 = navAbout.querySelector(".about-fan .a2");
  const all = [a1, a2];

  gsap.set(all, { x: 0, y: 0, rotate: 0, scale: 0.9, opacity: 0 });

  const tlAbout = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out", duration: 0.65 },
  });

  tlAbout.to(a1, { opacity: 1, x: -10, y: -18, rotate: -12, scale: 1 }, 0.0).to(a2, { opacity: 1, x: 70, y: -10, rotate: 10, scale: 1 }, 0.06);

  navAbout.addEventListener("mouseenter", () => tlAbout.play());
  navAbout.addEventListener("mouseleave", () => tlAbout.reverse());
}

// Nav color swap based on underlying section background
(function handleNavContrastIndex() {
  const nav = document.querySelector("nav");
  if (!nav) return;
  const darkBgSelectors = ["#section-1", "#section-4"]; // dark sections in index
  const lightBgSelectors = ["#section-2", "#section-3", "#section-5"]; // light sections in index
  const candidates = [...darkBgSelectors, ...lightBgSelectors].map((s) => document.querySelector(s)).filter(Boolean);

  const update = () => {
    // Find section whose top is closest below nav top
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

// SplitText animation for hero title (match projects behavior)
(function animateHeroTitle() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const titleEls = document.querySelectorAll("#section-1 .title h1");
  if (!titleEls.length) return;

  titleEls.forEach((el) => {
    SplitText.create(el, {
      type: "words",
      wordsClass: "word",
      mask: "words",
    });
  });
  const words = document.querySelectorAll("#section-1 .title .word");
  if (!words.length) return;
  gsap.set(words, { y: "100%", force3D: true });

  // Play on load; also ensure it plays when hero enters view for safety
  const play = () =>
    gsap.to(words, {
      y: "0%",
      duration: 1,
      ease: "power4.out",
      stagger: 0.08,
      force3D: true,
    });

  if (document.readyState === "complete") {
    requestAnimationFrame(play);
  } else {
    window.addEventListener("load", () => requestAnimationFrame(play), { once: true });
  }
})();

// SplitText line reveal for about description paragraph
(function animateAboutDescription() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = document.querySelector(".about .description p");
  if (!el) return;

  SplitText.create(el, {
    type: "lines",
    linesClass: "line",
    mask: "lines",
    reduceWhiteSpace: false,
  });
  const lines = el.querySelectorAll(".line");
  if (!lines.length) return;
  gsap.set(lines, { y: "100%", force3D: true });

  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    end: "top 55%",
    once: true,
    animation: gsap.to(lines, {
      y: "0%",
      duration: 1,
      ease: "power4.out",
      stagger: 0.08,
      force3D: true,
    }),
  });
})();

// SplitText for the script-text line (section 2)
(function animateScriptText() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = document.querySelector("#section-2 .script-text");
  if (!el) return;

  // Split into lines
  SplitText.create(el, {
    type: "lines",
    linesClass: "line",
    mask: "lines",
    reduceWhiteSpace: false,
  });
  const lines = el.querySelectorAll(".line");
  if (!lines.length) return;
  gsap.set(lines, { y: "100%", force3D: true });

  ScrollTrigger.create({
    trigger: el,
    start: "top 80%",
    end: "top 60%",
    once: true,
    animation: gsap.to(lines, {
      y: "0%",
      duration: 1,
      ease: "power4.out",
      stagger: 0.06,
      force3D: true,
    }),
  });
})();

// Parallax (match content page behavior)
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

// Apply parallax to hero image
const heroMedia = document.querySelector("#section-1 .hero-media");
const heroImg = heroMedia ? heroMedia.querySelector("img") : null;
if (heroMedia && heroImg) {
  if (heroImg.complete && heroImg.naturalWidth) {
    setupParallaxFor(heroMedia, heroImg, 18);
    ScrollTrigger.refresh();
  } else {
    heroImg.addEventListener(
      "load",
      () => {
        setupParallaxFor(heroMedia, heroImg, 18);
        ScrollTrigger.refresh();
      },
      { once: true }
    );
  }
}

// Apply parallax to project cards images
const projectCards = document.querySelectorAll("#section-4 .projects-wrap .card");
projectCards.forEach((card) => {
  const img = card.querySelector("img");
  if (!img) return;
  if (img.complete && img.naturalWidth) {
    setupParallaxFor(card, img, 12);
  } else {
    img.addEventListener("load", () => setupParallaxFor(card, img, 12), { once: true });
  }
});

// Clip-path scroll animation for each project card image
projectCards.forEach((card) => {
  const img = card.querySelector("img");
  if (!img) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  ScrollTrigger.create({
    trigger: card,
    start: "top bottom",
    end: "top top",
    scrub: 0.5,
    animation: gsap.fromTo(img, { clipPath: "polygon(25% 25%, 75% 40%, 100% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "none" }),
  });
});

// Apply subtle parallax to about photos
const aboutBack = document.querySelector("#section-5 .photo--back");
const aboutFront = document.querySelector("#section-5 .photo--front");
const aboutBackImg = aboutBack ? aboutBack.querySelector("img") : null;
const aboutFrontImg = aboutFront ? aboutFront.querySelector("img") : null;

if (aboutBack && aboutBackImg) {
  // add slight scale to avoid revealing container edges during translate
  gsap.set(aboutBackImg, { scale: 1.08, transformOrigin: "50% 50%" });
  if (aboutBackImg.complete && aboutBackImg.naturalWidth) {
    setupParallaxFor(aboutBack, aboutBackImg, 8);
  } else {
    aboutBackImg.addEventListener("load", () => setupParallaxFor(aboutBack, aboutBackImg, 8), { once: true });
  }
}
if (aboutFront && aboutFrontImg) {
  // add slight scale to avoid revealing container edges during translate
  gsap.set(aboutFrontImg, { scale: 1.08, transformOrigin: "50% 50%" });
  if (aboutFrontImg.complete && aboutFrontImg.naturalWidth) {
    setupParallaxFor(aboutFront, aboutFrontImg, 10);
  } else {
    aboutFrontImg.addEventListener("load", () => setupParallaxFor(aboutFront, aboutFrontImg, 10), { once: true });
  }
}
