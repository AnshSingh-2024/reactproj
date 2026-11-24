import { CheckCircle2, Trash2 } from 'lucide-react';

function Toast({ message, type }) {
  return (
    <div className={`toast toast-${type}`} role="status">
      {type === 'danger' ? <Trash2 size={16} /> : <CheckCircle2 size={16} />}
      {message}
    </div>
  );
}

export default Toast;
