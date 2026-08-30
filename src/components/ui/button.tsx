import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "cyan"
    | "emerald"
    | "amber";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-heading font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98] select-none";

    const variantStyles: Record<string, string> = {
      primary:
        "bg-white text-black hover:bg-zinc-200 focus-visible:ring-white font-bold",
      secondary:
        "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 focus-visible:ring-zinc-400",
      outline:
        "bg-transparent hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 focus-visible:ring-zinc-500",
      ghost:
        "bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white focus-visible:ring-zinc-500",
      destructive:
        "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 focus-visible:ring-rose-500 font-bold",
      cyan:
        "bg-cyan-500 text-black hover:bg-cyan-400 font-bold focus-visible:ring-cyan-400 shadow-md",
      emerald:
        "bg-emerald-500 text-black hover:bg-emerald-400 font-bold focus-visible:ring-emerald-400 shadow-md",
      amber:
        "bg-amber-500 text-black hover:bg-amber-400 font-bold focus-visible:ring-amber-400 shadow-md",
    };

    const sizeStyles: Record<string, string> = {
      sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
      md: "text-sm px-4 py-2.5 gap-2 rounded-xl",
      lg: "text-base px-6 py-3.5 gap-2.5 rounded-xl",
      icon: "h-9 w-9 p-0 rounded-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
