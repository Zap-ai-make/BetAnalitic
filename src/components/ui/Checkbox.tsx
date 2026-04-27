"use client"

import * as React from "react"
import { cn } from "~/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode
  error?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId()
    const checkboxId = id ?? generatedId

    return (
      <div className="space-y-1">
        <label
          htmlFor={checkboxId}
          className={cn(
            "flex items-start gap-3 cursor-pointer",
            props.disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              type="checkbox"
              id={checkboxId}
              className={cn(
                "peer h-5 w-5 shrink-0 appearance-none rounded border-2",
                "bg-bg-secondary transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:ring-offset-2 focus:ring-offset-bg-primary",
                "checked:bg-accent-cyan checked:border-accent-cyan",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error ? "border-accent-red" : "border-text-tertiary",
                className
              )}
              ref={ref}
              aria-invalid={!!error}
              aria-describedby={error ? `${checkboxId}-error` : undefined}
              {...props}
            />
            <svg
              className="pointer-events-none absolute h-3 w-3 text-bg-primary opacity-0 peer-checked:opacity-100"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2.5 6.5L5 9L9.5 3.5" />
            </svg>
          </div>
          {label && (
            <span className="text-sm text-text-secondary leading-tight">
              {label}
            </span>
          )}
        </label>
        {error && (
          <p id={`${checkboxId}-error`} className="text-sm text-accent-red ml-8">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"
