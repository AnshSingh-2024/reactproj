import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { CATEGORIES } from '../../data/constants';
import { formatCompactINR } from '../../utils/format';

// Monthly totals stacked by category (data from monthlySeries())
function StackedMonthlyChart({ data, height = 300 }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={formatCompactINR} tickLine={false} axisLine={false} width={58} />
          <Tooltip
            cursor={{ fill: 'var(--surface-2)' }}
            content={<ChartTooltip labelFormatter={(l, p) => p?.[0]?.payload.longLabel ?? l} />}
          />
          {CATEGORIES.map((cat, i) => (
            <Bar
              key={cat.id}
              dataKey={cat.id}
              name={cat.id}
              stackId="month"
              fill={cat.color}
              maxBarSize={48}
              radius={i === CATEGORIES.length - 1 ? [6, 6, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StackedMonthlyChart;
