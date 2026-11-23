# react-country-dial-input

React telephone input with a searchable country dial-code picker.

- 243 countries with flags (via [`flag-icons`](https://www.npmjs.com/package/flag-icons))
- Number mask sized to each country's length (`### ### ####`)
- Search by country name, ISO code (`uk` works) or dial code (`+91`)
- Built-in validation with the [`phone`](https://www.npmjs.com/package/phone) library
- Floating label, valid/invalid states with an error bubble
- Autofill clean-up: `+1 (555) 123-4567` becomes `5551234567`
- Optional masked ("like password") mode, edit link, custom right-side addon
- No UI framework needed; theme it with CSS variables

## Install

```bash
npm install react-country-dial-input
```

Requires React 18 or newer. `flag-icons`, `phone` and `react-number-format` are installed with it.

## Usage

Import both stylesheets once, for example in your app entry:

```js
import "flag-icons/css/flag-icons.min.css";
import "react-country-dial-input/style.css";
```

```jsx
import { useState } from "react";
import TelephoneInput from "react-country-dial-input";

export default function PhoneField() {
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("US");

  return (
    <TelephoneInput
      label="Phone number"
      name="phone"
      value={phone}
      countryCode={country}
      onChange={(e) => setPhone(e.target.value)} // digits only, no dial code
      onCountryChange={(code, country) => setCountry(code)} // "IN", {country, dial_code, ...}
    />
  );
}
```

Like a native input, the field is controlled: pass `value` and `countryCode`, and update them in `onChange` and `onCountryChange`.

## Validation

Turn on `autoValidate` and the field validates itself: it turns green as soon as the number is valid, and red with an error bubble once the user leaves it with an invalid number. Use `onValidate` to get the result into your form state:

```jsx
<TelephoneInput
  name="phone"
  value={phone}
  countryCode={country}
  onChange={(e) => setPhone(e.target.value)}
  onCountryChange={setCountry}
  autoValidate
  validateText="Please enter a valid mobile number" // optional, this is the default
  onValidate={(isValid, info) => {
    setPhoneValid(isValid);
    // info.phoneNumber -> "+919876543210" (E.164), null when invalid
  }}
/>
```

`onValidate` fires whenever validity changes, including when the country changes. It works without `autoValidate` too, if you want the result but prefer to show the states yourself with `isValid` / `isInvalid`. If you pass `isValid` or `isInvalid`, they always win over `autoValidate`.

You can also validate outside the component, for example on submit or on the server:

```js
import { validatePhone, getPhoneInfo } from "react-country-dial-input";

validatePhone("9876543210", "IN"); // true
validatePhone("07400123456", "GB"); // false: drop the trunk 0
getPhoneInfo("2025550123", "us");
// { isValid: true, phoneNumber: "+12025550123", countryIso2: "US", countryIso3: "USA", countryCode: "+1" }
```

The checks run on the `phone` library's per-country rules (length and valid prefixes). On top of that:

- **Territories without their own data validate as their parent country:** Jersey, Guernsey and the Isle of Man as UK; Christmas and Cocos Islands as Australia; St Barthélemy and St Martin as Guadeloupe; Vatican City as Italy.
- **A leading `0` (domestic trunk prefix) is rejected:** the exceptions are Congo, Ivory Coast and Benin, where numbers really start with 0.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | node | | Floating label |
| `value` | string | | National number, digits only |
| `name` | string | | Input name; also passed back in `onChange` |
| `id` | string | `telephone_input_id_${name}` | Input id |
| `countryCode` | string | `"us"` | ISO alpha-2 code of the selected country, case-insensitive, `"uk"` = `"gb"` |
| `countries` | `Country[]` | built-in list | Replace or filter the country list |
| `onChange` | `(e) => void` | | `e.target = { name, value }`, value is digits only |
| `onCountryChange` | `(code, country) => void` | | Upper-case ISO code and the country object |
| `onFocus` / `onBlur` / `onPaste` | function | | Native input events |
| `autoValidate` | boolean | `false` | Validate with `phone` and show the states automatically |
| `onValidate` | `(isValid, info) => void` | | Called when validity changes; `info.phoneNumber` is the E.164 number |
| `isValid` / `isInvalid` | boolean | | Force the green/red state (overrides `autoValidate`) |
| `validateText` | node | `"Please enter a valid phone number"` with `autoValidate` | Error bubble shown above the field when invalid |
| `hideIcons` | boolean | `false` | Hide the valid/invalid icons |
| `editField` | `{ label, callBack }` | | Shows a pencil "edit" link on the right |
| `addon` | node | | Extra content at the right edge of the field |
| `likePassword` | boolean | `false` | Mask the digits as dots, with a show/hide toggle |
| `disabled` | boolean | `false` | Disable the input and the country picker |
| `formDisabled` | boolean | `false` | Disable it and paint a disabled overlay |
| `readOnly` | boolean | `false` | Read-only input; the country picker is locked too |
| `required` | boolean | `false` | |
| `disableAutoFill` | boolean | `false` | Keep the field read-only until focused, to block browser autofill |
| `unformatted` | boolean | `false` | Plain digits input without the mask (capped at the country's length) |
| `className` | string | | Class on the outer container |
| `placeholder` | string | `"_"` | Must not be empty: the floating label relies on `:placeholder-shown` |
| `searchPlaceholder` | string | `"Search Country"` | |
| `autoComplete` | string | `"tel-national"` | |

Any other props (`data-*`, `aria-*`, `style`, …) are passed to the `<input>`.

## Helpers

```js
import {
  countries, // Country[]: { country, country_code, dial_code, ph_length, alpha_3, iso_code }
  findCountry, // findCountry(countries, "uk") -> United Kingdom
  getPhoneFormat, // getPhoneFormat(country) -> "### ### ####"
  filterCountries, // the dropdown's search: filterCountries(countries, "+44")
  normalizeCountryCode, // "UK" -> "gb"
  validatePhone, // validatePhone("9876543210", "IN") -> true
  getPhoneInfo, // same, with the E.164 number and ISO codes
} from "react-country-dial-input";
```

## Theming

All styles are scoped under `.rcdi`. Override these on `:root` or a parent element:

```css
:root {
  --rcdi-primary: #003dc2;
  --rcdi-danger: #e51313;
  --rcdi-success: #198754;
  --rcdi-border-color: #d0d5dd;
  --rcdi-radius: 0.375rem;
  --rcdi-bg: #fff;
  --rcdi-text: #212529;
  --rcdi-hover-bg: #f5f7fe;
  --rcdi-active-bg: #eef5ff;
  --rcdi-highlight-bg: #dbe5ff;
  --rcdi-disabled-overlay: rgba(0, 0, 0, 0.05);
  --rcdi-font-size: 16px;
}
```

## Development

```bash
npm install
npm run dev     # playground at demo/
npm test
npm run build   # dist/: index.js (ESM), index.cjs, index.d.ts, style.css
```

## License

MIT
