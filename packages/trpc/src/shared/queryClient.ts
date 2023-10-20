import { QueryClient, type QueryClientConfig } from "@tanstack/solid-query";

/**
 * @internal
 */
export type CreateTRPCSolidQueryClientConfig =
  | {
      queryClient?: QueryClient;
      queryClientConfig?: never;
    }
  | {
      queryClientConfig?: QueryClientConfig;
      queryClient?: never;
    };

/**
 * @internal
 */
export const getQueryClient = (config: CreateTRPCSolidQueryClientConfig) =>
  config.queryClient ?? new QueryClient(config.queryClientConfig);
