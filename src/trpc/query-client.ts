import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query";
import superjson from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000,  // 10 min — données considérées fraîches, navigation instantanée
        gcTime: 30 * 60 * 1000,     // 30 min — données gardées en mémoire entre les navigations
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,  // évite rafraîchissement sauvage au retour de veille
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
