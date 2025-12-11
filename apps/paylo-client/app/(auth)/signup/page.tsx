import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import Signup from "@/app/_components/Signup";

export default async function SignupPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/");
  }
  return <Signup />;
}