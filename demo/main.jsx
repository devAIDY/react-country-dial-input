import { useState } from "react";
import { createRoot } from "react-dom/client";
import "flag-icons/css/flag-icons.min.css";
import "../src/style.css";
import "./demo.css";
import TelephoneInput, { countries } from "../src";

const initialSettings = {
  label: "Phone number",
  name: "phone",
  id: "demo-phone",
  format: "",
  placeholder: "_",
  searchPlaceholder: "Search Country",
  autoComplete: "tel-national",
  validateText: "Please enter a valid phone number",
  className: "",
  addon: "",
  autoValidate: true,
  hideIcons: false,
  likePassword: false,
  disabled: false,
  formDisabled: false,
  readOnly: false,
  required: false,
  disableAutoFill: false,
  unformatted: false,
  visualState: "auto",
  countryMode: "all",
  editField: false,
};

function TextControl({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="demo-control-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function ToggleControl({ label, checked, onChange }) {
  return (
    <label className="demo-toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Demo() {
  const [phone, setPhone] = useState("2025550123");
  const [country, setCountry] = useState("US");
  const [countryDialCode, setCountryDialCode] = useState("+1");
  const [validation, setValidation] = useState(null);
  const [settings, setSettings] = useState(initialSettings);
  const [events, setEvents] = useState([]);

  const updateSetting = (key, value) =>
    setSettings((current) => ({ ...current, [key]: value }));
  const recordEvent = (name, detail = "") =>
    setEvents((current) => [{ name, detail }, ...current].slice(0, 6));

  const selectedCountry = countries.find((item) => item.country_code === country);
  const visibleCountries = settings.countryMode === "selected" ? [selectedCountry] : countries;
  const propsPreview = {
    label: settings.label,
    value: phone,
    name: settings.name,
    id: settings.id || undefined,
    countryCode: country,
    countries: settings.countryMode === "all" ? `all (${countries.length})` : `selected only (${country})`,
    format: settings.format || "country-based default",
    onChange: "[callback]",
    onCountryChange: "[callback]",
    onFocus: "[callback]",
    onBlur: "[callback]",
    onPaste: "[callback]",
    autoValidate: settings.autoValidate,
    onValidate: "[callback]",
    isValid: settings.visualState === "valid" ? true : undefined,
    isInvalid: settings.visualState === "invalid" ? true : undefined,
    validateText: settings.validateText,
    hideIcons: settings.hideIcons,
    editField: settings.editField ? { label: "Edit", callBack: "[callback]" } : false,
    addon: settings.addon || null,
    likePassword: settings.likePassword,
    disabled: settings.disabled,
    formDisabled: settings.formDisabled,
    readOnly: settings.readOnly,
    required: settings.required,
    disableAutoFill: settings.disableAutoFill,
    unformatted: settings.unformatted,
    className: settings.className,
    placeholder: settings.placeholder,
    searchPlaceholder: settings.searchPlaceholder,
    autoComplete: settings.autoComplete,
  };

  const reset = () => {
    setPhone("2025550123");
    setCountry("US");
    setCountryDialCode("+1");
    setValidation(null);
    setSettings(initialSettings);
    setEvents([]);
  };

  return (
    <div className="demo-shell">
      <header className="demo-header">
        <a className="demo-brand" href="https://github.com/devAIDY" target="_blank" rel="noreferrer">
          <span className="demo-avatar" aria-hidden="true">DA</span>
          <span>devAIDY<span className="demo-brand-dot">/</span></span>
        </a>
        <span className="demo-header-note">react-country-dial-input</span>
        <a className="demo-github" href="https://github.com/devAIDY" target="_blank" rel="noreferrer">
          GitHub profile <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main id="top">
        <section className="demo-hero">
          <div className="demo-eyebrow"><span /> OPEN SOURCE · BUILT BY @devAIDY</div>
          <h1>Phone input for<br /><span>everywhere you connect.</span></h1>
          <p className="demo-lede">
            A country-aware React component with searchable dial codes,
            smart formatting, and validation built in.
          </p>
          <div className="demo-tags">
            <span>243 countries</span><span>Live validation</span><span>React 18+</span>
          </div>
        </section>

        <section className="demo-playground" aria-label="Telephone input playground">
          <div className="demo-playground-main">
            <div className="demo-section-heading">
              <div>
                <span className="demo-kicker">THE PLAYGROUND</span>
                <h2>Give it a try</h2>
              </div>
              <span className="demo-live"><span /> LIVE</span>
            </div>

            <div className="demo-field">
              <TelephoneInput
                label={settings.label}
                name={settings.name}
                id={settings.id || undefined}
                value={phone}
                countryCode={country}
                countries={visibleCountries}
                format={settings.format || undefined}
                onChange={(event) => {
                  setPhone(event.target.value);
                  recordEvent("onChange", event.target.value);
                }}
                onCountryChange={(code, selected) => {
                  setCountry(code);
                  setCountryDialCode(selected.dial_code);
                  recordEvent("onCountryChange", `${code} ${selected.dial_code}`);
                }}
                onFocus={() => recordEvent("onFocus")}
                onBlur={() => recordEvent("onBlur")}
                onPaste={() => recordEvent("onPaste")}
                autoValidate={settings.autoValidate}
                onValidate={(isValid, info) => {
                  setValidation({ isValid, e164: info.phoneNumber });
                  recordEvent("onValidate", isValid ? "valid" : "invalid");
                }}
                isValid={settings.visualState === "valid" ? true : undefined}
                isInvalid={settings.visualState === "invalid" ? true : undefined}
                validateText={settings.validateText}
                hideIcons={settings.hideIcons}
                editField={settings.editField ? { label: "Edit", callBack: () => recordEvent("editField", "clicked") } : false}
                addon={settings.addon ? <span className="demo-input-addon">{settings.addon}</span> : null}
                likePassword={settings.likePassword}
                disabled={settings.disabled}
                formDisabled={settings.formDisabled}
                readOnly={settings.readOnly}
                required={settings.required}
                disableAutoFill={settings.disableAutoFill}
                unformatted={settings.unformatted}
                className={settings.className}
                placeholder={settings.placeholder}
                searchPlaceholder={settings.searchPlaceholder}
                autoComplete={settings.autoComplete}
              />
              <p className="demo-hint">Choose a country and adjust the props below. Changes appear here immediately.</p>
            </div>

            <div className="demo-divider" />

            <div className="demo-section-heading demo-output-heading">
              <div>
                <span className="demo-kicker">YOUR VALUE</span>
                <h2>Ready for your app</h2>
              </div>
              {validation && (
                <span className={`demo-status ${validation.isValid ? "is-valid" : "is-invalid"}`}>
                  <span />{validation.isValid ? "Valid number" : "Check number"}
                </span>
              )}
            </div>

            <div className="demo-result">
              <div className="demo-result-top"><span>INTERNATIONAL FORMAT</span><span>E.164</span></div>
              <strong>{validation?.e164 || "Your number will appear here"}</strong>
            </div>
            <div className="demo-value-summary">
              <span>Country <strong>{country}</strong></span>
              <span>Dial code <strong>{countryDialCode}</strong></span>
              <span>National digits <strong>{phone || "-"}</strong></span>
            </div>
          </div>

          <aside className="demo-playground-aside">
            <div className="demo-aside-icon" aria-hidden="true">◎</div>
            <span className="demo-kicker">MADE FOR REAL FORMS</span>
            <h3>Everything in the right place.</h3>
            <p>Keep form state simple. The input gives you national digits, while validation can return a ready-to-use international number.</p>
            <div className="demo-aside-stat"><strong>{countryDialCode}</strong><span>Country dial code</span></div>
            <div className="demo-aside-stat"><strong>{phone || "-"}</strong><span>National number</span></div>
            <div className="demo-aside-stat"><strong>{validation?.e164 || "-"}</strong><span>E.164 result</span></div>
          </aside>
        </section>

        <section className="demo-control-panel" aria-label="TelephoneInput props controls">
          <div className="demo-control-heading">
            <div>
              <span className="demo-kicker">LIVE COMPONENT CONFIG</span>
              <h2>Props playground</h2>
              <p>Edit the props and watch the preview and object update.</p>
            </div>
            <button className="demo-reset" type="button" onClick={reset}>Reset defaults</button>
          </div>

          <div className="demo-control-layout">
            <div className="demo-control-groups">
              <section className="demo-control-group">
                <h3>Identity and formatting</h3>
                <div className="demo-control-grid">
                  <TextControl label="label" value={settings.label} onChange={(value) => updateSetting("label", value)} />
                  <TextControl label="name" value={settings.name} onChange={(value) => updateSetting("name", value)} />
                  <TextControl label="id" value={settings.id} onChange={(value) => updateSetting("id", value)} />
                  <TextControl label="format" value={settings.format} onChange={(value) => updateSetting("format", value)} placeholder="Country default, or ###-###-####" />
                  <label className="demo-control-field">
                    <span>countryCode</span>
                    <select value={country} onChange={(event) => {
                      const item = countries.find((entry) => entry.country_code === event.target.value);
                      setCountry(item.country_code);
                      setCountryDialCode(item.dial_code);
                    }}>
                      {countries.map((item) => <option key={item.country_code} value={item.country_code}>{item.country} ({item.dial_code})</option>)}
                    </select>
                  </label>
                  <label className="demo-control-field">
                    <span>countries</span>
                    <select value={settings.countryMode} onChange={(event) => updateSetting("countryMode", event.target.value)}>
                      <option value="all">All countries</option>
                      <option value="selected">Selected country only</option>
                    </select>
                  </label>
                  <TextControl label="placeholder" value={settings.placeholder} onChange={(value) => updateSetting("placeholder", value)} />
                  <TextControl label="searchPlaceholder" value={settings.searchPlaceholder} onChange={(value) => updateSetting("searchPlaceholder", value)} />
                  <TextControl label="className" value={settings.className} onChange={(value) => updateSetting("className", value)} />
                  <TextControl label="addon text" value={settings.addon} onChange={(value) => updateSetting("addon", value)} placeholder="Optional right-side text" />
                </div>
              </section>

              <section className="demo-control-group">
                <h3>Validation and input behavior</h3>
                <div className="demo-control-grid">
                  <TextControl label="validateText" value={settings.validateText} onChange={(value) => updateSetting("validateText", value)} />
                  <TextControl label="autoComplete" value={settings.autoComplete} onChange={(value) => updateSetting("autoComplete", value)} />
                  <label className="demo-control-field">
                    <span>isValid / isInvalid</span>
                    <select value={settings.visualState} onChange={(event) => updateSetting("visualState", event.target.value)}>
                      <option value="auto">Automatic</option>
                      <option value="valid">Force valid</option>
                      <option value="invalid">Force invalid</option>
                    </select>
                  </label>
                  <div className="demo-toggle-grid">
                    <ToggleControl label="autoValidate" checked={settings.autoValidate} onChange={(value) => updateSetting("autoValidate", value)} />
                    <ToggleControl label="hideIcons" checked={settings.hideIcons} onChange={(value) => updateSetting("hideIcons", value)} />
                    <ToggleControl label="likePassword" checked={settings.likePassword} onChange={(value) => updateSetting("likePassword", value)} />
                    <ToggleControl label="disabled" checked={settings.disabled} onChange={(value) => updateSetting("disabled", value)} />
                    <ToggleControl label="formDisabled" checked={settings.formDisabled} onChange={(value) => updateSetting("formDisabled", value)} />
                    <ToggleControl label="readOnly" checked={settings.readOnly} onChange={(value) => updateSetting("readOnly", value)} />
                    <ToggleControl label="required" checked={settings.required} onChange={(value) => updateSetting("required", value)} />
                    <ToggleControl label="disableAutoFill" checked={settings.disableAutoFill} onChange={(value) => updateSetting("disableAutoFill", value)} />
                    <ToggleControl label="unformatted" checked={settings.unformatted} onChange={(value) => updateSetting("unformatted", value)} />
                    <ToggleControl label="editField" checked={settings.editField} onChange={(value) => updateSetting("editField", value)} />
                  </div>
                </div>
              </section>
            </div>

            <aside className="demo-inspector">
              <div className="demo-inspector-heading">
                <div><span className="demo-kicker">COMPONENT INPUT</span><h3>Props object</h3></div>
                <span className="demo-live"><span /> LIVE</span>
              </div>
              <pre className="demo-json"><code>{JSON.stringify(propsPreview, null, 2)}</code></pre>
              <div className="demo-event-heading"><strong>Callback events</strong><span>Latest 6</span></div>
              <ul className="demo-events">
                {events.length ? events.map((event, index) => (
                  <li key={`${event.name}-${index}`}><code>{event.name}</code><span>{event.detail || "called"}</span></li>
                )) : <li className="demo-events-empty">Interact with the field to see callbacks.</li>}
              </ul>
            </aside>
          </div>
        </section>

        <section className="demo-extras">
          <div className="demo-extra-copy">
            <span className="demo-kicker">FLEXIBLE BY DESIGN</span>
            <h2>Fits the way you build.</h2>
            <p>Use the built-in country mask or set a custom pattern, then add masked and disabled states as needed.</p>
          </div>
          <div className="demo-extra-card">
            <span className="demo-example-icon" aria-hidden="true">#</span>
            <div><strong>Your format</strong><span>Pass a mask with <code>format</code>.</span></div>
            <TelephoneInput label="Custom format" name="custom-format" countryCode="US" value="2025550123" format="(###) ###-####" />
          </div>
          <div className="demo-extra-card">
            <span className="demo-example-icon" aria-hidden="true">...</span>
            <div><strong>Private by default</strong><span>Mask a number with <code>likePassword</code>.</span></div>
            <TelephoneInput label="Private number" name="masked" countryCode="IN" value="9876543210" likePassword />
          </div>
          <div className="demo-extra-card demo-disabled-card">
            <span className="demo-example-icon" aria-hidden="true">-</span>
            <div><strong>Disabled state</strong><span>Show a field that cannot be changed.</span></div>
            <TelephoneInput label="Phone number" name="disabled" countryCode="US" value="2025550123" disabled />
          </div>
        </section>

        <footer className="demo-footer">
          <a href="https://github.com/devAIDY" target="_blank" rel="noreferrer">Made by devAIDY <span aria-hidden="true">↗</span></a>
          <span>React · MIT License</span>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Demo />);
