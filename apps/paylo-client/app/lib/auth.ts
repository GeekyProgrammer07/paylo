import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@paylo/db/client";
import { DBUser, LoginCredentials } from "@paylo/types";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

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
      async authorize(credentials: LoginCredentials | undefined) {
        try {
          const user = await prisma.user.findFirst({
            where: {
              number: credentials?.phone,
            },
          });

          if (!user) {
            throw new Error("User not found");
          }

          const passwordValid = await bcrypt.compare(
            credentials!.password,
            user.password
          );
          if (!passwordValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user.uuid,
            dbId: user.id,
            name: user.name,
            email: user.email,
            number: user.number,
          };
        } catch (e) {
          console.error(e);
        }
        return null;
        // TODO: zod validation, OTP validation here
        // const hashedPassword = await bcrypt.hash(credentials!.password, 10);
        // const existingUser = await prisma.user.findFirst({
        //   where: {
        //     number: credentials!.phone,
        //   },
        // });

        // if (existingUser) {
        //   const passwordValidation = await bcrypt.compare(
        //     credentials!.password,
        //     existingUser.password
        //   );
        //   if (passwordValidation) {
        //     return {
        //       id: existingUser.uuid,
        //       dbId: existingUser.id,
        //       name: existingUser.name,
        //       email: existingUser.email,
        //       number: existingUser.number,
        //     };
        //   }
        //   return null;
        // }

        // try {
        //   const user = await prisma.user.create({
        //     data: {
        //       name: credentials!.name,
        //       number: credentials!.phone!,
        //       email: credentials!.email,
        //       password: hashedPassword,
        //     },
        //   });

        //   return {
        //     id: user.uuid,
        //     dbId: user.id,
        //     name: user.name,
        //     email: user.email,
        //     number: user.number,
        //   };
        // } catch (e) {
        //   console.error(e);
        // }

        // return null;
      },
    }),
  ],
  secret: process.env.JWT_SECRET || "secret",
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: Partial<DBUser> }) {
      if (user) {
        token.id = user.id;
        token.dbId = user.dbId;
        token.number = user.number;
      }
      return token;
    },
    // TODO: Change any to correct type
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.id as string;
      session.user.dbId = token.dbId as number;
      session.user.number = token.number as string;
      return session;
    },
    async redirect({
      baseUrl,
    }: {
      url: string;
      baseUrl: string;
    }): Promise<string> {
      return `${baseUrl}/`;
    },
  },
  pages: {
    signIn: "/signin",
    // TODO: Design an Error page
    error: "/signin",
  },
};
