import { createI18n } from 'vue-i18n';
import ru from '../locales/ru.js';
import en from '../locales/en.js';

// Определяем локаль по умолчанию
const defaultLocale = localStorage.getItem('locale') || 'ru';

// Создаем экземпляр i18n
const i18n = createI18n({
  legacy: false, // Используем Composition API mode
  locale: defaultLocale,
  fallbackLocale: 'ru',
  messages: {
    ru,
    en
  },
  // Опции для плюрализации, если нужны
  pluralizationRules: {
    ru: function(choice, choicesLength) {
      // Для русского языка специфические правила множественного числа
      if (choice === 0) {
        return 0;
      }

      const teen = choice > 10 && choice < 20;
      const endsWithOne = choice % 10 === 1;

      if (!teen && endsWithOne) {
        return 1;
      }
      if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
        return 2;
      }
      return 3;
    }
  }
});

// Вспомогательные функции для работы с языками
export const setLocale = (locale) => {
  i18n.global.locale.value = locale;
  localStorage.setItem('locale', locale);
  document.querySelector('html').setAttribute('lang', locale);
};

export const getLocale = () => {
  return i18n.global.locale.value;
};

export const availableLocales = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

export default i18n; 