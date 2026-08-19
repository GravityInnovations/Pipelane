import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

const variants = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 gap-1.5 px-3 text-xs" : "h-10 gap-2 px-4 text-sm",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
