import prisma from "$lib/prisma";
import { error, type Cookies } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import type { AvailableUser, Instance, Prisma } from "@prisma/client";

const createUser = async (args: Prisma.AvailableUserUncheckedCreateInput) => {
	return prisma.userSession.create({
		data: {
			// userId: user.id,
			user: {
				create: args,
			}
		},
		select: {
			sessionId: true,
			user: true,
		}
	});
};

const handleSession = async (cookies: Cookies, instanceId: Instance["name"]) => {
	let sessionId = cookies.get("sessionId");
	let availableUser: AvailableUser | undefined;

	console.log("sessionId", sessionId);
	if (sessionId) {
		const session = await prisma.userSession.findUnique({
			where: {
				sessionId,
			},
			select: {
				user: true,
			},
		})

		if (!session) console.warn("SessionId provided but not found in database");

		availableUser = session?.user;
	}

	if (!availableUser) {
		const createdUser = await createUser({
			name: "Anonymous" + Math.floor(Math.random() * 1000),
			instanceId: instanceId,
		});

		sessionId = createdUser.sessionId;
		availableUser = createdUser.user;
	}

	cookies.set("sessionId", sessionId!, {
		path: "/",
		maxAge: 34560000, // 400 days, max allowed by chrome
	});

	return availableUser;
};

const INSTANCE_NAME = "Games Nigh @Station Bar"; // TODO

export const load: LayoutServerLoad = async ({ cookies }) => {
	const availableUser = await handleSession(cookies, INSTANCE_NAME);

	const instance = await prisma.instance.findFirst({ // TODO when we have multiple instances
		take: 1,
		select: {
			name: true,
			availableUsers: {
				select: {
					name: true,
					id: true,
					BroughtGames: {
						where: {
							OR: [
								{
									isDeleted: false,
								},
								{
									isDeleted: true,
									ownerId: availableUser.id,
								}
							]
						},
						include: {
							game: true,
						}
					}
				},
			},
			games: true,
		},
	});

	if (!instance) error(404, "Instance not found");

	const votes = await prisma.userGameVote.findMany({
		where: {
			userId: availableUser.id,
		},
		select: {
			availableGameId: true,
			// rank: true,
		},
	});

	const {
		lastGames = [],
		available = [],
	} = Object.groupBy(instance.availableUsers.flatMap(user => user.BroughtGames), game => game.isDeleted ? "lastGames" : "available");

	const availableUsers = instance.availableUsers.map(availableUser => ({
		name: availableUser.name,
		id: availableUser.id,
	}));

	return {
		games: instance.games,
		availableGames: available,
		lastGames: lastGames,
		availableUsers,
		instanceId: INSTANCE_NAME,
		user: availableUser,
		votes: votes.map(vote => vote.availableGameId),
	};
};
