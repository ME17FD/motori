import React from "react";
import "../../../styles/components/Button.css";
import type { ButtonProps } from "../../../types/ui/Button.types";

/**
 * Primary action control used across marketing and catalog pages.
 *
 * @param props.text - Visible button label
 * @param props.variant - Visual style: primary, outline, or secondary
 * @param props.size - Layout: default or full-width
 * @param props.type - HTML button type (submit for forms, button otherwise)
 * @param props.disabled - Disables interaction and dims the control
 * @param props.onClick - Click handler
 * @param props.ariaLabel - Optional override for assistive text (defaults to `text`)
 */
const Button: React.FC<ButtonProps> = ({
  text,
  variant = "primary",
  size = "default",
  type = "button",
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
