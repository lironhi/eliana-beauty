import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import en from './locales/en';
import he from './locales/he';

export type Locale = 'en' | 'he';

const translations = { en, he };

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
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
      t: (key: string) => {
        const locale = get().locale;
        const keys = key.split('.');
        let value: any = translations[locale];

        for (const k of keys) {
          value = value?.[k];
        }

        return value || key;
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
