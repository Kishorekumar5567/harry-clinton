"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveSession, isAdminRole, throwIfAuthFailed } from "../auth";
import "../auth-pages.css";

// Login: same structure/texts as the previous UI —
// OTP block, "or" divider, password block with eye toggle.
// Admins land on /admin after login, everyone else on /.
export default function LoginPage() {
  const router = useRouter();
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const afterLogin = (roleCode) => {
    router.push(isAdminRole(roleCode) ? "/admin" : "/");
  };

  const otpIdentity = (value) => ({ email_id: (value || "").trim() });

  const sendOtp = async () => {
    const v = (otpEmail || "").trim();
    if (!v) {
      setOtpMessage("Enter your email.");
      return;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!isEmail) {
      setOtpMessage("Enter a valid email address.");
      return;
    }
    setSendingOtp(true);
    setOtpMessage("");
    try {
      const sent = await apiFetch("/Auth/OTP-Login", { method: "POST", body: otpIdentity(otpEmail) });
      throwIfAuthFailed(sent, "Failed to send OTP.");
      setOtpSent(true);
      setOtpMessage("OTP sent! Check your email.");
    } catch (err) {
      setOtpMessage(err.message || "Failed to send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setOtpMessage("Enter the OTP.");
      return;
    }
    setVerifying(true);
    setOtpMessage("");
    try {
      const res = await apiFetch("/Auth/Verify-Login-OTP", {
        method: "POST",
        body: { ...otpIdentity(otpEmail), otp: otp.trim() },
      });
      throwIfAuthFailed(res, "Invalid OTP.");
      afterLogin(saveSession(res));
    } catch (err) {
      setOtpMessage(err.message || "Invalid OTP." || "OTP verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const passwordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const res = await apiFetch("/Auth/Password-Login", {
        method: "POST",
        body: { email_id: email.trim(), password },
      });
      throwIfAuthFailed(res, "Login failed.");
      afterLogin(saveSession(res));
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "auth-input";

  return (
    <div className="auth-login-page">
      <div className="auth-card">
      <h2>Login</h2>
      {error && <p className="auth-error">{error}</p>}

      <div>
        <label>
          <span>Email</span>
          <input type="email" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} placeholder="Enter your email" className={inputCls} />
        </label>
        {otpSent ? (
          <>
            <label>
              <span>Enter OTP</span>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP from email" className={inputCls} />
            </label>
            <button onClick={verifyOtp} disabled={verifying} className="auth-submit">
              {verifying ? "Verifying..." : "Verify OTP & Login"}
            </button>
            <p className="auth-register-prompt">
              Didn&apos;t receive?{" "}
              <button onClick={sendOtp} disabled={sendingOtp} className="auth-link">
                Resend OTP
              </button>
            </p>
          </>
        ) : (
          <button onClick={sendOtp} disabled={sendingOtp} className="auth-submit">
            {sendingOtp ? "Sending..." : "Send OTP"}
          </button>
        )}
        {otpMessage && <p className={`auth-message ${otpMessage.includes("sent") ? "is-success" : "is-error"}`}>{otpMessage}</p>}
      </div>

      <div className="auth-divider">
        <span className="auth-divider-line" />
        <span className="auth-divider-label">or</span>
        <span className="auth-divider-line" />
      </div>

      <form onSubmit={passwordLogin}>
        <label>
          <span>Email ID</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className={inputCls} />
        </label>
        <label>
          <span>Password</span>
          <div className="auth-password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
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
        <p className="auth-forgot">
          <Link href="/forgot-password" className="auth-link">Forgot password?</Link>
        </p>
        <button disabled={busy} className="auth-submit">
          {busy ? "Logging in..." : "Login with Password"}
        </button>
      </form>

      <p className="auth-register-prompt">
        Not a user?{" "}
        <Link href="/register" className="auth-link">Register</Link>
      </p>
      </div>
    </div>
  );
}
