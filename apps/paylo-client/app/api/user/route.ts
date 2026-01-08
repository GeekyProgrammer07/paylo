import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

const ORIGIN = "http://34.93.78.38";

export const GET = async () => {
  const session = await getServerSession(authOptions);

  if (session) {
    return new Response(JSON.stringify({ user: session.user }), {
      status: 200,
      headers: corsHeaders(),
    });
  }

  return new Response(JSON.stringify({ message: "You are not logged in" }), {
    status: 403,
    headers: corsHeaders(),
  });
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ORIGIN,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
