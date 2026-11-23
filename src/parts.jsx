import { useEffect, useId, useState } from "react";
import { cx, dismissKeyboard, isTouchScreen } from "./utils";
import {
  ChevronDown,
  Eye,
  EyeOff,
  FormInvalid,
  FormValid,
  PencilLine,
} from "./icons";

// Flag + dial code + caret on the left of the field; opens the country list.
export const CurrentCountryData = ({
  currentCountry,
  setChangeCountry = () => {},
  isReadOnly = false,
  disabled = false,
  setFocused = () => {},
  triggerRef,
}) => {
  const isDisabled = isReadOnly || disabled;
  const flagCode = currentCountry?.country_code?.toLowerCase();

  const open = () => {
    if (isDisabled) return;
    dismissKeyboard();
    setChangeCountry(true);
    if (!isTouchScreen()) setFocused(true);
  };

  return (
    <div
      className={cx("current_country_wrap", { isReadOnly: isDisabled })}
      ref={triggerRef}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-haspopup="listbox"
      aria-disabled={isDisabled || undefined}
      aria-label={
        currentCountry
          ? `${currentCountry.country} ${currentCountry.dial_code}, change country`
          : "Choose country"
      }
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
    >
      {flagCode && (
        <span className={`fi fi-${flagCode}`} title={currentCountry?.country} />
      )}
      <span className="country_ph_code">{currentCountry?.dial_code}</span>
      <span className="caret_down_wrap">
        <ChevronDown />
      </span>
    </div>
  );
};

// Valid tick, or invalid icon with an optional message bubble above the field.
export const Validation = ({
  isValid,
  isInvalid,
  validateText,
  parentRef = null,
  hideIcons = false,
}) => {
  const id = useId();
  const [width, setWidth] = useState("150px");

  useEffect(() => {
    // The measured width is only used by the invalid-message bubble.
    if (!isInvalid || !validateText) return;

    const el = parentRef?.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const next = rect?.width ? `${Math.round(rect.width)}px` : "150px";
      setWidth((current) => (current === next ? current : next));
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isInvalid, parentRef, validateText]);

  const className = cx("validation", {
    "is-invalid": isInvalid,
    "is-valid": isValid,
  });

  if (isValid) {
    return <span className={className}>{!hideIcons && <FormValid />}</span>;
  }

  if (isInvalid && validateText) {
    return (
      <div className={className}>
        <div className="validation_icon_wrap">
          {!hideIcons && <FormInvalid />}
          <div className="form_error_text_tooltip_arrow" />
        </div>

        <div
          id={`tooltip_${id}`}
          role="alert"
          className="form_error_text_tooltip"
          style={{ minWidth: width, width: "100%", maxWidth: "100%" }}
        >
          <div className="invalid_text">{validateText}</div>
        </div>
      </div>
    );
  }

  if (isInvalid) {
    return <span className={className}>{!hideIcons && <FormInvalid />}</span>;
  }

  return null;
};

// Everything on the right of the field: edit link, show/hide toggle,
// validation and a free-form addon.
export const ValidationPart = ({
  editField,
  inputId,
  likePassword = false,
  lookPass = false,
  setLookPass = () => {},
  addon = null,
  ...validationProps
}) => (
  <>
    {editField && (
      <div
        className="edit_field_label"
        onClick={() => {
          editField?.callBack?.();
          window.document.getElementById(inputId)?.focus();
        }}
      >
        <span className="textUnderline">
          <PencilLine size={16} />
          {editField?.label}
        </span>
      </div>
    )}
    {likePassword && (
      <button
        type="button"
        className="info_icon_wrap show_hide_toggle"
        aria-label={lookPass ? "Show number" : "Hide number"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setLookPass((prev) => !prev);
        }}
      >
        {!lookPass ? <Eye /> : <EyeOff />}
      </button>
    )}
    <Validation {...validationProps} />
    {addon}
  </>
);
