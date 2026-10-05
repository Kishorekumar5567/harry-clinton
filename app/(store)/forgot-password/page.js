"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import "../auth-pages.css";

// Forgot Password: same structure/texts/flow as the previous UI.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch("/Auth/Forgot-Password", {
        method: "POST",
        body: { email_id: email, rcu: "website" },
      });
      const data = res?.data || res;
      if (data?.Status === "1" || data?.Status === "true" || data?.Status === true || data?.success === true) {
        setMessage(data?.Message || "Reset instructions sent. Please check your email.");
        setIsError(false);
      } else {
        setMessage(data?.Message || "Could not send reset instructions. Please try again.");
        setIsError(true);
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-register-page">
      <div className="auth-card">
        <h3>Forgot Password</h3>
        {message && (
          <div className={`auth-alert ${isError ? "auth-alert-error" : "auth-alert-success"}`}>
            {message}
          </div>
        )}
        <form onSubmit={submit}>
          <label><span>Email address</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
            className="auth-input"
          />
          <button
            type="submit"
            disabled={!email.trim() || loading}
            className="auth-submit"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="auth-register-prompt">
          <Link href="/login" className="auth-link">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
