import { forwardRef, ButtonHTMLAttributes } from "react";
import { classNames } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-soft hover:bg-brand-dark active:translate-y-px",
  dark: "bg-brand-dark text-white hover:bg-brand-deep active:translate-y-px",
  secondary:
    "bg-brand-cream text-brand-deep border border-brand-line hover:bg-brand-mint",
  outline:
    "bg-white text-brand-deep border border-brand-line hover:bg-brand-mint",
  ghost: "text-brand-deep hover:bg-brand-cream/60",
  danger:
    "bg-brand-danger text-white hover:brightness-95 active:translate-y-px",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[12.5px]",
  md: "h-10 px-4 text-[13.5px]",
  lg: "h-11 px-5 text-[14px]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={classNames(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";

export default Button;
