import { ResponsiveContainer, ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { formatCompactINR } from '../../utils/format';

/*
 * This month's running total vs the "budget pace" line, with daily spends as bars.
 * data comes from dailySeries() in utils/calculations.js
 */
function CumulativeChart({ data, height = 280, monthName }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D9682B" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#D9682B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
          <YAxis tickFormatter={formatCompactINR} tickLine={false} axisLine={false} width={58} />
          <Tooltip content={<ChartTooltip hideZero={false} labelFormatter={(l) => `${l} ${monthName}`} />} />
          <Bar dataKey="amount" name="Spent that day" fill="#94A3B8" fillOpacity={0.45} radius={[4, 4, 0, 0]} barSize={8} />
          <Line dataKey="pace" name="Budget pace" stroke="#16A34A" strokeDasharray="5 5" dot={false} strokeWidth={2} />
          <Area
            dataKey="cumulative"
            name="Spent so far"
            stroke="#D9682B"
            strokeWidth={2.5}
            fill="url(#cumFill)"
            dot={false}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CumulativeChart;
