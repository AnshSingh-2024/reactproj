// Small segmented control (like radio buttons) – fully controlled by its parent
function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((opt) => (
        <button key={opt.value} type="button" className={value === opt.value ? 'active' : ''} onClick={() => onChange(opt.value)}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default Segmented;
