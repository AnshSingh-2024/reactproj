import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import ChartTooltip from '../charts/ChartTooltip';
import { formatCompactINR } from '../../utils/format';

// Horizontal bars: baseline (grey) vs simulated (category colour) for every category
function CompareBarChart({ rows, height = 330 }) {
  const data = rows.map((r) => ({ name: r.id, Baseline: Math.round(r.base), Simulated: Math.round(r.simulated), color: r.color }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 4, bottom: 0 }} barGap={2}>
          <CartesianGrid horizontal={false} />
          <XAxis type="number" tickFormatter={formatCompactINR} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={92} />
          <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<ChartTooltip hideZero={false} />} />
          <Bar dataKey="Baseline" fill="#94A3B8" fillOpacity={0.45} radius={[0, 4, 4, 0]} barSize={9} animationDuration={300} />
          <Bar dataKey="Simulated" radius={[0, 4, 4, 0]} barSize={9} animationDuration={300}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CompareBarChart;
