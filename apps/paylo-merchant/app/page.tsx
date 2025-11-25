"use client";

import { useBalance } from "@paylo/store/useBalance";

export default function Page() {
  const balance = useBalance();
  return <div>hi there {balance}</div>;
}
