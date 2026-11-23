import { phone } from "phone";
import defaultCountries from "./countries.json";
import { findCountry } from "./utils";

// Places the phone library has no data for, whose numbers are their parent
// country's: the Channel Islands and Isle of Man use UK numbers, Christmas and
// Cocos Islands Australian ones, St Barthelemy and St Martin Guadeloupe's, and
// Vatican City Italy's. Without this no number from them could ever validate.
const VALIDATE_AS = {
  GGY: "GBR",
  JEY: "GBR",
  IMN: "GBR",
  CXR: "AUS",
  CCK: "AUS",
  BLM: "GLP",
  MAF: "GLP",
  VAT: "ITA",
};

// Countries whose numbers really begin with 0 (Congo 06..., Ivory Coast 07...,
// Benin 01... since its 2024 move to 10 digits). Everywhere else a leading 0 is
// the domestic trunk prefix, not the number.
const LEADING_ZERO_COUNTRIES = ["COG", "CIV", "BEN"];

/**
 * Validates a national number (without dial code) for a country.
 * Returns `{ isValid, phoneNumber, countryIso2, countryIso3, countryCode }`;
 * `phoneNumber` is the E.164 form ("+919876543210") when valid, else null.
 */
export const getPhoneInfo = (
  number,
  countryCode = "us",
  countries = defaultCountries,
) => {
  const invalid = {
    isValid: false,
    phoneNumber: null,
    countryIso2: null,
    countryIso3: null,
    countryCode: null,
  };

  const digits = String(number ?? "").replace(/\D/g, "");
  const country = findCountry(countries, countryCode);
  if (!digits || !country?.alpha_3) return invalid;

  const alpha3 = VALIDATE_AS[country.alpha_3] || country.alpha_3;

  if (digits.startsWith("0") && !LEADING_ZERO_COUNTRIES.includes(alpha3)) {
    return invalid;
  }

  const result = phone(`${country.dial_code}${digits}`, { country: alpha3 });
  return result?.isValid ? result : invalid;
};

/** `true` when `number` is a valid national number for `countryCode`. */
export const validatePhone = (number, countryCode, countries) =>
  getPhoneInfo(number, countryCode, countries).isValid;
