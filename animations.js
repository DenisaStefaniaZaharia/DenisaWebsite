import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

// Ensure plugin is registered when this module is imported
if (!gsap.core.globals().SplitText) {
  gsap.registerPlugin(SplitText);
}

/**
 * Animate a hero section to match the slide transition style.
 * Expects a structure with a container that includes:
 * - .slide-img img
 * - .slide-title h1
 *
 * Example root element: a `.hero` section.
 */
export function animateHeroEnter(rootElement) {
  if (!rootElement) return;

  const imgWrap = rootElement.querySelector(".slide-img");
  const imgEl = imgWrap ? imgWrap.querySelector("img") : null;
  const titleEl = rootElement.querySelector(".slide-title h1");
  if (!imgWrap || !titleEl) return;

  // Prepare SplitText for title words (masking and staggered reveal)
  SplitText.create(titleEl, {
    type: "words",
    wordsClass: "word",
    mask: "words",
  });
  const words = rootElement.querySelectorAll(".slide-title .word");
  gsap.set(words, { y: "100%", force3D: true });

  // Clip-path intro similar to projects slider entry
  gsap.set(rootElement, {
    y: 0,
    clipPath: "polygon(20% 0%, 80% 0%, 80% 80%, 20% 80%)",
    force3D: true,
  });

  // Build timeline
  const tl = gsap.timeline();

  tl.to(rootElement, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    duration: 1.2,
    ease: "power4.out",
    force3D: true,
  })
    // subtle zoom on the hero image while the reveal plays
    .fromTo(
      imgEl,
      { scale: 1.06, transformOrigin: "50% 50%", force3D: true },
      { scale: 1, duration: 1.4, ease: "power3.out", force3D: true },
      0
    )
    .to(
    words,
    {
      y: "0%",
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.08,
      force3D: true,
    },
    0.6
  );

  return tl;
}


