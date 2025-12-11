"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function Page() {
  const data = [
    { name: "A", uv: 400, amt: 2400 },
    { name: "B", uv: 300, amt: 2400 },
    { name: "C", uv: 300, amt: 2400 },
    { name: "D", uv: 200, amt: 2400 },
    { name: "E", uv: 278, amt: 2400 },
    { name: "F", uv: 189, amt: 2400 },
  ];

  return (
    <div
      style={{
        width: "50%",
        maxWidth: 900,
        margin: "0 auto",
        padding: 16,
        minHeight: 200,
        height: 400,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis width={48} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="uv" stroke="#8884d8" dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
