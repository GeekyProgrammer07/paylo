import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@paylo/db/client";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: {
          label: "Name",
          type: "text",
          placeholder: "John Doe",
        },
        phone: {
          label: "Phone number",
          type: "text",
          placeholder: "1231231231",
        },
        email: {
          label: "Email",
          type: "text",
          placeholder: "johndoe@example.com",
        },

        password: {
          label: "Password",
          type: "password",
          placeholder: "********",
        },
      },
      // TODO: User credentials type from next-auth
      async authorize(credentials: any) {
        // TODO: zod validation, OTP validation here
        const hashedPassword = await bcrypt.hash(credentials.password, 10);
        const existingUser = await prisma.user.findFirst({
          where: {
            number: credentials.phone,
          },
        });

        if (existingUser) {
          const passwordValidation = await bcrypt.compare(
            credentials.password,
            existingUser.password
          );
          if (passwordValidation) {
            return {
              id: existingUser.uuid,
              dbId: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              number: existingUser.number
            };
          }
          return null;
        }

        try {
          const user = await prisma.user.create({
            data: {
              name: credentials.name,
              number: credentials.phone,
              email: credentials.email,
              password: hashedPassword,
            },
          });

          return {
            id: user.uuid,
            dbId: user.id,
            name: user.name,
            email: user.email,
            number: user.number
          };
        } catch (e) {
          console.error(e);
        }

        return null;
      },
    }),
  ],
  secret: process.env.JWT_SECRET || "secret",
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.dbId = user.dbId;
        token.number = user.number;
      }
      return token;
    },
    // TODO: Change any to correct type
    async session({ token, session, user }: any) {
      session.user.id = token.id;
      session.user.dbId = token.dbId;
      session.user.number = token.number;
      return session;
    },
    async redirect({
      url,
      baseUrl,
    }: {
      url: string;
      baseUrl: string;
    }): Promise<string> {
      return `${baseUrl}/`;
    },
  },
};
