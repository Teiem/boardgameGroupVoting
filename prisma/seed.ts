import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	console.log(`Start seeding ...`);

	console.log(`Seeding finished.`);
}

main()
	.finally()
	.then(() => prisma.$disconnect());
