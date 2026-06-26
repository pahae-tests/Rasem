-- DROP DATABASE IF EXISTS rasem_db;
-- CREATE DATABASE rasem_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE rasem_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `drawings`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `cart`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `drawing_gallery`;
DROP TABLE IF EXISTS `faqs`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('client','admin') NOT NULL DEFAULT 'client',
  avatar LONGBLOB,
  avatar_mime VARCHAR(60),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE drawings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 1,
  category_id INT UNSIGNED,
  main_image LONGBLOB,
  main_image_mime VARCHAR(60),
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  total_orders INT UNSIGNED NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_drawing_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_available (is_available),
  INDEX idx_category (category_id),
  INDEX idx_created (created_at),
  INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE drawing_gallery (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  drawing_id INT UNSIGNED NOT NULL,
  image LONGBLOB NOT NULL,
  image_mime VARCHAR(60) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_gallery_drawing FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE CASCADE,
  INDEX idx_drawing (drawing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  drawing_id INT UNSIGNED NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  notes TEXT,
  status ENUM('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  cancel_reason TEXT,
  price_snapshot DECIMAL(10,2) NOT NULL,
  invoice_pdf LONGBLOB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_drawing FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_drawing (drawing_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  drawing_id INT UNSIGNED NOT NULL,
  order_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_drawing (user_id, drawing_id),
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_drawing FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_drawing (drawing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favorites (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  drawing_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fav (user_id, drawing_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_drawing FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE faqs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (name, email, phone, password_hash, role) VALUES
('مدير النظام', 'ikram@wafik.com', '+212674935928', 'uFgW9loKIuJde35Z', 'admin');

INSERT INTO categories (name, slug) VALUES
('بورتريه', 'portrait'),
('طبيعة', 'nature'),
('تجريدي', 'abstract'),
('معماري', 'architectural'),
('حيوانات', 'animals');

INSERT INTO faqs (question, answer, sort_order) VALUES
('كيف أقدم طلبي؟', 'اختر الرسم الذي يعجبك، ثم انقر على زر "اطلب الآن". أدخل معلومات التوصيل وسيتم إنشاء طلبك مباشرة.', 1),
('ما هي مدة التوصيل؟', 'تتراوح مدة التوصيل بين 3 و 7 أيام عمل حسب المنطقة الجغرافية.', 2),
('هل يمكنني إلغاء طلبي؟', 'يمكنك إلغاء طلبك فقط عندما يكون في حالة "قيد الانتظار". بعد التأكيد لا يمكن الإلغاء.', 3),
('هل الرسومات أصلية؟', 'نعم، جميع الرسومات أصلية ومرسومة يدوياً بالكامل من قِبل فنانينا المحترفين.', 4),
('كيف أتواصل معكم؟', 'يمكنك التواصل معنا عبر صفحة الاتصال أو عبر البريد الإلكتروني contact@rasem.ma', 5);