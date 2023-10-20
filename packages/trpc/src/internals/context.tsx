/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CancelOptions,
  FetchInfiniteQueryOptions,
  FetchQueryOptions,
  InfiniteData,
  InvalidateOptions,
  InvalidateQueryFilters,
  QueryClient,
  RefetchOptions,
  RefetchQueryFilters,
  SetDataOptions,
  Updater,
} from "@tanstack/solid-query";
import type { TRPCClientError, TRPCRequestOptions } from "@trpc/client";
import type {
  AnyRouter,
  inferHandlerInput,
  inferProcedureInput,
  inferProcedureOutput,
} from "@trpc/server";
import { createContext } from "solid-js";

export interface TRPCFetchQueryOptions<TInput, TError, TOutput>
  extends FetchQueryOptions<TInput, TError, TOutput>,
    TRPCRequestOptions {}

export type TRPCFetchInfiniteQueryOptions<TInput, TError, TOutput> =
  FetchInfiniteQueryOptions<TInput, TError, TOutput> & TRPCRequestOptions;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ProxyTRPCContextProps<_TRouter extends AnyRouter> {
  /**
   * Abort loading query calls when unmounting a component - usually when navigating to a new page
   * @default false
   */
  abortOnUnmount?: boolean;
}

export interface TRPCContextProps<TRouter extends AnyRouter>
  extends ProxyTRPCContextProps<TRouter> {
  /**
   * The react-query `QueryClient`
   */
  queryClient: QueryClient;
}

export const contextProps: (keyof ProxyTRPCContextProps<any>)[] = [
  "abortOnUnmount",
];

/** @internal */
export interface TRPCContextState<TRouter extends AnyRouter>
  extends Required<TRPCContextProps<TRouter>> {
  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientfetchquery
   */
  fetchQuery<
    TPath extends keyof TRouter["_def"]["queries"] & string,
    TProcedure extends TRouter["_def"]["queries"][TPath],
    TOutput extends inferProcedureOutput<TProcedure>,
    TInput extends inferProcedureInput<TProcedure>
  >(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TProcedure>],
    opts?: TRPCFetchQueryOptions<TInput, TRPCClientError<TRouter>, TOutput>
  ): Promise<TOutput>;
  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientfetchinfinitequery
   */
  fetchInfiniteQuery<
    TPath extends keyof TRouter["_def"]["queries"] & string,
    TProcedure extends TRouter["_def"]["queries"][TPath],
    TOutput extends inferProcedureOutput<TProcedure>,
    TInput extends inferProcedureInput<TProcedure>
  >(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TProcedure>],
    opts?: TRPCFetchInfiniteQueryOptions<
      TInput,
      TRPCClientError<TRouter>,
      TOutput
    >
  ): Promise<InfiniteData<TOutput>>;
  /**
   * @link https://react-query.tanstack.com/guides/prefetching
   */
  prefetchQuery<
    TPath extends keyof TRouter["_def"]["queries"] & string,
    TProcedure extends TRouter["_def"]["queries"][TPath],
    TOutput extends inferProcedureOutput<TProcedure>,
    TInput extends inferProcedureInput<TProcedure>
  >(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TProcedure>],
    opts?: TRPCFetchQueryOptions<TInput, TRPCClientError<TRouter>, TOutput>
  ): Promise<void>;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientprefetchinfinitequery
   */
  prefetchInfiniteQuery<
    TPath extends keyof TRouter["_def"]["queries"] & string,
    TProcedure extends TRouter["_def"]["queries"][TPath],
    TOutput extends inferProcedureOutput<TProcedure>,
    TInput extends inferProcedureInput<TProcedure>
  >(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TProcedure>],
    opts?: TRPCFetchInfiniteQueryOptions<
      TInput,
      TRPCClientError<TRouter>,
      TOutput
    >
  ): Promise<void>;

  /**
   * @link https://react-query.tanstack.com/guides/query-invalidation
   */
  invalidateQueries<
    TPath extends keyof TRouter["_def"]["queries"] & string,
    TInput extends inferProcedureInput<TRouter["_def"]["queries"][TPath]>
  >(
    pathAndInput?: [TPath, TInput?] | TPath,
    filters?: InvalidateQueryFilters,
    options?: InvalidateOptions
  ): Promise<void>;
  /**
   * @link https://react-query.tanstack.com/guides/query-invalidation
   */
  invalidateQueries(
    filters?: InvalidateQueryFilters,
    options?: InvalidateOptions
  ): Promise<void>;

  /**
   * @link https://react-query.tanstack.com/reference/QueryClient#queryclientrefetchqueries
   */
  refetchQueries<
    TPath extends keyof TRouter["_def"]["queries"] & string,
    TInput extends inferProcedureInput<TRouter["_def"]["queries"][TPath]>
  >(
    pathAndInput: [TPath, TInput?],
    filters?: RefetchQueryFilters,
    options?: RefetchOptions
  ): Promise<void>;
  /**
   * @link https://react-query.tanstack.com/reference/QueryClient#queryclientrefetchqueries
   */
  refetchQueries(
    filters?: RefetchQueryFilters,
    options?: RefetchOptions
  ): Promise<void>;

  /**
   * @link https://react-query.tanstack.com/guides/query-cancellation
   */
  cancelQuery<
    TPath extends keyof TRouter["_def"]["queries"] & string,
    TInput extends inferProcedureInput<TRouter["_def"]["queries"][TPath]>
  >(
    pathAndInput: [TPath, TInput?],
    options?: CancelOptions
  ): Promise<void>;
  /**
   * @link https://react-query.tanstack.com/reference/QueryClient#queryclientsetquerydata
   */
  setQueryData<
    TPath extends keyof TRouter["_def"]["queries"] & string,
    TInput extends inferProcedureInput<TRouter["_def"]["queries"][TPath]>,
    TOutput extends inferProcedureOutput<TRouter["_def"]["queries"][TPath]>
  >(
    pathAndInput: [TPath, TInput?],
    updater: Updater<TOutput | undefined, TOutput | undefined>,
    options?: SetDataOptions
  ): void;
  /**
   * @link https://react-query.tanstack.com/reference/QueryClient#queryclientgetquerydata
   */
  getQueryData<
    TPath extends keyof TRouter["_def"]["queries"] & string,
    TInput extends inferProcedureInput<TRouter["_def"]["queries"][TPath]>,
    TOutput extends inferProcedureOutput<TRouter["_def"]["queries"][TPath]>
  >(
    pathAndInput: [TPath, TInput?]
  ): TOutput | undefined;
  /**
   * @link https://react-query.tanstack.com/reference/QueryClient#queryclientsetquerydata
   */
  setInfiniteQueryData<
    TPath extends keyof TRouter["_def"]["queries"] & string,
    TInput extends inferProcedureInput<TRouter["_def"]["queries"][TPath]>,
    TOutput extends inferProcedureOutput<TRouter["_def"]["queries"][TPath]>
  >(
    pathAndInput: [TPath, TInput?],
    updater: Updater<
      InfiniteData<TOutput> | undefined,
      InfiniteData<TOutput> | undefined
    >,
    options?: SetDataOptions
  ): void;
  /**
   * @link https://react-query.tanstack.com/reference/QueryClient#queryclientgetquerydata
   */
  getInfiniteQueryData<
    TPath extends keyof TRouter["_def"]["queries"] & string,
    TInput extends inferProcedureInput<TRouter["_def"]["queries"][TPath]>,
    TOutput extends inferProcedureOutput<TRouter["_def"]["queries"][TPath]>
  >(
    pathAndInput: [TPath, TInput?]
  ): InfiniteData<TOutput> | undefined;
}

export const TRPCContext = createContext(null as any);
