import { JSX } from "react";
import { SidebarItem } from "../_components/SidebarItem";
import { authOptions } from "../lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { AppbarClient } from "../_components/AppbarClient";
import { HomeIcon, PeerToPeerIcon, TransactionsIcon, TransferIcon } from "@paylo/ui/Icons";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-black">
        <h1 className="text-5xl font-bold tracking-tight mb-3 drop-shadow-lg">
          Access Restricted
        </h1>
        <p className="text-lg text-gray-700 max-w-md text-center mb-8">
          Looks like you’re trying to enter a room you don’t have keys to. Login
          first and try again.
        </p>
        <Link
          href="/api/auth/signin"
          className="px-6 py-3 text-lg font-semibold rounded-xl bg-red-600 hover:bg-red-700 transition-all shadow-lg hover:shadow-red-700/50"
        >
          Take Me to Login →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AppbarClient />
      <div className="flex">
        <div className="w-72 border-r border-slate-300 min-h-screen mr-4 pt-28 shadow-sm">
          <div>
            <SidebarItem href={"/dashboard"} icon={<HomeIcon />} title="Home" />
            <SidebarItem
              href={"/transfer"}
              icon={<TransferIcon />}
              title="Transfer"
            />
            <SidebarItem
              href={"/transactions"}
              icon={<TransactionsIcon />}
              title="Transactions"
            />
            <SidebarItem href={"/p2p"} icon={<PeerToPeerIcon />} title="P2P" />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
