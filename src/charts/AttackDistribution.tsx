"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function AttackDistribution({ data }: { data: Array<{ name: string; count: number }> }) {
  return (
    <div className="h-80 rounded-lg border border-line bg-panel p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Attack Distribution</h2>
        <p className="text-sm text-zinc-400">Predicted labels from the latest CSV upload</p>
      </div>
      <ResponsiveContainer width="100%" height="82%">
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 48 }}>
          <CartesianGrid stroke="#2b3038" vertical={false} />
          <XAxis dataKey="name" stroke="#a1a1aa" angle={-25} textAnchor="end" interval={0} height={70} />
          <YAxis stroke="#a1a1aa" />
          <Tooltip contentStyle={{ background: "#181b20", border: "1px solid #2b3038" }} />
          <Bar dataKey="count" fill="#4f8cff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
