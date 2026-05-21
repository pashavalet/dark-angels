import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

await i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['ru', 'en'],
    interpolation: { escapeValue: false },
    resources: {
      en: {
        common: {
          home: 'Home',
          tours: 'Tours',
          blog: 'Blog',
          services: 'Services',
          contacts: 'Contacts',
          admin: 'Admin',
          login: 'Log In',
          email: 'Email',
          password: 'Password',
          submit: 'Submit',
          back: 'Back',
        },
      },
      ru: {
        common: {
          home: 'Главная',
          tours: 'Туры',
          blog: 'Блог',
          services: 'Услуги',
          contacts: 'Контакты',
          admin: 'Админ',
          login: 'Вход',
          email: 'Email',
          password: 'Пароль',
          submit: 'Отправить',
          back: 'Назад',
        },
      },
    },
  });

export default i18n;