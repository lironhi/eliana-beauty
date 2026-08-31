import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import en from './locales/en';
import he from './locales/he';

export type Locale = 'en' | 'he';

const translations = { en, he };

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /**
   * `params` remplace les marqueurs `{nom}` de la traduction. Optionnel : les
   * appels existants, qui passent une seule clé, ne changent pas.
   */
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      locale: 'en',
      setLocale: (locale: Locale) => {
        set({ locale });
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
      },
      t: (key: string, params?: Record<string, string | number>) => {
        const locale = get().locale;
        const keys = key.split('.');
        let value: any = translations[locale];

        for (const k of keys) {
          value = value?.[k];
        }

        if (!value) return key;
        if (!params) return value;

        // Un marqueur sans valeur correspondante est laissé tel quel : mieux
        // vaut voir `{email}` à l'écran qu'un trou silencieux dans la phrase.
        return String(value).replace(/\{(\w+)\}/g, (match, name) =>
          params[name] === undefined ? match : String(params[name]),
        );
      },
    }),
    {
      name: 'eliana-locale',
    },
  ),
);

// Initialize direction on load
const locale = useI18n.getState().locale;
document.documentElement.lang = locale;
document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
