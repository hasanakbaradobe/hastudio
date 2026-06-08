-- HA Studio Database Schema (MySQL & phpMyAdmin Compatible)

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients Table (For managing relationships and company data)
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  logo VARCHAR(255),
  industry VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Team Members Table (For managing company structure)
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  bio TEXT,
  photo VARCHAR(255),
  email VARCHAR(255),
  social_links JSON, -- Object of platform: url
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Services Table
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  features JSON, -- Array of features
  pricing VARCHAR(100),
  featured_image VARCHAR(255),
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Service FAQs Table (Relationship with Services)
CREATE TABLE IF NOT EXISTS service_faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 5b. Service Packages Table (Relationship with Services)
CREATE TABLE IF NOT EXISTS service_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  price VARCHAR(100) NOT NULL,
  badge VARCHAR(50),
  description TEXT,
  features JSON NOT NULL, -- Array of strings (features offered in this bracket)
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 6. Portfolios Table (Relationship with Clients)
CREATE TABLE IF NOT EXISTS portfolios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  client_id INT, -- Relationship with client
  client_name VARCHAR(255),
  description TEXT,
  challenge TEXT,
  solution TEXT,
  result TEXT,
  thumbnail VARCHAR(255),
  video_url VARCHAR(255),
  featured_status BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- 7. Portfolio Images Gallery (Relationship with Portfolio)
CREATE TABLE IF NOT EXISTS portfolio_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  portfolio_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

-- 8. Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

-- 9. Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags JSON, -- Array of strings
  featured_image VARCHAR(255),
  seo_title VARCHAR(255),
  seo_description TEXT,
  publish_status VARCHAR(50) DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Testimonials Table (Relationship with Clients)
CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  client_name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  rating INT DEFAULT 5,
  review TEXT NOT NULL,
  photo VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- 11. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Homepage Content Management Table (Key-Value JSON store)
CREATE TABLE IF NOT EXISTS homepage_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(100) UNIQUE NOT NULL,
  section_value JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Media Library Table
CREATE TABLE IF NOT EXISTS media_library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Admin (email: admin@hastudio.com, password: admin123)
-- Hash generated by bcrypt: $2a$10$tZ21y6L3XOTgC/P3R7/u4.EaG47d83k5P2X/zW.7gXb27L2YpK9sS
INSERT IGNORE INTO admins (id, email, password, role) VALUES (1, 'admin@hastudio.com', '$2a$10$tZ21y6L3XOTgC/P3R7/u4.EaG47d83k5P2X/zW.7gXb27L2YpK9sS', 'admin');
