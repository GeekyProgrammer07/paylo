import * as z from "zod";

export const SignupSchema = z.object({
  name: z.string({ error: "Name is required" }).trim(),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }),
  email: z.email({ error: "Email Format is Incorrect" }).trim(),
  password: z
    .string({ error: "Password is Required" })
    .min(5, { error: "Minimum Length is 5" }),
});

export type Signup = z.infer<typeof SignupSchema>;

export interface LoginCredentials {
  name?: string;
  phone?: string;
  email?: string;
  password: string;
}

export interface ModifiedUser {
  id: string;
  dbId: number;
  number: string;
}

export interface DBUser {
  id: string;
  dbId: number;
  number: string;
}
