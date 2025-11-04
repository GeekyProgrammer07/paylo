import prisma from "../src";
import bcrypt from "bcrypt";

const main = async () => {
  // User 1: John
  await prisma.user.upsert({
    where: { number: "1111111111" },
    update: {},
    create: {
      email: "john@gmail.com",
      name: "John",
      number: "1111111111",
      password: await bcrypt.hash("john", 10),
      Balance: {
        create: { amount: 20000, locked: 0 },
      },
      OnRampTransaction: {
        create: {
          startTime: new Date(),
          status: "Success",
          amount: 20000,
          token: "token_1",
          provider: "HDFC Bank",
        },
      },
    },
  });

  // User 2: Alice
  await prisma.user.upsert({
    where: { number: "2222222222" },
    update: {},
    create: {
      email: "alice@gmail.com",
      name: "Alice",
      number: "2222222222",
      password: await bcrypt.hash("alice", 10),
      Balance: {
        create: { amount: 3000, locked: 500 },
      },
      OnRampTransaction: {
        create: [
          {
            startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
            status: "Success",
            amount: 3000,
            token: "token_2",
            provider: "ICICI Bank",
          },
          {
            startTime: new Date(),
            status: "Processing",
            amount: 2500,
            token: "token_3",
            provider: "Axis Bank",
          },
        ],
      },
    },
  });

  // User 3: Bob
  await prisma.user.upsert({
    where: { number: "3333333333" },
    update: {},
    create: {
      email: "bob@gmail.com",
      name: "Bob",
      number: "3333333333",
      password: await bcrypt.hash("bob", 10),
      Balance: {
        create: { amount: 8000, locked: 1000 },
      },
      OnRampTransaction: {
        create: [
          {
            startTime: new Date(Date.now() - 1000 * 60 * 60 * 48),
            status: "Failure",
            amount: 4000,
            token: "token_4",
            provider: "SBI",
          },
          {
            startTime: new Date(),
            status: "Success",
            amount: 8000,
            token: "token_5",
            provider: "HDFC Bank",
          },
        ],
      },
    },
  });

  // User 4: Charlie
  await prisma.user.upsert({
    where: { number: "4444444444" },
    update: {},
    create: {
      email: "charlie@gmail.com",
      name: "Charlie",
      number: "4444444444",
      password: await bcrypt.hash("charlie", 10),
      Balance: {
        create: { amount: 50000, locked: 0 },
      },
      OnRampTransaction: {
        create: {
          startTime: new Date(),
          status: "Success",
          amount: 50000,
          token: "token_6",
          provider: "Kotak Bank",
        },
      },
    },
  });

  // User 5: Diana
  await prisma.user.upsert({
    where: { number: "5555555555" },
    update: {},
    create: {
      email: "diana@gmail.com",
      name: "Diana",
      number: "5555555555",
      password: await bcrypt.hash("diana", 10),
      Balance: {
        create: { amount: 0, locked: 0 },
      },
      OnRampTransaction: {
        create: {
          startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          status: "Failure",
          amount: 2000,
          token: "token_7",
          provider: "Yes Bank",
        },
      },
    },
  });

  console.log("Seeded users with consistent balances and transactions");
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
