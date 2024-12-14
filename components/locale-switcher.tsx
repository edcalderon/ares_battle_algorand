import {useLocale, useTranslations} from 'next-intl';
import LocaleSwitcherSelect from './locale-switcher-select';
import {locales} from '../i18n';

export default function LocaleSwitcher() {
  const t = useTranslations('Index');
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect defaultValue={locale} label={t('locale')}>
      {locales.map((cur) => (
        <option key={cur} value={cur}>
           {cur == 'es' && '🇪🇸'}
           {cur == 'br' && '🇧🇷'}
           {cur == 'en' && '🇺🇸'} 
           {cur == 'fr' && '🇫🇷'} 
           {cur == 'de' && '🇩🇪'} &nbsp;
           {cur}
        </option>
      ))}
    </LocaleSwitcherSelect>
  );
}
