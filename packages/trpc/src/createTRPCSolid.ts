/* eslint-disable @typescript-eslint/no-explicit-any */
import { type TRPCClientErrorLike } from "@trpc/client";
import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  AnySubscriptionProcedure,
  ProcedureRouterRecord,
  inferProcedureInput,
  inferProcedureOutput,
} from "@trpc/server";
import { type inferObservableValue } from "@trpc/server/observable";
import { createFlatProxy } from "@trpc/server/shared";
import {
  type CreateSolidUtilsProxy,
  createSolidProxyDecoration,
  createSolidQueryUtilsProxy,
} from "./shared";
import {
  type CreateClient,
  type CreateSolidQueryHooks,
  type TRPCProvider,
  type UseDehydratedState,
  type UseTRPCInfiniteQueryResult,
  type UseTRPCMutationOptions,
  type UseTRPCMutationResult,
  type UseTRPCQueryResult,
  type UseTRPCSubscriptionOptions,
  createHooksInternal,
} from "./shared/hooks/createHooksInternal";
import {
  type UseTRPCInfiniteQueryOptions,
  type UseTRPCQueryOptions,
} from "./shared/hooks/types";
import { type CreateTRPCSolidOptions } from "./shared/types";

export type FixProcedureInput<T> = T extends void | undefined
  ? void | undefined
  : () => T;
/**
 * @internal
 */
export type DecorateProcedure<
  TProcedure extends AnyProcedure,
  TPath extends string
> = TProcedure extends AnyQueryProcedure
  ? {
      useQuery: <
        TQueryFnData = inferProcedureOutput<TProcedure>,
        TData = inferProcedureOutput<TProcedure>
      >(
        input: FixProcedureInput<inferProcedureInput<TProcedure>>,
        opts?: UseTRPCQueryOptions<
          TPath,
          inferProcedureInput<TProcedure>,
          TQueryFnData,
          TData,
          TRPCClientErrorLike<TProcedure>
        >
      ) => UseTRPCQueryResult<TData, TRPCClientErrorLike<TProcedure>>;
    } & (inferProcedureInput<TProcedure> extends { cursor?: any }
      ? {
          useInfiniteQuery: <
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _TQueryFnData = inferProcedureOutput<TProcedure>,
            TData = inferProcedureOutput<TProcedure>
          >(
            input: FixProcedureInput<
              Omit<inferProcedureInput<TProcedure>, "cursor">
            >,
            opts?: UseTRPCInfiniteQueryOptions<
              TPath,
              inferProcedureInput<TProcedure>,
              TData,
              TRPCClientErrorLike<TProcedure>
            >
          ) => UseTRPCInfiniteQueryResult<
            TData,
            TRPCClientErrorLike<TProcedure>
          >;
        }
      : // eslint-disable-next-line @typescript-eslint/ban-types
        {})
  : TProcedure extends AnyMutationProcedure
  ? {
      useMutation: <TContext = unknown>(
        opts?: UseTRPCMutationOptions<
          inferProcedureInput<TProcedure>,
          TRPCClientErrorLike<TProcedure>,
          inferProcedureOutput<TProcedure>,
          TContext
        >
      ) => UseTRPCMutationResult<
        inferProcedureOutput<TProcedure>,
        TRPCClientErrorLike<TProcedure>,
        inferProcedureInput<TProcedure>,
        TContext
      >;
    }
  : TProcedure extends AnySubscriptionProcedure
  ? {
      useSubscription: (
        input: FixProcedureInput<inferProcedureInput<TProcedure>>,
        opts?: () => UseTRPCSubscriptionOptions<
          inferObservableValue<inferProcedureOutput<TProcedure>>,
          TRPCClientErrorLike<TProcedure>
        >
      ) => void;
    }
  : never;

/**
 * @internal
 */
export type DecoratedProcedureRecord<
  TProcedures extends ProcedureRouterRecord,
  TPath extends string = ""
> = {
  [TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
    ? DecoratedProcedureRecord<
        TProcedures[TKey]["_def"]["record"],
        `${TPath}${TKey & string}.`
      >
    : TProcedures[TKey] extends AnyProcedure
    ? DecorateProcedure<TProcedures[TKey], `${TPath}${TKey & string}`>
    : never;
};

export type CreateTRPCSolidStart<TRouter extends AnyRouter> = {
  useContext(): CreateSolidUtilsProxy<TRouter>;
  Provider: TRPCProvider<TRouter>;
  createClient: CreateClient<TRouter>;
  useDehydratedState: UseDehydratedState<TRouter>;
} & DecoratedProcedureRecord<TRouter["_def"]["record"]>;

/**
 * @internal
 */
export function createHooksInternalProxy<TRouter extends AnyRouter>(
  trpc: CreateSolidQueryHooks<TRouter>
) {
  type CreateHooksInternalProxy = CreateTRPCSolidStart<TRouter>;

  return createFlatProxy<CreateHooksInternalProxy>((key) => {
    if (key === "useContext") {
      return () => {
        const context = trpc.useContext();
        // create a stable reference of the utils context
        return (createSolidQueryUtilsProxy as any)(context as any);
      };
    }

    if ((key as string) in trpc) {
      return (trpc as any)[key];
    }

    return createSolidProxyDecoration(key as string, trpc);
  });
}

export function createTRPCSolidStart<TRouter extends AnyRouter>(
  opts?: CreateTRPCSolidOptions<TRouter>
) {
  const hooks = createHooksInternal<TRouter>(opts);
  const proxy = createHooksInternalProxy<TRouter>(hooks);

  return proxy;
}
