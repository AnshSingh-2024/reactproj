import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';

/*
 * Donut chart of spending by category.
 * data: [{ category, color, amount }]
 */
function CategoryDonut({ data, centerLabel, centerValue, height = 240 }) {
  const slices = data.filter((d) => d.amount > 0);
  const isEmpty = slices.length === 0;

  return (
    <div className="donut-wrap" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={isEmpty ? [{ category: 'None', amount: 1, color: 'var(--surface-3)' }] : slices}
            dataKey="amount"
            nameKey="category"
            innerRadius="68%"
            outerRadius="94%"
            paddingAngle={isEmpty ? 0 : 2}
            cornerRadius={6}
            stroke="none"
            isAnimationActive
            animationDuration={500}
          >
            {(isEmpty ? [{ color: 'var(--surface-3)' }] : slices).map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          {!isEmpty && <Tooltip content={<ChartTooltip />} />}
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center">
        <span>{centerLabel}</span>
        <strong>{centerValue}</strong>
      </div>
    </div>
  );
}

export default CategoryDonut;
