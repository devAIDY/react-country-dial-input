import { useLayoutEffect } from "react";

// Caps an open dropdown list at `visibleRows` rows; the rest scroll. The height
// is measured to where the next row starts, so rows of any height show whole.
// Set inline with !important so a stylesheet max-height cannot override it.
//
// When the list opens past the bottom of what is visible, scroll up just enough
// to show it, but never so far that the field slides out of view. Inside a
// Bootstrap-style `.modal` the modal's own scrolling box scrolls instead of the
// window; inside an `.offcanvas` nothing is scrolled.
const getModalScrollBox = (anchor, modal) => {
  for (let el = anchor.parentElement; el; el = el.parentElement) {
    const { overflowY } = window.getComputedStyle(el);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight
    ) {
      return el;
    }
    if (el === modal) return null;
  }
  return null;
};

const scrollListIntoView = (list, anchor) => {
  if (list.closest(".offcanvas")) return;

  const gap = 8;
  const modal = list.closest(".modal");
  const box = modal && getModalScrollBox(anchor, modal);
  if (modal && !box) return;

  // Rects are measured from the layout viewport; with a keyboard up, iOS
  // shifts the visible part down by offsetTop.
  const vv = window.visualViewport;
  const vvTop = vv?.offsetTop || 0;
  let top = vvTop;
  let bottom = vv ? vvTop + vv.height : window.innerHeight;
  if (box) {
    const boxTop = box.getBoundingClientRect().top + box.clientTop;
    top = Math.max(top, boxTop);
    bottom = Math.min(bottom, boxTop + box.clientHeight);
  }

  const overflow = list.getBoundingClientRect().bottom + gap - bottom;
  const room = anchor.getBoundingClientRect().top - top - gap;
  const by = Math.min(overflow, room);
  if (by > 0) (box || window).scrollBy?.({ top: by, behavior: "smooth" });
};

const useDropdownListHeight = ({
  isOpen,
  listRef,
  anchorRef,
  rowSelector,
  visibleRows = 7,
  layoutKey,
}) => {
  useLayoutEffect(() => {
    if (!isOpen) return;

    const updateListHeight = () => {
      const list = listRef?.current;
      if (!list) return;

      const firstHidden = list.querySelectorAll(rowSelector)[visibleRows];
      const height = firstHidden
        ? `${
            firstHidden.getBoundingClientRect().top -
            list.getBoundingClientRect().top +
            list.scrollTop
          }px`
        : "none";
      list.style.setProperty("max-height", height, "important");
    };

    updateListHeight();
    window.addEventListener("resize", updateListHeight);
    return () => window.removeEventListener("resize", updateListHeight);
  }, [isOpen, listRef, rowSelector, visibleRows, layoutKey]);

  // Declared after the height effect so it measures the capped list. Runs on
  // open only, so filtering while typing does not keep moving the page. While
  // a keyboard is closing, wait for it (or 600ms) before measuring.
  useLayoutEffect(() => {
    if (!isOpen) return;

    const run = () => {
      const list = listRef?.current;
      const anchor = anchorRef?.current || list;
      if (list && anchor) scrollListIntoView(list, anchor);
    };

    const vv = window.visualViewport;
    const keyboardUp = vv && window.innerHeight - vv.height > 150;
    if (!keyboardUp) {
      run();
      return;
    }

    let done = false;
    const runOnce = () => {
      if (done) return;
      done = true;
      cleanup();
      run();
    };
    const onResize = () => {
      if (window.innerHeight - vv.height <= 150) runOnce();
    };
    const timer = window.setTimeout(runOnce, 600);
    const cleanup = () => {
      window.clearTimeout(timer);
      vv.removeEventListener("resize", onResize);
    };
    vv.addEventListener("resize", onResize);

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on open only
  }, [isOpen]);
};

export default useDropdownListHeight;
