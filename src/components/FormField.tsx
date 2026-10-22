import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
}

export function FormField({ id, label, error, ...inputProps }: FormFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        className="input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger-text">
          {error}
        </p>
      )}
    </div>
  )
}
