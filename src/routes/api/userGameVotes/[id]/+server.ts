import { json, error, type RequestEvent } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import type { UserGameVote } from "@prisma/client";
import { Prisma } from "@prisma/client";


const handleError = (e: unknown) => {
  const code = e instanceof Prisma.PrismaClientKnownRequestError ? 400 : 500;
  console.error(e);
  return error(code, {
    // @ts-expect-error - docs say this is allowed https://svelte.dev/docs/kit/errors
    error: e,
  });
};

export const POST = async ({ request, params }: RequestEvent) => {
  const id = params.id;
  const availableData = await request.json<Prisma.UserGameVoteUncheckedCreateInput[]>();

  try {
    await prisma.userGameVote.createMany({
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

export const GET = async ({ params }: RequestEvent) => {
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