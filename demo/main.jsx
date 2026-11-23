import { useState } from "react";
import { createRoot } from "react-dom/client";
import "flag-icons/css/flag-icons.min.css";
import "../src/style.css";
import TelephoneInput from "../src";

function Demo() {
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("US");
  const [validation, setValidation] = useState(null);

  return (
    <>
      <h1>react-country-dial-input</h1>

      <div className="row">
        <TelephoneInput
          label="Phone number"
          name="phone"
          value={phone}
          countryCode={country}
          onChange={(e) => setPhone(e.target.value)}
          onCountryChange={(code) => setCountry(code)}
          autoValidate
          onValidate={(isValid, info) =>
            setValidation({ isValid, e164: info.phoneNumber })
          }
        />
      </div>
      <pre>{JSON.stringify({ country, phone, validation }, null, 2)}</pre>

      <div className="row">
        <TelephoneInput
          label="Masked, with edit link"
          name="masked"
          countryCode="IN"
          value="9876543210"
          likePassword
          editField={{ label: "Edit", callBack: () => {} }}
        />
      </div>

      <div className="row">
        <TelephoneInput label="Disabled form" name="off" formDisabled />
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Demo />);
