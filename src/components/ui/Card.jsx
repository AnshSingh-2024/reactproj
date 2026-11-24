// Generic container that renders whatever is placed between its tags (props.children)
function Card({ title, subtitle, action, children, className = '', padded = true }) {
  return (
    <section className={`card ${padded ? '' : 'card-flush'} ${className}`}>
      {(title || action) && (
        <div className="card-head">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export default Card;
