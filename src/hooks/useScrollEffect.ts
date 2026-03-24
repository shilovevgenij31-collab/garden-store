import { useEffect } from "react";

/**
 * Toggles a CSS class on a target element based on scroll position.
 * Replaces: window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > threshold))
 */
export function useScrollEffect(
  elementId: string,
  className: string,
  threshold: number = 60
) {
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById(elementId);
      if (el) {
        el.classList.toggle(className, window.scrollY > threshold);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [elementId, className, threshold]);
}
