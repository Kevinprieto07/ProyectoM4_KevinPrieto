import type { TextareaHTMLAttributes } from 'react'

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
  label: string
  error?: string
}

export function TextAreaField({ id, label, error, ...textAreaProps }: TextAreaFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={3}
        className="rounded border px-3 py-2"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...textAreaProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
