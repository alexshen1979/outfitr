-- OUTFITR Database Schema
-- Complete Database Initialization Script
-- Database: dev_outfitr
-- Execute this script directly on MySQL server

USE dev_outfitr;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  avatar VARCHAR(500),
  role ENUM('free', 'premium', 'vip') DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Photos Table
CREATE TABLE IF NOT EXISTS user_photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  photo_type ENUM('avatar', 'body') DEFAULT 'body',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wardrobe Items Table
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100),
  image_url VARCHAR(500) NOT NULL,
  category VARCHAR(50),
  tags JSON,
  season VARCHAR(20),
  style VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Outfit Results Table
CREATE TABLE IF NOT EXISTS outfit_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  result_image_url VARCHAR(500) NOT NULL,
  input_user_photo_id INT,
  input_clothing_ids JSON,
  style VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (input_user_photo_id) REFERENCES user_photos(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API Usage Logs Table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  api_type VARCHAR(50) NOT NULL,
  request_count INT DEFAULT 1,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date_type (user_id, date, api_type),
  INDEX idx_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscriptions Table (for future use)
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_type ENUM('monthly', 'yearly') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show created tables
SHOW TABLES;
