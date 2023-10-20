/* eslint-disable @typescript-eslint/no-explicit-any */
import { type AnyRouter } from "@trpc/server";
import { createRecursiveProxy } from "@trpc/server/shared";
import { getQueryKey } from "../../internals/getQueryKey";
import { type CreateSolidQueryHooks } from "../hooks/createHooksInternal";

/**
 * Create proxy for decorating procedures
 * @internal
 */
export function createSolidProxyDecoration<TRouter extends AnyRouter>(
  name: string,
  hooks: CreateSolidQueryHooks<TRouter>
) {
  return createRecursiveProxy((opts) => {
    const args = opts.args;

    const pathCopy = [name, ...opts.path];

    // The last arg is for instance `.useMutation` or `.useQuery()`
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastArg = pathCopy.pop()!;

    // The `path` ends up being something like `post.byId`
    const path = pathCopy.join(".");
    if (lastArg === "useMutation") {
      return (hooks as any)[lastArg](path, ...args);
    }
    return (hooks as any)[lastArg](
      () =>
        getQueryKey(path, typeof args[0] === "function" ? args[0]() : args[0]),
      args[1]
    );
  });
}
