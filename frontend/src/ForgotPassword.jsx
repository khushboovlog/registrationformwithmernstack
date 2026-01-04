import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showResetLink, setShowResetLink] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setShowResetLink(false);

    try {
      const res = await axios.post(
        "http://localhost:3001/forgot-password",
        { email }
      );

      setMessage(
        typeof res.data === "string" ? res.data : res.data.message
      );

      // ✅ show reset link after OTP sent
      setShowResetLink(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to send OTP"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button type="submit">Send OTP</button>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {/* ✅ Reset password link */}
      {showResetLink && (
        <p className="plain-text">
          <Link to="/reset-password" className="login-link">
            Reset Password
          </Link>
        </p>
      )}
    </form>
  );
}

export default ForgotPassword;
