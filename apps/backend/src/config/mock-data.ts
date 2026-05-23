import { randomUUID } from 'node:crypto';

export interface MockAdmin {
  id: string; email: string; password_hash: string;
  totp_secret: string | null; totp_enabled: boolean; recovery_codes_hash: string[] | null;
  created_at: string; updated_at: string; last_login: string | null;
  failed_login_attempts: number; locked_until: string | null;
}

export interface MockRefreshToken {
  id: string; admin_id: string; token_hash: string;
  expires_at: string; created_at: string;
}

export interface MockTour {
  id: string; title: { ru: string; en: string }; description: { ru: string; en: string };
  country: { ru: string; en: string }; city: { ru: string; en: string };
  agency: { ru: string; en: string }; earnings: string | null; contacts: string | null;
  is_vip: boolean; hidden_vip: boolean; tags: string[]; image_url: string | null;
  sort_order: number; is_published: boolean; created_at: string; updated_at: string;
}

export interface MockService {
  id: string; title: { ru: string; en: string }; description: { ru: string; en: string };
  price: string | null; contacts: string | null; tags: string[]; image_url: string | null;
  sort_order: number; is_published: boolean; created_at: string; updated_at: string;
}

export interface MockBlogArticle {
  id: string; title: { ru: string; en: string }; content: { ru: string; en: string };
  preview_image: string | null; tags: string[]; hidden_vip: boolean;
  access_level: string; sort_order: number; is_published: boolean;
  created_at: string; updated_at: string;
}

export interface MockHomepageCollection {
  id: string; section: string; item_id: string; item_type: string;
  sort_order: number; is_pinned: boolean; created_at: string;
}

export * from './mock-data.js';

const now = new Date().toISOString();

export const admins: MockAdmin[] = [
  { id: randomUUID(), email: 'admin@darkangels.local', password_hash: '$2b$04$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', totp_secret: null, totp_enabled: false, recovery_codes_hash: null, created_at: now, updated_at: now, last_login: null, failed_login_attempts: 0, locked_until: null },
];

const tourId1 = randomUUID(), tourId2 = randomUUID(), tourId3 = randomUUID();
const serviceId1 = randomUUID(), serviceId2 = randomUUID(), serviceId3 = randomUUID();
const blogId1 = randomUUID(), blogId2 = randomUUID(), blogId3 = randomUUID();

export const tours: MockTour[] = [
  { id: tourId1, title: { ru: 'Тур в Париж', en: 'Paris Tour' }, description: { ru: 'Эксклюзивный тур в Париж с проживанием в 5-звёздочном отеле. Включает персонального гида, лимузин и VIP-доступ к закрытым мероприятиям.', en: 'Exclusive Paris tour with 5-star hotel accommodation. Includes personal guide, limousine and VIP access to private events.' }, country: { ru: 'Франция', en: 'France' }, city: { ru: 'Париж', en: 'Paris' }, agency: { ru: 'Dark Angels Paris', en: 'Dark Angels Paris' }, earnings: '€10,000 – €20,000', contacts: '@paris_manager', is_vip: true, hidden_vip: false, tags: ['premium', 'europe', 'vip'], image_url: null, sort_order: 1, is_published: true, created_at: now, updated_at: now },
  { id: tourId2, title: { ru: 'Тур в Дубай', en: 'Dubai Tour' }, description: { ru: 'Роскошный тур в Дубай с персональным водителем и проживанием в Burj Al Arab. Шопинг с личным стилистом, яхта, вертолётная экскурсия.', en: 'Luxury Dubai tour with personal driver and Burj Al Arab stay. Shopping with personal stylist, yacht, helicopter tour.' }, country: { ru: 'ОАЭ', en: 'UAE' }, city: { ru: 'Дубай', en: 'Dubai' }, agency: { ru: 'Dark Angels Dubai', en: 'Dark Angels Dubai' }, earnings: '$15,000 – $30,000', contacts: '@dubai_manager', is_vip: true, hidden_vip: false, tags: ['vip', 'asia', 'premium'], image_url: null, sort_order: 2, is_published: true, created_at: now, updated_at: now },
  { id: tourId3, title: { ru: 'Тур в Барселону', en: 'Barcelona Tour' }, description: { ru: 'Элитный тур в Барселону. Частная вилла с бассейном, аренда яхты, доступ в закрытые клубы, персональный шеф-повар.', en: 'Elite Barcelona tour. Private villa with pool, yacht rental, exclusive club access, personal chef.' }, country: { ru: 'Испания', en: 'Spain' }, city: { ru: 'Барселона', en: 'Barcelona' }, agency: { ru: 'Dark Angels Barcelona', en: 'Dark Angels Barcelona' }, earnings: '€8,000 – €15,000', contacts: '@barcelona_manager', is_vip: false, hidden_vip: true, tags: ['europe', 'exclusive', 'beach'], image_url: null, sort_order: 3, is_published: true, created_at: now, updated_at: now },
];

export const services: MockService[] = [
  { id: serviceId1, title: { ru: 'VIP-сопровождение', en: 'VIP Companion' }, description: { ru: 'Элитное сопровождение для деловых мероприятий, ужинов и светских приёмов. Образование, знание этикета, иностранные языки.', en: 'Elite companion service for business events, dinners and social receptions. Education, etiquette knowledge, foreign languages.' }, price: 'От $1,000/час', contacts: '@vip_companion', tags: ['vip', 'business', 'events'], image_url: null, sort_order: 1, is_published: true, created_at: now, updated_at: now },
  { id: serviceId2, title: { ru: 'Путешествия с компаньонкой', en: 'Travel Companion' }, description: { ru: 'Индивидуальные путешествия с персональной компаньонкой. Любое направление, полная организация, конфиденциальность.', en: 'Personal travel with a companion. Any destination, full organization, confidentiality.' }, price: 'От $5,000/день', contacts: '@travel_companion', tags: ['travel', 'vip', 'worldwide'], image_url: null, sort_order: 2, is_published: true, created_at: now, updated_at: now },
  { id: serviceId3, title: { ru: 'Эскорт на мероприятия', en: 'Event Escort' }, description: { ru: 'Профессиональный эскорт на красные дорожки, премьеры, закрытые вечеринки. Стилист и визажист включены.', en: 'Professional escort for red carpets, premieres, private parties. Stylist and makeup artist included.' }, price: 'От $3,000/событие', contacts: '@event_escort', tags: ['events', 'red-carpet', 'premium'], image_url: null, sort_order: 3, is_published: true, created_at: now, updated_at: now },
];

export const blogArticles: MockBlogArticle[] = [
  { id: blogId1, title: { ru: 'Как выбрать VIP-тур', en: 'How to Choose a VIP Tour' }, content: { ru: '# Как выбрать VIP-тур\n\nВыбор правильного тура — это искусство. **Вот несколько критериев:**\n\n1. Репутация агентства\n2. Уровень конфиденциальности\n3. Качество размещения\n\n> «Путешествие — единственная вещь, покупая которую, становишься богаче.»\n\nСвяжитесь с нами для консультации.', en: '# How to Choose a VIP Tour\n\nChoosing the right tour is an art. **Here are some criteria:**\n\n1. Agency reputation\n2. Privacy level\n3. Accommodation quality\n\n> «Travel is the only thing you buy that makes you richer.»\n\nContact us for a consultation.' }, preview_image: null, tags: ['guide', 'vip', 'tips'], hidden_vip: false, access_level: 'public', sort_order: 1, is_published: true, created_at: now, updated_at: now },
  { id: blogId2, title: { ru: 'Закрытый клуб: правила', en: 'Private Club: Rules' }, content: { ru: '# Закрытый клуб\n\nДобро пожаловать в закрытый клуб Dark Angels.\n\n## Базовые правила:\n\n- Полная конфиденциальность\n- Предоплата 50%\n- Верификация личности\n\n```\nСтатус: VIP\nДоступ: премиум\n```\n\nЗа дополнительной информацией обращайтесь к менеджеру.', en: '# Private Club\n\nWelcome to the Dark Angels private club.\n\n## Basic rules:\n\n- Full confidentiality\n- 50% prepayment\n- Identity verification\n\n```\nStatus: VIP\nAccess: premium\n```\n\nContact your manager for more information.' }, preview_image: null, tags: ['club', 'vip', 'rules'], hidden_vip: true, access_level: 'vip', sort_order: 2, is_published: true, created_at: now, updated_at: now },
  { id: blogId3, title: { ru: 'Мода и стиль для путешествий', en: 'Travel Fashion & Style' }, content: { ru: '# Мода и стиль\n\n## Что взять с собой:\n\n| Тип | Рекомендация |\n|---|---|\n| Деловой | Костюм, часы |\n| Пляжный | Лён, шляпа |\n| Вечерний | Смокинг, платье |\n\nСтиль — это способ сказать, кто вы есть, не произнося ни слова.', en: '# Fashion & Style\n\n## What to pack:\n\n| Type | Recommendation |\n|---|---|\n| Business | Suit, watch |\n| Beach | Linen, hat |\n| Evening | Tuxedo, gown |\n\nStyle is a way to say who you are without having to speak.' }, preview_image: null, tags: ['fashion', 'style', 'travel'], hidden_vip: false, access_level: 'public', sort_order: 3, is_published: true, created_at: now, updated_at: now },
];

export const homepageCollections: MockHomepageCollection[] = [
  { id: randomUUID(), section: 'featured_tours', item_id: tourId1, item_type: 'tour', sort_order: 0, is_pinned: true, created_at: now },
  { id: randomUUID(), section: 'featured_tours', item_id: tourId2, item_type: 'tour', sort_order: 1, is_pinned: true, created_at: now },
  { id: randomUUID(), section: 'featured_tours', item_id: tourId3, item_type: 'tour', sort_order: 2, is_pinned: false, created_at: now },
  { id: randomUUID(), section: 'featured_services', item_id: serviceId1, item_type: 'service', sort_order: 0, is_pinned: true, created_at: now },
  { id: randomUUID(), section: 'featured_services', item_id: serviceId2, item_type: 'service', sort_order: 1, is_pinned: true, created_at: now },
  { id: randomUUID(), section: 'featured_blog', item_id: blogId1, item_type: 'blog', sort_order: 0, is_pinned: true, created_at: now },
  { id: randomUUID(), section: 'featured_blog', item_id: blogId3, item_type: 'blog', sort_order: 1, is_pinned: true, created_at: now },
];