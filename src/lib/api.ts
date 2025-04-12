import { json, type RequestEvent, type RequestHandler } from "@sveltejs/kit";
// import prisma from "$lib/prisma";

// export const createAPI = <T extends RequestHandler>({
// 	GET,
// 	POST,
// 	PATCH,
// 	DELETE,
// }: {
// 	GET?: T;
// 	POST?: T;
// 	PATCH?: T;
// 	DELETE?: T;
// }) => {};

const typedHandler = <T = undefined, TRequestEvent extends RequestEvent = RequestEvent, TParams extends Partial<Record<string, string>> = TRequestEvent extends RequestEvent<infer Params> ? Params : never, TRoutId extends string | null = TRequestEvent extends RequestEvent<Partial<Record<string, string>>, infer RouteId> ? RouteId : never>(callback: (event: TRequestEvent & { data: T }) => Promise<Response> | Response): {
  be: RequestHandler<TParams, TRoutId>;
  fe: unknown;
} => {
	return {
    be: async (event: TRequestEvent) => {
      const data = await event.request.json<T>();

      return callback({ ...event, data });
    },
    fe: ({ data, params }) => {
      fetch("/api/user", {
        method: "POST",
      });
    },
  }
};

export const setUser = typedHandler(({ data }: { data: number }) => {
	console.log(data);

	return json({ data });
});

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type RouteId = '/api/user/[[id]]/[server]';

type _ExtractArgs<T extends string> =
  T extends `${string}/[[${infer U}]]${infer Rest}` ? { [K in U]?: string } & _ExtractArgs<Rest> :
  T extends `${string}/[...${string}]${infer Rest}` ? _ExtractArgs<Rest> :
  T extends `${string}/[${infer U}]${infer Rest}` ? { [K in U]: string } & _ExtractArgs<Rest> : unknown;

type ExtractArgs<T extends string> = Prettify<_ExtractArgs<T>>;

type x = ExtractArgs<RouteId>;