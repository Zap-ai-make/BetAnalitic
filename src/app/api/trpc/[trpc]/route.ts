import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handler(req: NextRequest) {
  const [{ fetchRequestHandler }, { env }, { appRouter }, { createTRPCContext }, { auth }] = await Promise.all([
    import("@trpc/server/adapters/fetch"),
    import("~/env"),
    import("~/server/api/root"),
    import("~/server/api/trpc"),
    import("~/server/auth"),
  ]);

  const session = await auth();

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        headers: req.headers,
        session,
      }),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });
}

export { handler as GET, handler as POST };
