import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
// import pLimit from 'p-limit';
import { getProduct } from "@/lib/db";
import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const url = new URL(req.url ?? '', `http://${req.headers.host}`);
	const input = url.searchParams.get('input');

	if (typeof input !== 'string' || input.length === 0) {
		return res.json({ error: 'Invalid input' });
	}

	const openai = new OpenAI({
		apiKey: process.env.OPENAI_KEY as string
	});

	const milvus = new MilvusClient({
		address: process.env.MILVUS_ADDRESS as string,
		token: process.env.MILVUS_TOKEN as string
	});

	const prisma = new PrismaClient();

	// const limit = pLimit(10);

	// return res.json({ input })

	let embeddingRes;
	try {
		embeddingRes = await openai.embeddings.create({
			model: 'text-embedding-3-large',
			encoding_format: 'float',
			input
		});
	} catch (error) {
		return res.json({
			error: 'Error while creating embedding'
		})
	}

	const vector = embeddingRes.data[0].embedding;

	if (!vector) {
		return res.json({ error: 'Invalid embedding' });
	}

	const searchRes = await milvus.search({
		collection_name: "ProductsProd",
		vector,
		limit: 6,
		offset: 0,
	});

	const searchResults = await Promise.all(
		searchRes.results.map(async (result) => {
			const product = await getProduct(prisma, result.id);

			return {
				...result,
				product
			};
		})
	);

	return res.json(searchResults);
}