import type { TextareaHTMLAttributes } from 'react'

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
  label: string
  hint?: string
  error?: string
}

export function TextAreaField({ id, label, hint, error, ...textAreaProps }: TextAreaFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label} {hint && <span className="font-normal text-muted">{hint}</span>}
      </label>
      <textarea
        id={id}
        rows={3}
        className="input min-h-22 resize-y"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...textAreaProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger-text">
          {error}
        </p>
      )}
    </div>
  )
}
