import Link from "next/link";
import { JSX } from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  return (
    <div>
      <div className="flex justify-between items-center border-b border-slate-300 px-6 py-6 bg-white shadow-sm">
        <Link
          href="/"
          className="text-2xl font-extrabold text-blue-600 hover:opacity-80 transition"
        >
          Pay<span className="text-slate-900">LO</span>
        </Link>
      </div>

      <div>{children}</div>
    </div>
  );
}
