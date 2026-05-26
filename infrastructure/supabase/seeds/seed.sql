-- Generates a secure bcrypt hash for 'admin123456!' (12 rounds)
-- In production, run this from backend; here it's pre-computed for the seed.
-- To generate: bcrypt.hashSync('admin123456!', 12)

INSERT INTO admins (email, password_hash) VALUES
('admin@darkangels.local', '$2b$12$QJFxJmHbuxidy4.R9qn22uaVYkGvrH9013tZ4kPezipuLd9AcEzj2');

-- Sample tours
INSERT INTO tours (title, description, country, city, agency, earnings, contacts, is_vip, tags, sort_order) VALUES
(
  '{"ru": "Тур в Париж", "en": "Paris Tour"}',
  '{"ru": "Эксклюзивный тур в Париж с проживанием в 5-звёздочном отеле", "en": "Exclusive Paris tour with 5-star hotel accommodation"}',
  '{"ru": "Франция", "en": "France"}',
  '{"ru": "Париж", "en": "Paris"}',
  '{"ru": "Dark Angels Paris", "en": "Dark Angels Paris"}',
  '€10,000 - €20,000',
  '@paris_manager',
  true,
  ARRAY['premium', 'europe'],
  1
),
(
  '{"ru": "Тур в Дубай", "en": "Dubai Tour"}',
  '{"ru": "Роскошный тур в Дубай с персональным водителем", "en": "Luxury Dubai tour with personal driver"}',
  '{"ru": "ОАЭ", "en": "UAE"}',
  '{"ru": "Дубай", "en": "Dubai"}',
  '{"ru": "Dark Angels Dubai", "en": "Dark Angels Dubai"}',
  '$15,000 - $30,000',
  '@dubai_manager',
  true,
  ARRAY['vip', 'asia'],
  2
);

-- Sample services
INSERT INTO services (title, description, price, tags, sort_order) VALUES
(
  '{"ru": "VIP-сопровождение", "en": "VIP Companion"}',
  '{"ru": "Элитное сопровождение для деловых мероприятий", "en": "Elite companion service for business events"}',
  'От $1,000/час',
  ARRAY['vip', 'business'],
  1
),
(
  '{"ru": "Путешествия с компаньонкой", "en": "Travel Companion"}',
  '{"ru": "Индивидуальные путешествия с персональной компаньонкой", "en": "Personal travel with a companion"}',
  'От $5,000/день',
  ARRAY['travel', 'vip'],
  2
);

-- Sample blog articles
INSERT INTO blog_articles (title, content, tags, access_level, sort_order) VALUES
(
  '{"ru": "Как выбрать VIP-тур", "en": "How to Choose a VIP Tour"}',
  '{"ru": "# Как выбрать VIP-тур\n\nВыбор правильного тура — это искусство...", "en": "# How to Choose a VIP Tour\n\nChoosing the right tour is an art..."}',
  ARRAY['guide', 'vip'],
  'public',
  1
),
(
  '{"ru": "Закрытый клуб: правила", "en": "Private Club: Rules"}',
  '{"ru": "# Закрытый клуб\n\nЭксклюзивная информация для VIP-клиентов...", "en": "# Private Club\n\nExclusive information for VIP clients..."}',
  ARRAY['club', 'vip'],
  'vip',
  2
);

-- Homepage featured collections
INSERT INTO homepage_collections (section, item_id, item_type, sort_order, is_pinned) 
SELECT 'featured_tours', id, 'tour', sort_order, true FROM tours LIMIT 2;

INSERT INTO homepage_collections (section, item_id, item_type, sort_order, is_pinned)
SELECT 'featured_services', id, 'service', sort_order, true FROM services LIMIT 2;

INSERT INTO homepage_collections (section, item_id, item_type, sort_order, is_pinned)
SELECT 'featured_blog', id, 'blog', sort_order, true FROM blog_articles LIMIT 2;