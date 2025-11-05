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
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.number,
            };
          }
          return null;
        }

        try {
          const user = await prisma.user.create({
            data: {
              number: credentials.phone,
              password: hashedPassword,
            },
          });

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.number,
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
    // TODO: Change any to correct type
    async session({ token, session }: any) {
      session.user.id = token.sub;

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
