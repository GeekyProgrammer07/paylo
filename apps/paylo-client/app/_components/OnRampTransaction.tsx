import { Card } from "@paylo/ui/Card";

export const OnRampTransactions = ({
  transactions,
}: {
  transactions: {
    time: Date;
    amount: number;
    status: string;
    provider: string;
  }[];
}) => {
  const statusColor: Record<string, string> = {
    Success: "text-green-600",
    Processing: "text-yellow-600",
    Failure: "text-red-500",
  };
  if (!transactions.length) {
    return (
      <Card title="Recent Transactions">
        <div className="text-center pb-8 pt-8">No Recent transactions</div>
      </Card>
    );
  }
  return (
    <Card title="Recent Transactions">
      <div className="pt-2">
        {transactions.map((t, index) => (
          <div key={index} className="flex justify-between items-center py-2">
            <div>
              <div className="text-sm">Received INR</div>
              <div className="text-slate-600 text-xs">
                {t.time.toDateString()}
              </div>
              <div className={`text-xs font-medium ${statusColor[t.status]}`}>
                {t.status}
              </div>
            </div>

            <div className="flex flex-col justify-center font-medium">
              + Rs {t.amount / 100}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
