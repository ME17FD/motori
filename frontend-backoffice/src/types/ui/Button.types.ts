/**
 * Button Component Type Definitions
 * Exports props interface and style variant enums for Button component.
 */

export type ButtonVariant = "primary" | "outline";
/**
 * Button sizing options.
 */
export type ButtonSize    = "default" | "full";

/**
 * Button component props interface.
 * @param text - Button label text
 * @param variant - Style variant (primary or outline)
 * @param size - Button width (default or full-width)
 * @param type - HTML button type
 * @param disabled - Disable button state
 * @param onClick - Click handler callback
 * @param ariaLabel - Accessibility label
 */
export interface ButtonProps {
  text: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}
