import React from 'react';

export default function Field({
  label,
  name,
  error,
  hint,
  as = 'input',
  options = [],
  className = '',
  children,
  ...props
}) {
  const controlProps = { id: name, name, className: `control ${error ? 'control--error' : ''}`, ...props };
  let control;

  if (as === 'select') {
    control = (
      <select {...controlProps}>
        {children || options.map((option) => {
          const value = typeof option === 'object' ? option.value : option;
          const text = typeof option === 'object' ? option.label : option;
          return <option key={value} value={value}>{text}</option>;
        })}
      </select>
    );
  } else if (as === 'textarea') {
    control = <textarea {...controlProps} />;
  } else {
    control = <input type={props.type || 'text'} {...controlProps} />;
  }

  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={name} className="field-label">{label}</label>}
      {control}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}
