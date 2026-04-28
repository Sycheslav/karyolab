import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { classNames } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, leading, trailing, error, className, ...props }, ref) => {
    return (
      <label className="block w-full">
        {label && <span className="label-cap mb-1.5 block">{label}</span>}
        <span
          className={classNames(
            "field flex items-center gap-2 px-3.5 py-2.5",
            error && "border-brand-danger focus-within:ring-brand-danger/20",
            className
          )}
        >
          {leading && <span className="text-brand-muted">{leading}</span>}
          <input
            ref={ref}
            className="w-full bg-transparent text-sm text-brand-deep outline-none placeholder:text-brand-muted/70"
            {...props}
          />
          {trailing && <span className="text-brand-muted">{trailing}</span>}
        </span>
        {hint && !error && (
          <span className="mt-1 block text-[11.5px] text-brand-muted">
            {hint}
          </span>
        )}
        {error && (
          <span className="mt-1 block text-[11.5px] text-brand-danger">
            {error}
          </span>
        )}
      </label>
    );
  }
);
Input.displayName = "Input";

export default Input;
