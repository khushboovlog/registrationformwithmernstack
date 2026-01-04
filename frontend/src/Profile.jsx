import React from "react";

function Profile() {
  return (
    <div className="dashboard">
      <h2>Profile</h2>

      <p style={{ color: "green", fontWeight: "bold" }}>
        🔒 This is a protected Profile page
      </p>

      <p>User information is visible only after login.</p>
    </div>
  );
}

export default Profile;
