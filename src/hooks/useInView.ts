import { useEffect } from "react";

const DEFAULT_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: "0px 0px -40px 0px",
};

/**
 * Observes elements matching the given selectors and adds 'visible' class when they enter the viewport.
 * Replaces: new IntersectionObserver(...) + document.querySelectorAll('.fade-up,.fade-left,.fade-right,.scale-in')
 */
export function useInView(
  selectors: string = ".fade-up,.fade-left,.fade-right,.scale-in",
  options: IntersectionObserverInit = DEFAULT_OPTIONS
) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, options);

    const elements = document.querySelectorAll(selectors);
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selectors, options]);
}
