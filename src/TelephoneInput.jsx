import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { PatternFormat } from "react-number-format";
import defaultCountries from "./countries.json";
import { cx, findCountry, getPhoneFormat, isTouchScreen } from "./utils";
import CountrySelection from "./CountrySelection";
import { CurrentCountryData, ValidationPart } from "./parts";
import { getPhoneInfo } from "./validatePhone";

const noop = () => {};
const DEFAULT_INVALID_TEXT = "Please enter a valid phone number";

const TelephoneInput = ({
  label,
  value,
  name,
  id: idProp,
  countryCode,
  countries = defaultCountries,
  validateText,
  isValid: isValidProp,
  isInvalid: isInvalidProp,
  autoValidate = false,
  onValidate,
  hideIcons = false,
  onBlur = noop,
  onFocus = noop,
  onPaste = noop,
  onChange = noop,
  onCountryChange = noop,
  editField = false,
  addon = null,
  readOnly = false,
  disableAutoFill = false,
  required = false,
  disabled = false,
  className = "",
  placeholder = "_",
  searchPlaceholder = "Search Country",
  autoComplete = "tel-national",
  format,
  likePassword = false,
  formDisabled = false,
  unformatted,
  ...inputRest
}) => {
  const autoId = useId();
  const id = idProp ?? (name ? `telephone_input_id_${name}` : autoId);
  const plainInput = unformatted;

  const addOnRef = useRef(null);
  const parentRef = useRef(null);
  const labelRef = useRef(null);
  const countryTriggerRef = useRef(null);
  const lastEmitRef = useRef("");
  const [changeCountry, setChangeCountry] = useState(false);
  const [focused, setFocused] = useState(false);
  const [lookPass, setLookPass] = useState(true);

  const currentCountry = useMemo(
    () => findCountry(countries, countryCode),
    [countries, countryCode],
  );

  const phoneLength = Number(currentCountry?.ph_length) || 15;

  // ---- validation ----
  // `isValid` / `isInvalid` props always win. Otherwise, with `autoValidate`,
  // a valid number shows green at once, and an invalid one shows red only
  // after the field has been left once, so typing isn't flagged mid-number.
  const [touched, setTouched] = useState(false);
  const shouldValidate = autoValidate || typeof onValidate === "function";
  const phoneInfo = useMemo(
    () =>
      shouldValidate
        ? getPhoneInfo(value, currentCountry?.country_code, countries)
        : null,
    [shouldValidate, value, currentCountry, countries],
  );
  const autoValid = !!phoneInfo?.isValid;
  const hasValue = String(value ?? "").length > 0;
  const controlled = isValidProp !== undefined || isInvalidProp !== undefined;

  const isValid = controlled
    ? isValidProp
    : autoValidate && hasValue && autoValid;
  const isInvalid = controlled
    ? isInvalidProp
    : autoValidate && hasValue && touched && !autoValid;
  const errorText =
    validateText ?? (autoValidate && !controlled ? DEFAULT_INVALID_TEXT : null);

  // Report validity whenever the result changes, including on country change.
  const onValidateRef = useRef(onValidate);
  onValidateRef.current = onValidate;
  const lastValidRef = useRef(null);
  useEffect(() => {
    if (!phoneInfo || lastValidRef.current === phoneInfo.isValid) return;
    lastValidRef.current = phoneInfo.isValid;
    onValidateRef.current?.(phoneInfo.isValid, {
      ...phoneInfo,
      value: String(value ?? ""),
      country: currentCountry,
    });
  }, [phoneInfo, value, currentCountry]);

  // Strips a leading dial code and keeps only the last `ph_length` digits, so
  // an autofilled "+1 (555) 123-4567" lands as "5551234567".
  const cleanPhoneValue = useCallback(
    (raw = "") => {
      let digits = String(raw).replace(/\D/g, "");
      const dialCode = String(currentCountry?.dial_code || "").replace(
        /\D/g,
        "",
      );
      const length = Number(currentCountry?.ph_length);

      if (dialCode && digits.startsWith(dialCode)) {
        digits = digits.slice(dialCode.length);
      }
      if (length && digits.length > length) {
        digits = digits.slice(-length);
      }
      return digits;
    },
    [currentCountry],
  );

  const emitPhoneChange = useCallback(
    (nextValue) => {
      if (lastEmitRef.current === nextValue) return;
      lastEmitRef.current = nextValue;
      onChange({ target: { name, value: nextValue } });
    },
    [name, onChange],
  );

  const autoFillCaptureHandler = useCallback(
    (e) => {
      const rawValue = e.currentTarget.value || "";
      const prevLength = lastEmitRef.current?.length || 0;
      const isAutoFill =
        prevLength === 0 && rawValue.replace(/\D/g, "").length > 4;
      if (!isAutoFill) return;

      requestAnimationFrame(() => {
        const cleanValue = cleanPhoneValue(rawValue);
        if (cleanValue) emitPhoneChange(cleanValue);
      });
    },
    [cleanPhoneValue, emitPhoneChange],
  );

  const changeHandler = (values) => {
    const inputValue = values?.value || "";
    const prevLength = lastEmitRef.current?.length || 0;
    const isAutoFill = prevLength === 0 && inputValue.length > 4;
    emitPhoneChange(isAutoFill ? cleanPhoneValue(inputValue) : inputValue);
  };

  // The unformatted field is a plain input, so the digits-only value and the
  // length cap that PatternFormat handles have to be applied by hand.
  const plainChangeHandler = (e) => {
    const digits = String(e.target.value || "")
      .replace(/\D/g, "")
      .slice(0, phoneLength);
    emitPhoneChange(digits);
  };

  // A disabled form never takes focus. Every path that can raise `focused`
  // routes through here so the focused border can't be painted on a field the
  // user cannot type in.
  const focusField = useCallback(
    (next) => setFocused(formDisabled ? false : next),
    [formDisabled],
  );

  const focusHandler = (e) => {
    if (formDisabled) return;
    if (!isTouchScreen()) focusField(true);
    onFocus(e);
  };

  const blurHandler = (e) => {
    const next = e.relatedTarget;
    if (next && parentRef.current?.contains(next)) return;

    if (next) {
      if (!isTouchScreen()) setFocused(false);
      setTouched(true);
      onBlur(e);
      return;
    }

    requestAnimationFrame(() => {
      if (parentRef.current?.contains(document.activeElement)) return;
      if (!isTouchScreen()) setFocused(false);
      setTouched(true);
      onBlur(e);
    });
  };

  const inputProps = {
    ...inputRest,
    value,
    id,
    type: "tel",
    inputMode: "tel",
    autoComplete,
    onInputCapture: autoFillCaptureHandler,
    onChangeCapture: autoFillCaptureHandler,
    onPaste,
    onBlur: blurHandler,
    onFocus: focusHandler,
    readOnly: readOnly || (disableAutoFill && !focused && !isTouchScreen()),
    required,
    name,
    "aria-invalid": isInvalid || undefined,
    className: cx("input_form_control", {
      isValid,
      isInvalid,
      isFocused: focused,
      like_password: likePassword ? lookPass : false,
    }),
    placeholder,
    // The container's `.formDisabled` overlay paints the tint; this only
    // blocks the field itself.
    disabled: disabled || formDisabled,
    style: { "--get_padding_left": "100px", ...inputRest.style },
  };

  useEffect(() => {
    const element = parentRef.current;
    if (!element || isTouchScreen()) return;

    const handleClick = (e) => focusField(element.contains(e.target));

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [focusField]);

  // Covers a field that was already focused when the form turned disabled.
  useEffect(() => {
    if (formDisabled) setFocused(false);
  }, [formDisabled]);

  // Keep the input's right padding and the label's width clear of whatever
  // is in the right add-on (validation icon, edit link, addon...).
  useEffect(() => {
    const target = addOnRef.current;
    if (!target) return;

    const updatePadding = () => {
      const element = document.getElementById(id);
      if (!element) return;

      element.style.paddingRight = `${target.offsetWidth}px`;
      const labelElement = labelRef.current;
      if (!labelElement) return;
      labelElement.style.maxWidth = `calc(100% - ${(target.offsetWidth || 10) + 95}px)`;
    };

    const frame = requestAnimationFrame(updatePadding);
    const observer = new MutationObserver(updatePadding);
    observer.observe(target, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [id]);

  return (
    <div
      className={cx("rcdi input_form_container", className, { formDisabled })}
      ref={parentRef}
    >
      <div className="input_form_group">
        <div
          className={cx("input_or_selection_wrapper for_telephone_wrapper", {
            valid_telefone: isValid,
            invalid_telefone: isInvalid,
            focused_telephone: focused,
          })}
        >
          <div className="input_left_add_on for_telephone_input">
            <CurrentCountryData
              disabled={disabled || formDisabled}
              currentCountry={currentCountry}
              isReadOnly={readOnly}
              setChangeCountry={() => setChangeCountry((prev) => !prev)}
              setFocused={focusField}
              triggerRef={countryTriggerRef}
            />
          </div>

          {plainInput ? (
            <input
              {...inputProps}
              onChange={plainChangeHandler}
              maxLength={phoneLength}
            />
          ) : (
            <PatternFormat
              {...inputProps}
              format={format ?? getPhoneFormat(currentCountry)}
              onValueChange={changeHandler}
            />
          )}

          <label
            htmlFor={id}
            className="input_form_label"
            style={{ "--move_from_left": "95px" }}
            ref={labelRef}
          >
            {label}
          </label>

          <div className="input_right_add_on" ref={addOnRef}>
            <ValidationPart
              isInvalid={isInvalid}
              isValid={isValid}
              validateText={errorText}
              hideIcons={hideIcons}
              editField={editField}
              parentRef={parentRef}
              inputId={id}
              likePassword={likePassword}
              setLookPass={setLookPass}
              lookPass={lookPass}
              addon={addon}
            />
          </div>
        </div>

        {changeCountry && !formDisabled && (
          <CountrySelection
            countries={countries}
            currentCountry={currentCountry}
            searchPlaceholder={searchPlaceholder}
            onCountryChange={(code, country) => {
              onCountryChange(code, country);
              window.document.getElementById(id)?.focus();
            }}
            setChangeCountry={setChangeCountry}
            triggerRef={countryTriggerRef}
            anchorRef={parentRef}
          />
        )}
      </div>
    </div>
  );
};

export default TelephoneInput;
