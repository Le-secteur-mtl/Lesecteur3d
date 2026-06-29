import React from "react";
import { VIEWS } from "../config/views";

function HUD({ view, setView, mode, setMode }) {
  return (
    <header className="hud">
      <div className="brand">
        <strong>Le Secteur MTL</strong>
        <span>Prototype 3D premium</span>
      </div>

      <nav>
        {Object.entries(VIEWS).map(([key, item]) => (
          <button
            key={key}
            className={view === key ? "active" : ""}
            onClick={() => setView(key)}
            title={item.copy}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <nav>
        {[
          { key: "day", label: "Jour" },
          { key: "evening", label: "Soir" },
          { key: "night", label: "Nuit" }
        ].map(({ key, label }) => (
          <button
            key={key}
            className={mode === key ? "active" : ""}
            onClick={() => setMode(key)}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default HUD;
