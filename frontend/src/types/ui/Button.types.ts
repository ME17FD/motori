export type ButtonVariant = "primary" | "outline";
export type ButtonSize    = "default" | "full";

export interface ButtonProps {
  text: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}
