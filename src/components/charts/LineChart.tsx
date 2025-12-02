import {
    Line,
    LineChart as RechartsLineChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface LineChartProps {
    data: Array<Record<string, any>>;
    xKey: string;
    lines: Array<{ key: string; label: string; color: string; strokeWidth?: number }>;
    height?: number;
    title?: string;
}

export function LineChart({ data, xKey, lines, height = 300, title }: LineChartProps) {
    return (
        <div className="w-full">
            {title && <h3 className="text-sm font-medium mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsLineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                        dataKey={xKey}
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                        }}
                    />
                    <Legend />
                    {lines.map((line) => (
                        <Line
                            key={line.key}
                            type="monotone"
                            dataKey={line.key}
                            name={line.label}
                            stroke={line.color}
                            strokeWidth={line.strokeWidth || 2}
                        />
                    ))}
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
}
