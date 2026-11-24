import { getCategory } from '../../data/constants';

// Coloured icon chip for a category – the colour comes from inline styles
function CategoryIcon({ category, size = 36 }) {
  const cat = getCategory(category);
  const Icon = cat.icon;
  return (
    <span className="category-icon" style={{ width: size, height: size, background: cat.soft, color: cat.color }} title={cat.id}>
      <Icon size={Math.round(size * 0.48)} />
    </span>
  );
}

export default CategoryIcon;
