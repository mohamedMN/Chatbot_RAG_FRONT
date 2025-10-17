// src/components/Logo.jsx
import React from "react";
import logo from "../assets/orange-logo.png"; // if you used /public, replace with "/orange-logo.png"

export default function Logo({ size = 32 }) {
  return (
    <a
      href="http://localhost:5173/"
      title="Accueil"
      className="inline-flex items-center"
    >
      <img
        src={logo}
        alt="Orange"
        width={size}
        height={size}
        className="h-8 w-8 md:h-[var(--size)] md:w-[var(--size)] object-contain shrink-0"
        style={{ ["--size"]: `${size}px` }}
      />
    </a>
  );
}
