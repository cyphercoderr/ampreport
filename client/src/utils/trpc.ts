import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../server/index";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL}/trpc`,
      headers: () => {
        const token = sessionStorage.getItem("authToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
