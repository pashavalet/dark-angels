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
          search: 'Search',
          all: 'All',
          no_tours_found: 'No tours found',
          explore_tours: 'Explore our exclusive tours',
          agency: 'Agency',
          earnings: 'Earnings',
          vip: 'VIP',
          page: 'Page',
          previous: 'Previous',
          next: 'Next',
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
          search: 'Поиск',
          all: 'Все',
          no_tours_found: 'Туры не найдены',
          explore_tours: 'Исследуйте наши эксклюзивные туры',
          agency: 'Агентство',
          earnings: 'Заработок',
          vip: 'VIP',
          page: 'Страница',
          previous: 'Назад',
          next: 'Вперёд',
        },
      },
    },
  });

export default i18n;