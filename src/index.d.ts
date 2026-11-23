import type { FC, InputHTMLAttributes, ReactNode, FocusEvent, ClipboardEvent } from "react";

export interface Country {
  /** ISO 3166-1 alpha-2, upper case, e.g. "US". */
  country_code: string;
  /** ISO 3166-1 alpha-3, e.g. "USA". */
  alpha_3?: string;
  /** Display name, e.g. "United States". */
  country: string;
  /** Dial code with a leading "+", e.g. "+1". */
  dial_code: string;
  /** ISO 3166-1 numeric code. */
  iso_code?: string;
  /** National number length (digits after the dial code). */
  ph_length: number;
}

/** Synthetic event passed to `onChange`: the value is digits only. */
export interface TelephoneChangeEvent {
  target: { name?: string; value: string };
}

export interface PhoneInfo {
  isValid: boolean;
  /** E.164 number, e.g. "+919876543210", or null when invalid. */
  phoneNumber: string | null;
  countryIso2: string | null;
  countryIso3: string | null;
  /** Dial code, e.g. "+91", or null when invalid. */
  countryCode: string | null;
}

export interface ValidationInfo extends PhoneInfo {
  /** The national number as typed (digits only). */
  value: string;
  country: Country | undefined;
}

export interface EditField {
  label: ReactNode;
  callBack?: () => void;
}

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "value"
  | "defaultValue"
  | "onChange"
  | "onBlur"
  | "onFocus"
  | "onPaste"
  | "type"
  | "disabled"
  | "readOnly"
  | "required"
  | "placeholder"
  | "autoComplete"
  | "className"
  | "id"
  | "name"
>;

export interface TelephoneInputProps extends NativeInputProps {
  /** Floating label text. */
  label?: ReactNode;
  /** National number, digits only (no dial code). */
  value?: string;
  name?: string;
  /** Defaults to `telephone_input_id_${name}`, or a generated id. */
  id?: string;
  /** ISO alpha-2 code of the selected country ("UK" works as "GB"). Default "us". */
  countryCode?: string;
  /** Replace the built-in country list. */
  countries?: Country[];

  /** Force the valid state. Setting `isValid` or `isInvalid` overrides `autoValidate`. */
  isValid?: boolean;
  /** Force the invalid state. Setting `isValid` or `isInvalid` overrides `autoValidate`. */
  isInvalid?: boolean;
  /**
   * Validate with the `phone` library and show the states by itself: green as
   * soon as the number is valid, red once the field has been left invalid.
   */
  autoValidate?: boolean;
  /** Called whenever validity changes, including on country change. */
  onValidate?: (isValid: boolean, info: ValidationInfo) => void;
  /**
   * Message shown in a bubble above the field when invalid. With
   * `autoValidate` it defaults to "Please enter a valid phone number".
   */
  validateText?: ReactNode;
  /** Hide the valid/invalid icons. */
  hideIcons?: boolean;

  /** Called with `{ target: { name, value } }`, value is digits only. */
  onChange?: (event: TelephoneChangeEvent) => void;
  /** Called with the upper-case ISO code and the full country object. */
  onCountryChange?: (countryCode: string, country: Country) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void;

  /** Shows an "edit" link with a pencil icon on the right. */
  editField?: EditField | false;
  /** Extra content rendered at the right edge of the field. */
  addon?: ReactNode;
  /** Masks the number as dots with a show/hide toggle. */
  likePassword?: boolean;

  readOnly?: boolean;
  disabled?: boolean;
  /** Disables the field and paints a disabled overlay over the whole control. */
  formDisabled?: boolean;
  required?: boolean;
  /** Keeps the field read-only until focused, to stop browser autofill. */
  disableAutoFill?: boolean;
  /** Plain digits-only input without the "### ### ####" mask. */
  unformatted?: boolean;
  /** @deprecated Use `unformatted`. */
  forAgent?: boolean;

  /** Class on the outer container. */
  className?: string;
  /** Default "_". Must be non-empty: the floating label uses :placeholder-shown. */
  placeholder?: string;
  /** Default "Search Country". */
  searchPlaceholder?: string;
  /** Default "tel-national". */
  autoComplete?: string;
}

declare const TelephoneInput: FC<TelephoneInputProps>;

export default TelephoneInput;
export { TelephoneInput };

/** The built-in list of 243 countries. */
export declare const countries: Country[];

/** Finds a country by ISO alpha-2 code (case-insensitive, "UK" = "GB"). */
export declare function findCountry(
  countries: Country[],
  countryCode?: string,
): Country | undefined;

/** The PatternFormat mask used for a country, e.g. "### ### ####". */
export declare function getPhoneFormat(country?: Country): string;

/** Lower-cases an ISO code and maps "uk" to "gb". */
export declare function normalizeCountryCode(code?: string): string;

/**
 * `true` when `number` (national number, no dial code) is valid for the
 * country. Uses the `phone` library, maps territories it lacks data for
 * (Jersey, Guernsey, Isle of Man, Vatican...) to their parent country, and
 * rejects a leading trunk "0" except where numbers really start with 0.
 */
export declare function validatePhone(
  number: string,
  countryCode?: string,
  countries?: Country[],
): boolean;

/** Like `validatePhone`, but returns the details, including the E.164 number. */
export declare function getPhoneInfo(
  number: string,
  countryCode?: string,
  countries?: Country[],
): PhoneInfo;

/** The search used by the dropdown: dial code digits, ISO code or name prefix. */
export declare function filterCountries(
  countries: Country[],
  query: string,
): Country[];
