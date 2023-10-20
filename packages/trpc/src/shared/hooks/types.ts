import {
  type QueryKey,
  type SolidQueryOptions,
  type SolidInfiniteQueryOptions,
} from "@tanstack/solid-query";
import { type TRPCRequestOptions } from "@trpc/client";

export interface TRPCUseQueryBaseOptions {
  /**
   * tRPC-related options
   */
  trpc?: TRPCRequestOptions;
}

type OmitUseless<T> = Omit<T, "queryKey" | "queryFn"> & TRPCUseQueryBaseOptions;
export type FunctionedParams<T> = () => T;
export type CreateQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = FunctionedParams<
  OmitUseless<SolidQueryOptions<TQueryFnData, TError, TData, TQueryKey>>
>;

export type CreateInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = FunctionedParams<
  OmitUseless<
    SolidInfiniteQueryOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryFnData,
      TQueryKey
    >
  >
>;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseTRPCInfiniteQueryOptions<TPath, TInput, TOutput, TError>
  extends CreateInfiniteQueryOptions<
    TOutput,
    TError,
    TOutput,
    [TPath, TInput]
  > {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseTRPCQueryOptions<TPath, TInput, TOutput, TData, TError>
  extends CreateQueryOptions<TOutput, TError, TData, [TPath, TInput]> {}
