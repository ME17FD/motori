/**
 * Reusable Button Component
 * Provides consistent button styling across the application.
 * Supports multiple variants (primary, secondary, danger) and sizes (default, full).
 * Used throughout admin pages for actions (save, delete, edit, create).
 */

import React from "react";
import "../../styles/Button/Button.css";
import type { ButtonProps } from "../../types/ui/Button.types";

/**
 * Button component with customizable variant, size, and accessibility.
 * @param text - Button label text
 * @param variant - Style variant (primary, secondary, danger)
 * @param size - Width sizing (default, full)
 * @param type - HTML button type (button, submit, reset)
 * @param disabled - Disable button interaction
 * @param onClick - Click handler function
 * @param ariaLabel - Accessibility label (defaults to text)
 */
const Button: React.FC<ButtonProps> = ({
  text,
  variant  = "primary",
  size     = "default",
  type     = "button",
  disabled = false,
  onClick,
  ariaLabel,
}) => {
  const classes = [
    "btn",
    `btn--${variant}`,
    size === "full" ? "btn--full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel ?? text}
    >
      {text}
    </button>
  );
};

export default Button;
