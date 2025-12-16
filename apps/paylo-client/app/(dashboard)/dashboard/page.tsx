"use client";

import axios from "axios";
import Graph, { BalancePoint } from "@/app/_components/Graph";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Page() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<BalancePoint[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchData = async () => {
      const response = await axios.get(
        "http://localhost:3001/api/balance/history",
        {
          params: {
            userId: session.user.dbId,
          },
        }
      );

      setData(response.data);
    };

    fetchData();
  }, [status, session?.user?.dbId]);

  if (status === "loading") {
    return <div>Loading session...</div>;
  }
  return (
    <div>
      <Graph data={data} />
    </div>
  );
}
