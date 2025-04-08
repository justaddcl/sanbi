import * as React from "react";

import { cn } from "@lib/utils";

function mergeRefs<T>(
  ...refs: (React.Ref<T> | null | undefined)[]
): React.RefCallback<T> {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        // Cast to MutableRefObject to allow assignment.
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    autoResize?: boolean;
  };

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ autoResize = true, onChange, className, ...props }, forwardedRef) => {
    // Create a local ref for DOM access.
    const innerRef = React.useRef<HTMLTextAreaElement>(null);

    // Merge the local ref with the forwarded ref.
    const combinedRef = mergeRefs(innerRef, forwardedRef);

    // A helper function to resize the textarea.
    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
      textarea.style.height = "auto";
      // Adding a little extra space (8px) to avoid clipping
      textarea.style.height = `${textarea.scrollHeight + 8}px`;
    };

    // Call the resize function on mount and when the value changes.
    React.useLayoutEffect(() => {
      if (autoResize && innerRef.current) {
        resizeTextarea(innerRef.current);
      }
    }, [autoResize, props.value]);

    // Wrap the onChange event so we auto-resize with every change.
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        resizeTextarea(e.target);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={combinedRef}
        {...props}
        onChange={handleChange}
      />
    );
  },
);
Textarea.displayName = "Textarea";
