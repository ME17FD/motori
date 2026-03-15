import React from "react";
import "../../styles/Button/Button.css";
import type { ButtonProps } from "../../types/ui/Button.types";

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
