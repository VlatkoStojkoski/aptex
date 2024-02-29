'use client';

import { useState } from "react";

import type { Product } from "@prisma/client";
import { cn, getScoreColorClassName } from "@/lib/utils";
import Image from "next/image";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import SearchIllustration from "./svg/search-illustration";

type AskProps = {} & React.HTMLAttributes<HTMLDivElement>;

export default function Ask({ className, ...props }: AskProps) {
	const [input, setInput] = useState<string>('');
	const [results, setResults] = useState<{
		product: Product;
		score: number;
		id: string;
	}[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	function ask() {
		setLoading(true);

		const inputParamVal = encodeURIComponent(input);
		const reqUrl = new URL('/api/ask', window.location.href);
		reqUrl.searchParams.append('input', inputParamVal);

		fetch(reqUrl).then(res => res.json()).then(data => {
			setResults(data);
			setLoading(false);
		});
	}

	return (
		<div className={cn('flex flex-col gap-y-6', className)} {...props}>
			<div className="flex flex-col gap-y-2 items-center justify-center">
				<div className="relative w-full aspect-[762/232] max-w-[16rem]">
					<Image src='/aptex-logo.png' alt="Aptex Logo" fill className="object-contain w-full h-full" />
				</div>
				<h1 className="text-center">Tell us what you need, we&apos;ve got you!</h1>
			</div>
			<div className="w-full flex flex-row gap-x-2">
				<Input placeholder="Your question..." className="flex-1" onChange={(ev) => void setInput(ev.target.value)} value={input} />
				<Button onClick={() => void ask()}>Find</Button>
			</div>
			{
				results.length === 0 && !loading && (
					<div className="w-full h-full flex items-center justify-center col-span-2">
						<SearchIllustration className="max-w-[10rem]" />
					</div>
				)
			}
			{
				(results.length > 0 || loading) && (

					<div className="w-full rounded-lg border p-3">
						<h1 className="mb-4">Results:</h1>
						<div className="relative grid grid-cols-2 gap-2 min-h-[10rem]">
							{loading && (
								<Skeleton className="absolute top-0 left-0 flex items-center justify-center w-full h-full z-10 col-span-2">
									Loading...
								</Skeleton>
							)}
							{
								results.map(({ product, score }, idx) => product && (
									<a key={idx} href={product.url} className="block w-full h-full">
										<div key={idx} className="relative w-full h-full flex flex-col gap-x-2 border rounded-lg">
											<div className="w-full aspect-video rounded-lg">
												{
													product.image ? (
														// eslint-disable-next-line @next/next/no-img-element
														<img src={product.image} alt={product.name} className="object-cover w-full h-full rounded-lg" />
													) : (
														<div className="flex items-center justify-center w-full h-full bg-gray-200 rounded-lg">
															No image available
														</div>
													)
												}
											</div>

											<div className="text-sm p-2">
												<h2>{product.name}</h2>
											</div>

											<div className={cn("size-3 mr-1 mb-1 rounded-full absolute bottom-0 right-0", getScoreColorClassName(score))} />
										</div>
									</a>
								))
							}
						</div>
					</div>
				)
			}
		</div>
	);
}