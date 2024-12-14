import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import {Pathnames, LocalePrefix} from 'next-intl/routing';

// Can be imported from a shared config
export const locales = ["en", "fr", "es", "de", "br"];

export const pathnames: Pathnames<typeof locales> = {
  '/': '/',
  '/pathnames': {
    en: '/pathnames',
    es: '/pathnames',
    fr: '/pathnames',
    br: '/pathnames',
    de: '/pfadnamen'
  }
};

export const defaultLocale = 'en' as const;

export const localeNames = ["English", "French", "Español"];

export const localePrefix: LocalePrefix<typeof locales> = 'always';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./public/locales/${locale}.json`)).default,
  };
});

