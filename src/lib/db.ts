import { PrismaClient } from "@prisma/client";

export async function getProduct(prisma: PrismaClient, id: string) {
	const product = await prisma.product.findUnique({
		where: {
			id
		}
	});

	return product;
}