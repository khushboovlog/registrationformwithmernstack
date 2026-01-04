import React from "react";

function Settings() {
  return (
    <div className="dashboard">
      <h2>Settings</h2>

      <p style={{ color: "green", fontWeight: "bold" }}>
        🔒 This is a protected Settings page
      </p>

      <p>Only logged-in users can access this page.</p>
    </div>
  );
}

export default Settings;
