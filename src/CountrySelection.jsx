import { useEffect, useId, useRef, useState } from "react";
import { cx, normalizeCountryCode } from "./utils";
import { CloseButton } from "./icons";
import HighLightText from "./HighLightText";
import useDropdownListHeight from "./useDropdownListHeight";

const dedupe = (data) => {
  const seen = new Set();
  return data.filter((item) => {
    if (seen.has(item.country_code)) return false;
    seen.add(item.country_code);
    return true;
  });
};

// Digits (optionally with "+") match dial codes; one or two letters match ISO
// codes first, then country names; longer text matches country names.
export const filterCountries = (countries, query) => {
  const search = query?.trim();
  if (!search) return countries;

  if (/^\+?\d+$/.test(search)) {
    const dialDigits = search.replace(/\D/g, "");
    return dedupe(
      countries.filter((country) =>
        String(country.dial_code).replace(/\D/g, "").startsWith(dialDigits),
      ),
    );
  }

  const lower = search.toLowerCase();
  const code = normalizeCountryCode(lower);

  const codeMatches =
    code.length <= 2
      ? countries.filter((country) =>
          country.country_code?.toLowerCase().startsWith(code),
        )
      : [];

  const nameMatches = countries.filter((country) =>
    country.country?.toLowerCase().startsWith(lower),
  );

  return dedupe([...codeMatches, ...nameMatches]);
};

const CountrySelection = ({
  countries,
  currentCountry,
  onCountryChange,
  setChangeCountry = () => {},
  triggerRef,
  anchorRef,
  searchPlaceholder = "Search Country",
}) => {
  const [value, setValue] = useState("");
  const selectionRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    const selectionElement = selectionRef.current;
    if (!selectionElement) return;

    // The trigger toggles the list itself. It lets its click reach the window
    // so other open dropdowns close, so skip it here.
    const clickHandler = (e) => {
      if (
        !selectionElement.contains(e.target) &&
        !triggerRef?.current?.contains(e.target)
      ) {
        setChangeCountry(false);
      }
    };

    window.addEventListener("click", clickHandler);
    return () => window.removeEventListener("click", clickHandler);
  }, [setChangeCountry, triggerRef]);

  const list = filterCountries(countries, value);
  const flagCode = currentCountry?.country_code?.toLowerCase();

  useDropdownListHeight({
    isOpen: true,
    listRef,
    anchorRef,
    rowSelector: ":scope > li",
    layoutKey: `${value}:${list.length}`,
  });

  // Center the selected country when the list opens (and again when a search
  // is cleared); while searching, start from the top of the matches.
  useEffect(() => {
    const scrollList = () => {
      const scrollParent = listRef.current;
      if (!scrollParent) return;

      if (value.length > 0) {
        scrollParent.scrollTop = 0;
        return;
      }

      const activeItem = scrollParent.querySelector("li.active");
      if (!activeItem) return;

      const itemRect = activeItem.getBoundingClientRect();
      const parentRect = scrollParent.getBoundingClientRect();

      scrollParent.scrollTop +=
        itemRect.top -
        parentRect.top -
        (scrollParent.clientHeight - activeItem.offsetHeight) / 2;
    };

    const frame = requestAnimationFrame(scrollList);
    return () => cancelAnimationFrame(frame);
  }, [value, list.length]);

  const select = (country) => {
    onCountryChange(country.country_code, country);
    setChangeCountry(false);
  };

  return (
    <div className="country_list_wrap">
      <div className="country_selection_wrap" ref={selectionRef}>
        <div className="search_box_wrap">
          <input
            value={value}
            onChange={(e) => {
              const next = e.target.value;
              if (next === "" || /^[A-Za-z0-9+ ]+$/.test(next)) setValue(next);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setChangeCountry(false);
              if (e.key === "Enter" && list.length) {
                e.preventDefault();
                select(list[0]);
              }
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            className="search_country_area"
            autoComplete="off"
          />

          <div className="close_search_box">
            <CloseButton onClick={() => setChangeCountry(false)} />
          </div>
        </div>

        <ul role="listbox" id={listId} ref={listRef}>
          {list.map((country) => {
            const code = country.country_code?.toLowerCase();
            const isActive = flagCode === code;
            return (
              <li
                role="option"
                aria-selected={isActive}
                key={country.country_code}
                onClick={() => select(country)}
                className={cx({ active: isActive })}
              >
                <div className="country_items">
                  <div className="country_logo_name_wrap">
                    <div className="country_logo_wrap">
                      <span className={`fi fi-${code}`} title={country.country} />
                    </div>
                    <div className="country_code">
                      <HighLightText search={value} text={country.country} /> (
                      <HighLightText
                        search={value}
                        text={
                          country.country_code === "GB"
                            ? "UK"
                            : country.country_code
                        }
                      />
                      )
                    </div>
                  </div>

                  <div className="dial_code">
                    <HighLightText search={value} text={country.dial_code} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CountrySelection;
