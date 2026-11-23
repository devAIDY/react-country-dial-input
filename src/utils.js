// Tiny `classnames` replacement: strings, and objects of {className: bool}.
export const cx = (...args) =>
  args
    .flatMap((arg) =>
      arg && typeof arg === "object"
        ? Object.keys(arg).filter((key) => arg[key])
        : [arg],
    )
    .filter(Boolean)
    .join(" ");

let touchScreenMQL;

export const isTouchScreen = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return false;
  if (touchScreenMQL === undefined) {
    touchScreenMQL = window.matchMedia("(pointer: coarse)");
  }
  return touchScreenMQL.matches;
};

// For pick-only dropdowns opened from a div or button. On iOS such a tap does
// not move focus, so a keyboard left open by the previous text field stays up
// over the list. Touch screens only.
export const dismissKeyboard = () => {
  if (!isTouchScreen()) return;
  const el = document.activeElement;
  if (el && ["INPUT", "TEXTAREA"].includes(el.tagName) && !el.readOnly) {
    el.blur();
  }
};

// ISO alpha-2 code, case-insensitive. "UK" is accepted as an alias of "GB".
export const normalizeCountryCode = (code) => {
  const lower = String(code || "").toLowerCase();
  return lower === "uk" ? "gb" : lower;
};

export const findCountry = (countries, countryCode = "us") => {
  const code = normalizeCountryCode(countryCode) || "us";
  return countries.find(
    (country) => country?.country_code?.toLowerCase() === code,
  );
};

const FORMAT_BY_LENGTH = {
  4: "### #",
  5: "### ##",
  6: "### ###",
  7: "### ### #",
  8: "### ### ##",
  9: "### ### ###",
  10: "### ### ####",
  11: "### ### #####",
  12: "### ### ### ###",
  13: "### ### ### ####",
  14: "### ### ### #####",
  15: "### ### ### ######",
};

// The PatternFormat mask for a country's national number length.
export const getPhoneFormat = (country) =>
  FORMAT_BY_LENGTH[Number(country?.ph_length)] || "### ### ####";
