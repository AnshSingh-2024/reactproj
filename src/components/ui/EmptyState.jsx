import { Inbox } from 'lucide-react';

function EmptyState({ title, message, children, icon: Icon = Inbox }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={26} />
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}

export default EmptyState;
