import "@docsearch/css";
import { createSignal, Show } from "solid-js";
import "./Search.css";

// import * as docSearchReact from '@docsearch/react';

/** FIXME: This is still kinda nasty, but DocSearch is not ESM ready. */
// const DocSearchModal =
// 	docSearchReact.DocSearchModal || (docSearchReact as any).default.DocSearchModal;
// const useDocSearchKeyboardEvents =
// 	docSearchReact.useDocSearchKeyboardEvents ||
// 	(docSearchReact as any).default.useDocSearchKeyboardEvents;

export default function Search() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [initialQuery, setInitialQuery] = createSignal("");

  let searchButtonRef: HTMLButtonElement | undefined;

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const onInput = (e) => {
    setIsOpen(true);
    setInitialQuery(e.key);
  };

  // useDocSearchKeyboardEvents({
  // 	isOpen,
  // 	onOpen,
  // 	onClose,
  // 	onInput,
  // 	searchButtonRef,
  // });

  return (
    <>
      <button
        type="button"
        ref={searchButtonRef}
        onClick={onOpen}
        class="search-input"
      >
        <svg width="24" height="24" fill="none">
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <span>Search</span>

        <span class="search-hint">
          <span class="sr-only">Press </span>

          <kbd>/</kbd>

          <span class="sr-only"> to search</span>
        </span>
      </button>

      <Show when={isOpen}>
        {
          // createPortal(
          // 	<DocSearchModal
          // 		initialQuery={initialQuery}
          // 		initialScrollY={window.scrollY}
          // 		onClose={onClose}
          // 		indexName={ALGOLIA.indexName}
          // 		appId={ALGOLIA.appId}
          // 		apiKey={ALGOLIA.apiKey}
          // 		transformItems={(items) => {
          // 			return items.map((item) => {
          // 				// We transform the absolute URL into a relative URL to
          // 				// work better on localhost, preview URLS.
          // 				const a = document.createElement('a');
          // 				a.href = item.url;
          // 				const hash = a.hash === '#overview' ? '' : a.hash;
          // 				return {
          // 					...item,
          // 					url: `${a.pathname}${hash}`,
          // 				};
          // 			});
          // 		}}
          // 	/>,
          // 	document.body
          // )}
        }
      </Show>
    </>
  );
}
