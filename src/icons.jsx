import { useState } from "react";

// Stroke icons use currentColor, so they follow the CSS `color` of their wrap.
const Stroke = ({ size = 20, children, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

export const ChevronDown = (props) => (
  <Stroke {...props}>
    <path d="m6 9 6 6 6-6" />
  </Stroke>
);

export const Eye = (props) => (
  <Stroke {...props}>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </Stroke>
);

export const EyeOff = (props) => (
  <Stroke {...props}>
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </Stroke>
);

export const PencilLine = (props) => (
  <Stroke {...props}>
    <path d="M13 21h8" />
    <path d="m15 5 4 4" />
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
  </Stroke>
);

// Circled "x" that fills in on hover/touch.
export const CloseButton = ({ size = 30, onClick = () => {}, ...props }) => {
  const [active, setActive] = useState(false);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 31.75 31.75"
      role="button"
      aria-label="Close"
      className="rcdi_close_button"
      onClick={(e) => {
        setActive((prev) => !prev);
        onClick(e);
      }}
      onPointerOver={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
      onTouchCancel={() => setActive(false)}
      {...props}
    >
      <circle
        fill={active ? "currentColor" : "transparent"}
        stroke="currentColor"
        strokeWidth="2"
        strokeMiterlimit="10"
        cx="15.875"
        cy="15.875"
        r="14.994"
      />
      <path
        fill={active ? "var(--rcdi-bg, #fff)" : "currentColor"}
        d="M15.898,14.582l4.293-5.646h1.637l-4.943,6.829l5.146,7.084h-1.586l-4.533-5.889l-4.53,5.889H9.719l5.208-7.084L9.954,8.936H11.6L15.898,14.582z"
      />
    </svg>
  );
};

export const FormValid = ({ size = 12 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 12 12"
    aria-hidden="true"
  >
    <path
      fill="var(--rcdi-success, #0ca24a)"
      d="M11.917,6c0,3.268-2.649,5.917-5.917,5.917S0.083,9.268,0.083,6S2.732,0.083,6,0.083S11.917,2.732,11.917,6z M5.316,9.134l4.39-4.391c0.149-0.149,0.149-0.391,0-0.54l-0.541-0.54c-0.148-0.149-0.39-0.149-0.539,0l-3.581,3.58l-1.672-1.67c-0.149-0.149-0.39-0.149-0.539,0L2.294,6.111c-0.149,0.149-0.149,0.392,0,0.541l2.481,2.481C4.924,9.282,5.167,9.282,5.316,9.134z"
    />
  </svg>
);

export const FormInvalid = ({ size = 12 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 12 12"
    aria-hidden="true"
  >
    <path
      fill="var(--rcdi-danger, #e51313)"
      d="M11.917,6c0,3.268-2.649,5.917-5.917,5.917c-3.267,0-5.917-2.649-5.917-5.917c0-3.267,2.65-5.917,5.917-5.917C9.268,0.083,11.917,2.733,11.917,6z M6,7.193c-0.606,0-1.097,0.491-1.097,1.098c0,0.605,0.491,1.097,1.097,1.097c0.605,0,1.098-0.491,1.098-1.097C7.098,7.685,6.605,7.193,6,7.193z M4.958,3.248l0.177,3.245C5.143,6.645,5.269,6.764,5.42,6.764h1.158c0.153,0,0.277-0.119,0.286-0.271l0.177-3.245C7.051,3.084,6.92,2.946,6.755,2.946H5.244C5.08,2.946,4.949,3.084,4.958,3.248L4.958,3.248z"
    />
  </svg>
);
