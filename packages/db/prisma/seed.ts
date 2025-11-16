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
        create: { balance: 20000, locked: 0 },
      },
      OnRampTransaction: {
        create: {
          startTime: new Date(),
          status: "Success",
          amount: 20000,
          token: "m7BNFPbijI",
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
        create: { balance: 3000, locked: 500 },
      },
      OnRampTransaction: {
        create: [
          {
            startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
            status: "Success",
            amount: 3000,
            token: "Kj9xLpMn4R",
            provider: "HDFC Bank",
          },
          {
            startTime: new Date(),
            status: "Processing",
            amount: 2500,
            token: "w8vZqYt5Nh",
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
        create: { balance: 8000, locked: 1000 },
      },
      OnRampTransaction: {
        create: [
          {
            startTime: new Date(Date.now() - 1000 * 60 * 60 * 48),
            status: "Failure",
            amount: 4000,
            token: "d6UcXsAe2W",
            provider: "Axis Bank",
          },
          {
            startTime: new Date(),
            status: "Success",
            amount: 8000,
            token: "P3gVfBk7Qm",
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
        create: { balance: 50000, locked: 0 },
      },
      OnRampTransaction: {
        create: {
          startTime: new Date(),
          status: "Success",
          amount: 50000,
          token: "y5wxhXmB7u",
          provider: "HDFC Bank",
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
        create: { balance: 0, locked: 0 },
      },
      OnRampTransaction: {
        create: {
          startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          status: "Failure",
          amount: 2000,
          token: "T4rDnJc9Ev",
          provider: "Axis Bank",
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
