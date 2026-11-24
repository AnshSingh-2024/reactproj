import { getCategory } from '../../data/constants';

function CategoryPill({ category }) {
  const cat = getCategory(category);
  return (
    <span className="pill" style={{ background: cat.soft, color: cat.color }}>
      <span className="pill-dot" style={{ background: cat.color }} />
      {cat.id}
    </span>
  );
}

export default CategoryPill;
