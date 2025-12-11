"use client";
import { Appbar } from "@paylo/ui/Appbar";
import { signIn, signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export function AppbarClient() {
  const session = useSession();

  return (
    <div>
      <Appbar
        onSignin={signIn}
        onSignout={async () => {
          await signOut();
          redirect("/signin")
        }}
        user={session.data?.user}
      />
    </div>
  );
}
