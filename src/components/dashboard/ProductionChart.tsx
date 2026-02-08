import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Mon", oil: 420, copra: 380, byproducts: 150 },
  { name: "Tue", oil: 350, copra: 420, byproducts: 180 },
  { name: "Wed", oil: 480, copra: 350, byproducts: 200 },
  { name: "Thu", oil: 520, copra: 410, byproducts: 170 },
  { name: "Fri", oil: 390, copra: 380, byproducts: 220 },
  { name: "Sat", oil: 450, copra: 440, byproducts: 190 },
  { name: "Sun", oil: 280, copra: 260, byproducts: 120 },
];

export const ProductionChart = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold font-heading">Weekly Production</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Output in KG by product type</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="oil" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Oil (KG)" />
          <Bar dataKey="copra" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Copra (KG)" />
          <Bar dataKey="byproducts" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Byproducts (KG)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
