import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create menu items (upsert to avoid conflicts)
  const menuItems = [
    {
      id: "1b9d2334-1d11-40cc-93cf-c7cc50ec9996", //uuid
      name: "初恋いちご",
      price: 300,
      isActive: true,
      sortOrder: 1,
      image: "strawberry.jpg",
    },
    {
      id: "cd52c9ee-bf05-467b-bd3d-6dbf2b10a08c", //uuid
      name: "初恋いちご（練乳抜き）",
      price: 250,
      isActive: true,
      sortOrder: 2,
      image: "strawberry.jpg",
    },
    {
      id: "ab07d7f4-5533-497b-b194-24d31ab09d38",
      name: "青春ブルーハワイ",
      price: 400,
      isActive: true,
      sortOrder: 3,
      image: "blue-hawaii.jpg",
    },
    {
      id: "3c2463b8-c48c-4892-9d36-fd75c90d207d",
      name: "青春ブルーハワイ（パイナップル抜き）",
      price: 250,
      isActive: true,
      sortOrder: 4,
      image: "blue-hawaii-no-pineapple.jpg",
    },
    {
      id: "03cb03ae-0c57-4c92-80e7-79f81e4cc493",
      name: "コーヒー",
      price: 300,
      isActive: true,
      sortOrder: 5,
      image: "coffee.jpg",
    },
    {
      id: "b33279f5-7ee1-4667-b00e-48230826455c",
      name: "コーヒー（練乳抜き）",
      price: 250,
      isActive: true,
      sortOrder: 6,
      image: "coffee-no-milk.jpg",
    },
    {
      id: "449dff19-a239-4720-ba65-615fca1c5a6f",
      name: "カシス",
      price: 500,
      isActive: true,
      sortOrder: 7,
      image: "cassis.jpg",
    },
    {
      id: "5ffb47b0-a149-4132-8655-be2a101bf6e5",
      name: "カシス（オレンジ抜き）",
      price: 350,
      isActive: true,
      sortOrder: 8,
      image: "cassis-no-orange.jpg",
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        price: item.price,
        isActive: item.isActive,
        sortOrder: item.sortOrder,
        image: item.image,
      },
      create: item,
    });
  }

  console.log("✅ Menu items seeded successfully");
  console.log(`Upserted ${menuItems.length} menu items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
