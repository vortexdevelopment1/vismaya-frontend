"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * Official Google 4-color "G" Logo SVG
 */
function GoogleGIcon({ size = 18 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/**
 * Reusable Google Sign-In / Sign-Up Button Component
 *
 * @param {Object} props
 * @param {string} [props.label="Continue with Google"] - Button label text
 * @param {Function} [props.onClick] - Click handler
 * @param {boolean} [props.loading=false] - Loading spinner state
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.error=""] - Error message displayed below the button
 * @param {string} [props.helperText=""] - Helper message displayed below the button
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {Object} [props.style={}] - Inline styles override
 */
export default function GoogleButton({
  label = "Continue with Google",
  onClick,
  loading = false,
  disabled = false,
  error = "",
  helperText = "",
  className = "",
  style = {},
  ...props
}) {
  const isActionDisabled = disabled || loading;

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <button
        type="button"
        onClick={onClick}
        disabled={isActionDisabled}
        aria-label={label}
        aria-busy={loading}
        className={`vismaya-google-btn ${className}`}
        style={{
          width: "100%",
          minHeight: "50px",
          height: "50px",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          backgroundColor: "#ffffff",
          color: "#1e293b",
          border: "1px solid var(--border, rgba(255, 255, 255, 0.14))",
          borderRadius: "var(--radius-btn, 12px)",
          fontFamily: 'var(--font-body), "Inter", sans-serif',
          fontSize: "13px",
          fontWeight: "700",
          letterSpacing: "0.02em",
          textDecoration: "none",
          whiteSpace: "nowrap",
          cursor: isActionDisabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
          transition: "background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
          boxSizing: "border-box",
          ...style,
        }}
        {...props}
      >
        {loading ? (
          <span
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid rgba(30, 41, 59, 0.2)",
              borderTopColor: "#1e293b",
              borderRadius: "50%",
              display: "inline-block",
              animation: "googleSpin 0.75s linear infinite",
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
        ) : (
          <GoogleGIcon size={18} />
        )}
        <span style={{ whiteSpace: "nowrap" }}>{label}</span>
      </button>

      {/* Error message area */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            marginTop: "8px",
            color: "#fca5a5",
            fontSize: "12px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text area (visible when not in error) */}
      {!error && helperText && (
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: "12px",
            color: "#a3acc2",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {helperText}
        </p>
      )}

      <style jsx>{`
        .vismaya-google-btn:not(:disabled):hover {
          background-color: #f8fafc !important;
          border-color: rgba(255, 255, 255, 0.35) !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22) !important;
        }
        .vismaya-google-btn:focus-visible {
          outline: 3px solid var(--gold, #ffbc00) !important;
          outline-offset: 2px !important;
        }
        .vismaya-google-btn:not(:disabled):active {
          background-color: #f1f5f9 !important;
        }
        @keyframes googleSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
