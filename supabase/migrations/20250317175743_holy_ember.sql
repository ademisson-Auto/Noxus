/*
  # Content Management Schema

  1. New Tables
    - `books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `author` (text)
      - `cover_url` (text)
      - `description` (text)
      - `type` (text) - manga, light_novel, or ebook
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chapters`
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key)
      - `number` (integer)
      - `title` (text)
      - `content_url` (text)
      - `created_at` (timestamp)
    
    - `bookmarks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `book_id` (uuid, foreign key)
      - `chapter_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `reading_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `book_id` (uuid, foreign key)
      - `chapter_id` (uuid, foreign key)
      - `progress` (float) - percentage of chapter read
      - `last_read` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  cover_url text,
  description text,
  type text CHECK (type IN ('manga', 'light_novel', 'ebook')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  number integer NOT NULL,
  title text NOT NULL,
  content_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(book_id, number)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  progress float CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
  last_read timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id, chapter_id)
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Policies for books and chapters (public read access, admin write)
CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Chapters are viewable by everyone"
  ON chapters FOR SELECT
  TO public
  USING (true);

-- Policies for bookmarks (user can manage their own bookmarks)
CREATE POLICY "Users can manage their own bookmarks"
  ON bookmarks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for reading progress (user can manage their own progress)
CREATE POLICY "Users can manage their own reading progress"
  ON reading_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);