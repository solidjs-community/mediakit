// src/provider.tsx
import {
  QueryClientProvider
} from "@tanstack/solid-query";
var PRPCProvider = (props) => {
  return <QueryClientProvider client={props.queryClient} {...props.queryProps}>{props.children}</QueryClientProvider>;
};
export {
  PRPCProvider
};
