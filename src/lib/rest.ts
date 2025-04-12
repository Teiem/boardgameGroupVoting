import { json, error, type RequestEvent } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { Prisma } from "@prisma/client";

const handleError = (e: unknown) => {
	const code = e instanceof Prisma.PrismaClientKnownRequestError ? 400 : 500;
	console.error(e);
	return error(code, {
		// @ts-expect-error - docs say this is allowed https://svelte.dev/docs/kit/errors
		error: e,
	});
};

export const createRest = <TRequestEvent extends RequestEvent<Partial<Record<string, string>>, `${string}/[[id]]`>>(
	key: Prisma.TypeMap["meta"]["modelProps"],
) => {
	const POST = async ({ request }: TRequestEvent) => {
		const availableData = await request.json();

		try {
			console.log("create", key, availableData);
			// @ts-expect-error - functions for each key take different args
			await prisma[key].create({
				data: availableData,
			});
		} catch (e) {
			return handleError({
				error: e,
				key,
			});
		}

		return json({ error: null });
	};

	const DELETE = async ({ params }: TRequestEvent) => {
		const id = params.id;

		try {
			// @ts-expect-error - functions for each key take different args
			await prisma[key].delete({
				where: {
					id: id,
				},
			});
		} catch (e) {
			return handleError({
				error: e,
				key,
			});
		}

		return json({ error: null });
	};

	const PATCH = async ({ request, params }: TRequestEvent) => {
		const id = params.id;
		const availableData = await request.json();

		try {
			// @ts-expect-error - functions for each key take different args
			await prisma[key].update({
				where: {
					id: id,
				},
				data: availableData,
			});
		} catch (e) {
			return handleError({
				error: e,
				key,
			});
		}

		return json({ error: null });
	};

	const GET = async ({ params }: TRequestEvent) => {
		const id = params.id;

		try {
			// @ts-expect-error - functions for each key take different args
			const game = await prisma[key].findUnique({
				where: {
					id: id,
				},
			});

			return json({ data: game, error: null});
		} catch (e) {
			return handleError({
				error: e,
				key,
			});
		}
	};

	return {
		GET,
		POST,
		PATCH,
		DELETE,
	};
};
