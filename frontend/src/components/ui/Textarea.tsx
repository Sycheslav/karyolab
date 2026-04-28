import { forwardRef, TextareaHTMLAttributes } from "react";
import { classNames } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, ...props }, ref) => (
    <label className="block w-full">
      {label && <span className="label-cap mb-1.5 block">{label}</span>}
      <textarea
        ref={ref}
        className={classNames("field resize-none py-2.5 leading-relaxed", className)}
        rows={4}
        {...props}
      />
    </label>
  )
);
Textarea.displayName = "Textarea";

export default Textarea;
