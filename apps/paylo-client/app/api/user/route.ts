import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

export const GET = async () => {
  const session = await getServerSession(authOptions);
  if (session) {
    return Response.json({
      user: session.user,
    });
  }
  return Response.json(
    {
      message: "You are not logged in",
    },
    {
      status: 403,
    }
  );
};
