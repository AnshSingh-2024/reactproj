import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { formatCompactINR } from '../../utils/format';

/*
 * Simple bar chart for weekly / monthly totals.
 * The last bar (the current period) is highlighted.
 */
function TrendBarChart({ data, height = 260, color = '#D9682B', average, tooltipLabelKey, highlightLast = true }) {
  const labelFormatter = (label, payload) =>
    tooltipLabelKey && payload?.[0] ? payload[0].payload[tooltipLabelKey] : label;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={formatCompactINR} tickLine={false} axisLine={false} width={58} />
          <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<ChartTooltip hideZero={false} labelFormatter={labelFormatter} />} />
          {average > 0 && (
            <ReferenceLine y={average} stroke="#64748B" strokeDasharray="4 4" label={{ value: 'avg', position: 'insideTopRight', fontSize: 11 }} />
          )}
          <Bar dataKey="amount" name="Spent" radius={[8, 8, 0, 0]} maxBarSize={44}>
            {data.map((entry, i) => (
              <Cell key={entry.label + i} fill={color} fillOpacity={!highlightLast || i === data.length - 1 ? 1 : 0.42} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendBarChart;
