import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Self-hosted fonts (bundled into dist/ at build time — no Google Fonts,
// no external requests). Only the weights the design actually uses, and
// only the latin subset (place names are English, so cyrillic/greek/
// vietnamese/latin-ext subsets are dead weight).
import "@fontsource/oswald/latin-500.css";
import "@fontsource/oswald/latin-600.css";
import "@fontsource/oswald/latin-700.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";

createRoot(document.getElementById("root")).render(<App />);
