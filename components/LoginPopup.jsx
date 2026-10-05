"use client";

import { useRouter } from "next/navigation";

// Guest nudge: same texts/flow as the previous UI.
export default function LoginPopup({ onSkip }) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55"
    >
      <div
        className="login-popup-card w-[90%] max-w-[380px] bg-white text-center shadow-xl"
      >
        <h2 className="login-popup-title">Welcome to Harry Clinton</h2>
        <p className="login-popup-subtitle">
          Login to enjoy a personalised experience, save addresses, and track your orders.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="login-popup-login"
        >
          Login / Register
        </button>
        <button onClick={onSkip} className="login-popup-guest">
          Continue as Guest
        </button>
      </div>
      <style jsx>{`
        .login-popup-card {
          padding: 36px 28px;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        }
        .login-popup-title {
          margin: 0 0 12px;
          color: #111;
          font-family: "MAINLUX", Arial, sans-serif;
          font-size: 22px !important;
          font-weight: 700;
        }
        .login-popup-subtitle {
          margin: 0 0 24px;
          color: #555;
          font-size: 14px;
          line-height: 1.6;
        }
        .login-popup-card button {
          display: block;
          width: 100%;
          cursor: pointer;
          font-family: "MAINLUX", Arial, sans-serif;
        }
        .login-popup-login {
          margin: 0 0 12px;
          padding: 13px;
          border: 0;
          border-radius: 8px !important;
          background: #111;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
        }
        .login-popup-guest {
          padding: 11px;
          border: 1px solid #ccc;
          border-radius: 8px !important;
          background: transparent;
          color: #555;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
