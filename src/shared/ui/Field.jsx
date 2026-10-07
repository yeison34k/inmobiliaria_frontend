export function Field({ label, hint, error, children, required = false }) {
  return (
    <label className="field">
      <span className="field__label">
        {label}{required ? <em aria-hidden="true"> *</em> : null}
      </span>
      {children}
      {hint && !error ? <small className="field__hint">{hint}</small> : null}
      {error ? <small className="field__error">{error}</small> : null}
    </label>
  );
}
