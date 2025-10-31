"use client";
import { Appbar } from "@paylo/ui/Appbar";
import { signIn, signOut, useSession } from "next-auth/react";
import { JSX } from "react";

export default function Page(): JSX.Element {
  const session = useSession();
  return (
    <div>
      <Appbar onSignin={signIn} onSignout={signOut} user={session.data?.user} />
    </div>
  );
}
