export const SITE = {
  title: 'MediaKit',
  description: 'MediaKit documentation and examples',
  defaultLanguage: 'en-us',
} as const

// export const OPEN_GRAPH = {
//   image: {
//     src: 'https://github.com/withastro/astro/blob/main/assets/social/banner-minimal.png?raw=true',
//     alt:
//       'astro logo on a starry expanse of space,' +
//       ' with a purple saturn-like planet floating in the right foreground',
//   },
//   twitter: 'astrodotbuild',
// }

export const KNOWN_LANGUAGES = {
  English: 'en',
} as const
export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES)

export const GITHUB_EDIT_URL = `https://github.com/solidjs-community/mediakit/tree/main/docs`

export const COMMUNITY_INVITE_URL = `https://github.com/solidjs-community/mediakit`

// See "Algolia" section of the README for more information.
export const ALGOLIA = {
  indexName: 'XXXXXXXXXX',
  appId: 'XXXXXXXXXX',
  apiKey: 'XXXXXXXXXX',
}

export type Sidebar = Record<string, { text: string; link: string }[]>

export const SIDEBAR: Sidebar = {
  Overview: [
    { text: 'Introduction', link: 'introduction' },
    { text: 'Contributors', link: 'contributors' },
    { text: 'Sponsors', link: 'sponsors' },
  ],
  pRPC: [
    { text: 'builder$', link: 'prpc/builder' },
    { text: 'query$', link: 'prpc/query' },
    { text: 'query$', link: 'prpc/mutation' },
    { text: 'middleware$', link: 'prpc/middleware' },
    { text: 'pipe$', link: 'prpc/pipe' },
    {
      text: 'error$',
      link: 'prpc/error',
    },
    {
      text: 'PRPCClientError',
      link: 'prpc/prpc-client-error',
    },
    {
      text: 'hideRequest',
      link: 'prpc/hideRequest',
    },
  ],
  Auth: [
    { text: 'Install', link: 'auth/install' },
    { text: 'signIn', link: 'auth/signin' },
    { text: 'signOut', link: 'auth/signout' },
    { text: 'createSession', link: 'auth/createsession' },
    { text: 'getSession', link: 'auth/getsession' },
  ],
  tRPC: [
    { text: 'Install', link: 'trpc/install' },
    { text: 'Router', link: 'trpc/router' },
    { text: 'API Handler', link: 'trpc/handler' },
  ],
  Media: [
    { text: 'Install', link: 'media/install' },
    { text: 'createVideo', link: 'media/createvideo' },
  ],
}
