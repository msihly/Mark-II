import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import env from "../env";
import { TRPCRouter } from "../server.mjs";

export const trpc = createTRPCProxyClient<TRPCRouter>({
  links: [httpBatchLink({ url: `http://localhost:${+env?.SERVER_PORT || 3738}` })],
  transformer: superjson,
});
