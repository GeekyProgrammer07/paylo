import * as z from "zod";

export enum Status {
  Success = "Success",
  Processing = "Processing",
  Failure = "Failure",
}

export const TransactionSchema = z.object({
  transactions: z.object({
    time: z.date(),
    amount: z.number(),
    status: z.enum(Status),
    provider: z.string(),
  }),
});

export type Transaction = z.infer<typeof TransactionSchema>;
