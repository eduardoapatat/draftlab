import { es, type TranslationKey } from './es';

const LOCALES = { es } as const;
type Locale = keyof typeof LOCALES;

const activeLocale: Locale = 'es';

type Vars = Record<string, string | number>;

export function t(key: TranslationKey, vars?: Vars): string {
  const dict = LOCALES[activeLocale];
  let text: string = dict[key];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function useT() {
  return t;
}

export type { TranslationKey };
