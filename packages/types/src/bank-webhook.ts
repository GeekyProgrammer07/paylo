import * as z from "zod";

export const PaymentInformationSchema = z.object({
  token: z
    .string({ error: "Token is required" })
    .trim()
    .length(10, { error: "Token length is incorrect" }),
  userId: z.number({ error: "userID is requred" }),
  amount: z
    .number({ error: "Account cant be blank" })
    .min(10, { message: "Amount must be at least 10" }),
});

export type PaymentInformation = z.infer<typeof PaymentInformationSchema>;
