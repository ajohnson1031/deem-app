// apps/backend/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("securepassword123", 10); // 🔐 choose your desired seed password

  const user = await prisma.user.upsert({
    where: { username: "johndoe" },
    update: {},
    create: {
      username: "johndoe",
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "1234567890",
      password: hashedPassword, // 🔐 Store the hashed password
      avatarUri: "https://api.dicebear.com/7.x/initials/png?seed=John%20Doe",
      walletAddress: "rrhxFGPXDH4Rbre2vrf3bqasjrHamSogs9",
      contacts: {
        create: [
          {
            name: "Alice Monroe",
            username: "@alicem",
            walletAddress: "rAlice123",
            avatarUri: "https://api.dicebear.com/7.x/initials/png?seed=Alice%20Monroe",
          },
          {
            name: "Bob Lee",
            username: "@boblee",
            walletAddress: "rBob456",
            avatarUri: "https://api.dicebear.com/7.x/initials/png?seed=Bob%20Lee",
          },
          {
            name: "Charlie Kim",
            username: "@charliek",
            walletAddress: "rCharlie789",
          },
          {
            name: "Dana White",
            username: "@danaw",
            walletAddress: "rDana101",
          },
        ],
      },
    },
  });

  console.log("🌱 Seeded user:", {
    username: user.username,
    email: user.email,
    password: "securepassword123 (hashed in DB)",
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
