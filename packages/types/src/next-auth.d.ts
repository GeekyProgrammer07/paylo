import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      dbId: number;
      number: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    id: string;
    dbId: number;
    number: string;
  }
}
