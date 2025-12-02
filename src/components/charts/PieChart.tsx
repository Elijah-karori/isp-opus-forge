import {
    Cell,
    Pie,
    PieChart as RechartsPieChart,
    Legend,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

interface PieChartProps {
    data: Array<{ name: string; value: number }>;
    colors: string[];
    height?: number;
    title?: string;
    showLegend?: boolean;
}

export function PieChart({
    data,
    colors,
    height = 300,
    title,
    showLegend = true,
}: PieChartProps) {
    return (
        <div className="w-full">
            {title && <h3 className="text-sm font-medium mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsPieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                        }}
                    />
                    {showLegend && <Legend />}
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
}
