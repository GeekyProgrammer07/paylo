import {
  CartesianGrid,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
} from "recharts";

export type BalancePoint = {
  time: string;
  balance: number;
};

type GraphProps = {
  data: BalancePoint[];
};

export default function Graph({ data }: GraphProps) {
  return (
    <div className="px-4 md:px-8 py-6">
      <div className="w-4xl mx-auto h-[400px] p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="time"
              tickFormatter={(v) => new Date(v).toLocaleTimeString()}
            />

            <YAxis />

            <Tooltip labelFormatter={(v) => new Date(v).toLocaleString()} />

            <Line
              type="monotone"
              dataKey="balance"
              stroke="#155dfc"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}