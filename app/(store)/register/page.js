"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import "../auth-pages.css";

// Register: same structure/texts as the previous UI —
// Full Name, Email, Mobile, Password, policy checkbox gate.
export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const valid = fullName.trim() && email.trim() && mobile.trim() && password && acceptPolicy;

  const submit = async (e) => {
    e.preventDefault();
    if (!acceptPolicy) {
      setError("Please accept Privacy Policy & Terms");
      return;
    }
    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!/^[+\d][\d\s-]{7,}$/.test(mobile.trim())) {
      setError("Please enter a valid mobile number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const res = await apiFetch("/Auth/Register", {
        method: "POST",
        body: {
          full_name: fullName.trim(),
          email_id: email.trim(),
          mobile_number: mobile.trim(),
          password,
          rcu: "website",
        },
      });
      setError(res?.Message || "Registration successful!");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "auth-input";

  return (
    <div className="auth-register-page">
      <Link href="/" className="auth-home-link" aria-label="Home"><i className="bi bi-house-door-fill" /></Link>
      <div className="auth-card">
      <h3>Register</h3>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={submit}>
        <label>
          <span>Full Name</span>
          <input name="full_name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" required className={inputCls} />
        </label>
        <label>
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" required className={inputCls} />
        </label>
        <label>
          <span>Mobile</span>
          <input type="tel" autoComplete="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter your mobile number" required className={inputCls} />
        </label>
        <label>
          <span>Password</span>
          <div className="auth-password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="auth-eye"
            >
              <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} />
            </button>
          </div>
        </label>
        <label className="auth-policy">
          <input id="policy" type="checkbox" checked={acceptPolicy} onChange={(e) => setAcceptPolicy(e.target.checked)} className="mt-1" />
          <span>
            Accept{" "}
            <Link href="/privacy-policy" target="_blank" className="underline">Privacy</Link>
            {" & "}
            <Link href="/terms-and-conditions" target="_blank" className="underline">Terms</Link>
          </span>
        </label>
        <button disabled={busy || !valid} className="auth-submit">
          {busy ? "Creating..." : "Register"}
        </button>
      </form>
      <p className="auth-register-prompt">
        Already have an account?{" "}
        <Link href="/login" className="auth-link">Login</Link>
      </p>
      </div>
    </div>
  );
}
