import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import TelephoneInput, {
  countries,
  filterCountries,
  findCountry,
  getPhoneFormat,
  getPhoneInfo,
  validatePhone,
} from "../src";

let container, root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});

const trigger = () => container.querySelector(".current_country_wrap");
const list = () => container.querySelector(".country_list_wrap");
const comboList = () => container.querySelector('[role="listbox"]');
const click = (el) =>
  act(() => el.dispatchEvent(new MouseEvent("click", { bubbles: true })));

describe("country list", () => {
  it("lets the opening click reach the window so other dropdowns close", async () => {
    await act(() => root.render(<TelephoneInput id="phone" name="phone" />));
    const onWindowClick = vi.fn();
    window.addEventListener("click", onWindowClick);

    await click(trigger());

    window.removeEventListener("click", onWindowClick);
    expect(onWindowClick).toHaveBeenCalled();
    expect(list()).not.toBeNull();
  });

  it("toggles closed from the trigger and closes on an outside click", async () => {
    await act(() => root.render(<TelephoneInput id="phone" name="phone" />));

    await click(trigger());
    await click(trigger());
    expect(list()).toBeNull();

    await click(trigger());
    await click(document.body);
    expect(list()).toBeNull();
  });

  it("does not open when disabled", async () => {
    await act(() => root.render(<TelephoneInput name="phone" disabled />));
    await click(trigger());
    expect(list()).toBeNull();
  });

  it("reports the code and country object on selection", async () => {
    const onCountryChange = vi.fn();
    await act(() =>
      root.render(
        <TelephoneInput name="phone" onCountryChange={onCountryChange} />,
      ),
    );
    await click(trigger());
    const india = [...comboList().children].find((li) =>
      li.textContent.startsWith("India ("),
    );
    await click(india);

    expect(onCountryChange).toHaveBeenCalledWith(
      "IN",
      expect.objectContaining({ country: "India", dial_code: "+91" }),
    );
    expect(list()).toBeNull();
  });

  it("gives each instance its own list id", async () => {
    await act(() =>
      root.render(
        <>
          <TelephoneInput name="a" />
          <TelephoneInput name="b" />
        </>,
      ),
    );
    const [a, b] = container.querySelectorAll(".current_country_wrap");
    await click(a);
    const idA = comboList().id;
    await click(b);
    expect(comboList().id).not.toBe(idA);
  });

  describe("scrolling to the selected country", () => {
    // jsdom has no layout: give every row a 40px slot in a 200px list, so the
    // list's scrollTop says which row it centered.
    const ROW = 40;
    const LIST_HEIGHT = 200;

    beforeEach(() => {
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
        function () {
          const listEl = this.closest?.('[role="listbox"]');
          if (this.tagName === "LI" && listEl) {
            const index = [...listEl.children].indexOf(this);
            const top = index * ROW - listEl.scrollTop;
            return { top, bottom: top + ROW, height: ROW, left: 0, right: 0 };
          }
          return { top: 0, bottom: 0, height: 0, left: 0, right: 0 };
        },
      );
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(
        function () {
          return this.getAttribute("role") === "listbox" ? LIST_HEIGHT : 0;
        },
      );
      vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
        function () {
          return this.tagName === "LI" ? ROW : 0;
        },
      );
    });

    afterEach(() => vi.restoreAllMocks());

    const nextFrame = () =>
      act(() => new Promise((r) => requestAnimationFrame(() => r())));
    const rows = () => [...comboList().children];
    const centeredIndex = () =>
      Math.round((comboList().scrollTop + (LIST_HEIGHT - ROW) / 2) / ROW);

    function Harness() {
      const [code, setCode] = useState("us");
      return (
        <TelephoneInput
          id="phone"
          name="phone"
          countryCode={code}
          onCountryChange={setCode}
        />
      );
    }

    it("opens centered on the selected country", async () => {
      await act(() => root.render(<Harness />));
      await click(trigger());
      await nextFrame();

      const active = comboList().querySelector("li.active");
      expect(active.textContent).toContain("United States");
      expect(centeredIndex()).toBe(rows().indexOf(active));
    });

    it("reopens centered on a country the user just changed to", async () => {
      await act(() => root.render(<Harness />));
      await click(trigger());
      await nextFrame();

      const india = rows().find((li) => li.textContent.startsWith("India ("));
      await click(india);
      expect(list()).toBeNull();

      await click(trigger());
      await nextFrame();

      const active = comboList().querySelector("li.active");
      expect(active.textContent).toMatch(/^India \(/);
      expect(centeredIndex()).toBe(rows().indexOf(active));
    });
  });
});

describe("input length follows the country", () => {
  let stored;

  function Harness({ country, unformatted }) {
    const [value, setValue] = useState("");
    stored = value;
    return (
      <TelephoneInput
        id="phone"
        name="phone"
        countryCode={country}
        value={value}
        unformatted={unformatted}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  }

  const typeDigits = async (digits) => {
    for (const ch of digits) {
      const el = container.querySelector("#phone");
      await act(() => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        ).set.call(el, el.value + ch);
        el.dispatchEvent(
          new InputEvent("input", { bubbles: true, inputType: "insertText" }),
        );
      });
    }
  };

  it.each([
    ["de", "15123456789", "151 234 56789"],
    ["at", "66412345678901", "664 123 456 78901"],
    ["bs", "2423571234", "242 357 1234"],
  ])("%s takes a full %s", async (country, digits, shown) => {
    await act(() => root.render(<Harness country={country} />));
    await act(() => container.querySelector("#phone").focus());
    await typeDigits(digits);

    expect(stored).toBe(digits);
    expect(container.querySelector("#phone").value).toBe(shown);
  });

  it("caps an unformatted field at the country length", async () => {
    await act(() => root.render(<Harness country="us" unformatted />));
    await act(() => container.querySelector("#phone").focus());
    await typeDigits("555123456789");

    expect(stored).toBe("5551234567");
    expect(container.querySelector("#phone").value).toBe("5551234567");
  });
});

describe("rendering", () => {
  it("shows the flag and dial code of the selected country", async () => {
    await act(() => root.render(<TelephoneInput name="p" countryCode="uk" />));
    expect(trigger().querySelector(".fi").className).toBe("fi fi-gb");
    expect(trigger().textContent).toContain("+44");
  });

  it("shows the validation message when invalid", async () => {
    await act(() =>
      root.render(
        <TelephoneInput name="p" isInvalid validateText="Bad number" />,
      ),
    );
    expect(container.querySelector('[role="alert"]').textContent).toBe(
      "Bad number",
    );
    expect(container.querySelector("input").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });

  it("forwards extra props to the input and renders the addon", async () => {
    await act(() =>
      root.render(
        <TelephoneInput
          name="p"
          data-testid="tel"
          addon={<span className="my-addon">x</span>}
        />,
      ),
    );
    expect(container.querySelector('[data-testid="tel"]').tagName).toBe(
      "INPUT",
    );
    expect(container.querySelector(".my-addon")).not.toBeNull();
  });
});

describe("helpers", () => {
  it("findCountry treats UK as GB and defaults to US", () => {
    expect(findCountry(countries, "UK").country_code).toBe("GB");
    expect(findCountry(countries).country_code).toBe("US");
  });

  it("getPhoneFormat follows ph_length", () => {
    expect(getPhoneFormat({ ph_length: 9 })).toBe("### ### ###");
    expect(getPhoneFormat(undefined)).toBe("### ### ####");
  });

  it("filterCountries matches dial codes, ISO codes and names", () => {
    expect(filterCountries(countries, "+91")[0].country).toBe("India");
    expect(filterCountries(countries, "uk")[0].country_code).toBe("GB");
    expect(
      filterCountries(countries, "ger").map((c) => c.country_code),
    ).toContain("DE");
  });
});

describe("validatePhone", () => {
  it.each([
    ["9876543210", "in", true],
    ["2025550123", "us", true],
    ["2025550123", "US", true],
    ["7400123456", "uk", true],
    ["7700900123", "je", true], // Jersey validates as GB
    ["5551234567", "us", false], // 555 area code is not real
    ["07400123456", "gb", false], // trunk 0 rejected
    ["123", "us", false],
    ["", "us", false],
  ])("%s / %s -> %s", (number, country, expected) => {
    expect(validatePhone(number, country)).toBe(expected);
  });

  it("ignores spaces and punctuation", () => {
    expect(validatePhone("202 555-0123", "us")).toBe(true);
  });

  it("getPhoneInfo returns the E.164 number", () => {
    expect(getPhoneInfo("9876543210", "in")).toMatchObject({
      isValid: true,
      phoneNumber: "+919876543210",
      countryIso2: "IN",
    });
    expect(getPhoneInfo("1", "in").phoneNumber).toBeNull();
  });
});

describe("autoValidate", () => {
  const input = () => container.querySelector("input");
  const wrapper = () => container.querySelector(".for_telephone_wrapper");

  it("shows valid immediately for a valid number", async () => {
    await act(() =>
      root.render(
        <TelephoneInput name="p" countryCode="us" value="2025550123" autoValidate />,
      ),
    );
    expect(wrapper().classList.contains("valid_telefone")).toBe(true);
  });

  it("shows invalid with the default message only after blur", async () => {
    await act(() =>
      root.render(
        <TelephoneInput name="p" countryCode="us" value="20255" autoValidate />,
      ),
    );
    expect(wrapper().classList.contains("invalid_telefone")).toBe(false);

    await act(() => input().focus());
    await act(() => input().blur());
    await act(() => new Promise((r) => requestAnimationFrame(r)));

    expect(wrapper().classList.contains("invalid_telefone")).toBe(true);
    expect(container.querySelector('[role="alert"]').textContent).toBe(
      "Please enter a valid phone number",
    );
  });

  it("lets isValid/isInvalid props override it", async () => {
    await act(() =>
      root.render(
        <TelephoneInput
          name="p"
          countryCode="us"
          value="2025550123"
          autoValidate
          isValid={false}
          isInvalid={false}
        />,
      ),
    );
    expect(wrapper().classList.contains("valid_telefone")).toBe(false);
  });

  it("calls onValidate when validity changes, including on country change", async () => {
    const onValidate = vi.fn();
    const render = (country) =>
      act(() =>
        root.render(
          <TelephoneInput
            name="p"
            countryCode={country}
            value="9876543210"
            onValidate={onValidate}
          />,
        ),
      );

    await render("in");
    expect(onValidate).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ phoneNumber: "+919876543210", value: "9876543210" }),
    );

    await render("us");
    expect(onValidate).toHaveBeenLastCalledWith(false, expect.anything());
    expect(onValidate).toHaveBeenCalledTimes(2);

    await render("us"); // same result: not called again
    expect(onValidate).toHaveBeenCalledTimes(2);
  });
});
