-- Migration: Add past_papers and paper_images tables
-- Created for AI-powered question extraction

-- Past Papers table - stores extracted questions from PDF past papers
CREATE TABLE IF NOT EXISTS past_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id VARCHAR(100) UNIQUE NOT NULL,
    original_pdf_url TEXT NOT NULL,
    stored_pdf_url TEXT,
    subject VARCHAR(100) NOT NULL,
    paper VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    month VARCHAR(20) NOT NULL,
    is_extracted BOOLEAN DEFAULT false,
    extracted_questions JSONB,
    instructions TEXT,
    total_marks INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups by paper_id
CREATE INDEX IF NOT EXISTS idx_past_papers_paper_id ON past_papers(paper_id);

-- Index for fast lookups by extraction status
CREATE INDEX IF NOT EXISTS idx_past_papers_is_extracted ON past_papers(is_extracted);

-- Paper Images table - stores extracted images from PDFs
CREATE TABLE IF NOT EXISTS paper_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    past_paper_id UUID REFERENCES past_papers(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    extracted_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups by past_paper_id
CREATE INDEX IF NOT EXISTS idx_paper_images_past_paper_id ON paper_images(past_paper_id);

-- Index for fast lookups by page_number
CREATE INDEX IF NOT EXISTS idx_paper_images_page ON paper_images(past_paper_id, page_number);
