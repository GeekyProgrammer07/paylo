"use client";
import { Appbar } from "@paylo/ui/Appbar";
import { signIn, signOut, useSession } from "next-auth/react";

export function AppbarClient() {
  const session = useSession();

  return (
    <div>
      <Appbar
        onSignin={signIn}
        onSignout={async () => {
          signOut({ callbackUrl: "/signin" });
        }}
        user={session.data?.user}
      />
    </div>
  );
}
