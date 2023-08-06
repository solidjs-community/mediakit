import { KNOWN_LANGUAGES, KNOWN_LANGUAGE_CODES } from './consts'
export { KNOWN_LANGUAGES, KNOWN_LANGUAGE_CODES }

export const langPathRegex = /\/([a-z]{2}-?[A-Z]{0,2})\//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getLanguageFromURL(_pathname: string) {
  // const langCodeMatch = pathname.match(langPathRegex);
  // const langCode = langCodeMatch ? langCodeMatch[1] : 'en';
  // return langCode as (typeof KNOWN_LANGUAGE_CODES)[number];
  return 'en'
}
