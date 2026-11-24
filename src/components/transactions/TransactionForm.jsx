import { useState, useEffect, useRef } from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../../data/constants';
import { todayISO } from '../../utils/dates';
import { getCategory } from '../../data/constants';

const EMPTY_FORM = {
  title: '',
  amount: '',
  category: 'Food',
  date: todayISO(),
  paymentMethod: 'UPI',
  note: '',
};

/*
 * Add / edit form built entirely with controlled inputs (Unit III):
 * every input's value comes from state and every change goes through onChange.
 */
function TransactionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => (initial ? { ...initial, amount: String(initial.amount) } : { ...EMPTY_FORM, date: todayISO() }));
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);

  // useRef: focus the first field when the form opens
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // One handler for every input, using the input's "name" attribute
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Please enter a title';
    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0) next.amount = 'Enter an amount greater than ₹0';
    else if (amount > 10000000) next.amount = 'That looks too large';
    if (!form.date) next.date = 'Pick a date';
    else if (form.date > todayISO()) next.date = 'Expenses cannot be in the future';
    return next;
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // stop the browser from reloading the page
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    onSubmit({
      title: form.title.trim(),
      amount: Math.round(Number(form.amount) * 100) / 100,
      category: form.category,
      date: form.date,
      paymentMethod: form.paymentMethod,
      note: form.note.trim(),
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          ref={titleRef}
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Dinner at Truffles"
          className={errors.title ? 'invalid' : ''}
          maxLength={60}
        />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="amount">Amount (₹)</label>
          <div className="input-prefix">
            <span>₹</span>
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0"
              className={errors.amount ? 'invalid' : ''}
            />
          </div>
          {errors.amount && <span className="error">{errors.amount}</span>}
        </div>
        <div className="field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            max={todayISO()}
            value={form.date}
            onChange={handleChange}
            className={errors.date ? 'invalid' : ''}
          />
          {errors.date && <span className="error">{errors.date}</span>}
        </div>
      </div>

      <div className="field">
        <label>Category</label>
        <div className="category-picker">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const selected = form.category === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                className={`category-option ${selected ? 'selected' : ''}`}
                style={selected ? { borderColor: cat.color, background: cat.soft, color: cat.color } : undefined}
                onClick={() => setForm((prev) => ({ ...prev, category: cat.id }))}
              >
                <Icon size={18} />
                <span>{cat.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="paymentMethod">Payment method</label>
          <select id="paymentMethod" name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Preview</label>
          <div className="form-preview" style={{ color: getCategory(form.category).color }}>
            {form.amount ? `₹${Number(form.amount).toLocaleString('en-IN')}` : '₹0'} · {form.category}
          </div>
        </div>
      </div>

      <div className="field">
        <label htmlFor="note">Note (optional)</label>
        <textarea id="note" name="note" rows={2} value={form.note} onChange={handleChange} placeholder="Anything worth remembering?" maxLength={200} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initial ? 'Save changes' : 'Add expense'}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;
