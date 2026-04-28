import { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { classNames } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className, children, ...props }, ref) => {
    return (
      <label className="block w-full">
        {label && <span className="label-cap mb-1.5 block">{label}</span>}
        <span className="relative block">
          <select
            ref={ref}
            className={classNames(
              "field appearance-none pr-10",
              "cursor-pointer",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted"
          />
        </span>
      </label>
    );
  }
);
Select.displayName = "Select";

export default Select;
