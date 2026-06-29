import React from "react";

function InfoPanel({ current }) {
  if (!current) return null;

  return (
    <aside>
      <strong>{current.label}</strong>
      <p>{current.copy}</p>
    </aside>
  );
}

export default InfoPanel;
