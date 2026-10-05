"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import "../auth-pages.css";

export const dynamic = "force-dynamic";

// Reset Password: same structure/texts/flow as the previous UI.
function ResetInner() {
  const params = useSearchParams();
  const [email, setEmail] = useState(() => params.get("email") || "");
  const [token, setToken] = useState(() => params.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsError(true);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/Auth/Forgot-Password-Confirm", {
        method: "POST",
        body: { email_id: email, transaction_id: token, new_password: password, luu: "website" },
      });
      const data = res?.data || res;
      if (data?.Status === "1" || data?.Status === "true" || data?.Status === true || data?.success === true) {
        setMessage(data?.Message || "Password reset successful. Please login.");
        setIsError(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data?.Message || "Could not reset password. Please try again.");
        setIsError(true);
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "auth-input";

  return (
    <div className="auth-register-page">
      <div className="auth-card">
        <h3>Reset Password</h3>
        {message && (
          <div className={`auth-alert ${isError ? "auth-alert-error" : "auth-alert-success"}`}>
            {message}
          </div>
        )}
        <form onSubmit={submit}>
          <label><span>Email address</span></label>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
          <label><span>Reset Token / Code</span></label>
          <input type="text" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} required className={inputCls} />
          <label><span>New Password</span></label>
          <div className="auth-password-wrap auth-password-field">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <label><span>Confirm New Password</span></label>
          <div className="auth-password-wrap auth-password-field auth-password-field-last">
            <input
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              className="auth-eye"
            >
              <i className={showConfirm ? "bi bi-eye-slash" : "bi bi-eye"} />
            </button>
          </div>
          <button
            type="submit"
            disabled={!email.trim() || !token.trim() || !password.trim() || !confirmPassword.trim() || loading}
            className="auth-submit"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <div className="auth-register-prompt">
          <Link href="/login" className="auth-link">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-md px-4 py-14 text-center">Loading...</p>}>
      <ResetInner />
    </Suspense>
  );
}
