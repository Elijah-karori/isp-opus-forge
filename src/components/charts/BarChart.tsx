import {
    Bar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface BarChartProps {
    data: Array<Record<string, any>>;
    xKey: string;
    yKeys: Array<{ key: string; label: string; color: string }>;
    height?: number;
    title?: string;
}

export function BarChart({ data, xKey, yKeys, height = 300, title }: BarChartProps) {
    return (
        <div className="w-full">
            {title && <h3 className="text-sm font-medium mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsBarChart data={data}>
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
                    {yKeys.map((yKey) => (
                        <Bar
                            key={yKey.key}
                            dataKey={yKey.key}
                            name={yKey.label}
                            fill={yKey.color}
                        />
                    ))}
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
}
