import React from "react";
import { Link } from "react-router-dom";

/**
 * Tombol — Button/Link serbaguna (backward-compatible)
 * - Tetap pakai class: `btn ${style}`
 * - Meneruskan className tambahan dari pemanggil (fix utama)
 * - Fitur opsional: iconPosition, isLoading, block, ariaLabel
 */
const Tombol = ({
  style = "kotak",
  text = "HARUS DI ISI YA",
  link = "",
  icon = null,
  iconPosition = "right", // "left" | "right"
  onClick = () => {},
  type = "button",
  disabled = false,
  isLoading = false,
  block = false,
  ariaLabel,
  className: extraClass = "",   // <— BARU: terima className dari luar
  children,                      // children override `text`
}) => {
  const label = children ?? text;

  const classes = [
    "btn",
    style,
    extraClass,                  // <— BARU: gabungkan className eksternal
    block ? "btn--block" : "",
    disabled ? "is-disabled" : "",
    isLoading ? "is-loading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e) => {
    if (disabled || isLoading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  const IconWrap = ({ side }) =>
    icon ? (
      <span
        className="btn__icon"
        style={side === "left" ? { marginRight: 8 } : { marginLeft: 8 }}
        aria-hidden="true"
      >
        {icon}
      </span>
    ) : null;

  const Spinner = () =>
    isLoading ? (
      <span className="btn__spinner" aria-hidden="true" style={{ marginLeft: 8 }}>
        {/* SVG spinner mandiri */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" role="img" aria-label="Loading">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
          </path>
        </svg>
      </span>
    ) : null;

  const content = (
    <>
      {icon && iconPosition === "left" && <IconWrap side="left" />}
      <span className="btn__label">{label}</span>
      {icon && iconPosition === "right" && <IconWrap side="right" />}
      <Spinner />
    </>
  );

  if (link) {
    return (
      <Link
        to={link}
        onClick={handleClick}
        className={classes}
        aria-disabled={disabled || isLoading ? "true" : undefined}
        aria-busy={isLoading ? "true" : undefined}
        aria-label={ariaLabel}
        style={disabled || isLoading ? { pointerEvents: "none", opacity: 0.7 } : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={handleClick}
      type={type}
      disabled={disabled}
      className={classes}
      aria-busy={isLoading ? "true" : undefined}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};

export default Tombol;
