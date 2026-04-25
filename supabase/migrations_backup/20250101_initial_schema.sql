-- =============================================
-- Initial Schema for Well-being Survey System
-- =============================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    ministry VARCHAR(100),
    department VARCHAR(100),
    is_test BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table  
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    response_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HRD Chapter 1 responses table
CREATE TABLE IF NOT EXISTS hrd_ch1_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    
    -- Basic organization info
    total_employees INTEGER DEFAULT 0,
    male_employees INTEGER DEFAULT 0,
    female_employees INTEGER DEFAULT 0,
    
    -- Age distribution
    age_u30 INTEGER DEFAULT 0,
    age_30_39 INTEGER DEFAULT 0,
    age_40_49 INTEGER DEFAULT 0,
    age_50_plus INTEGER DEFAULT 0,
    
    -- Service years
    service_u1 INTEGER DEFAULT 0,
    service_1_5 INTEGER DEFAULT 0,
    service_6_10 INTEGER DEFAULT 0,
    service_11_plus INTEGER DEFAULT 0,
    
    -- Education levels
    edu_highschool INTEGER DEFAULT 0,
    edu_bachelor INTEGER DEFAULT 0,
    edu_master INTEGER DEFAULT 0,
    edu_phd INTEGER DEFAULT 0,
    
    -- Position levels
    position_operational INTEGER DEFAULT 0,
    position_supervisor INTEGER DEFAULT 0,
    position_middle INTEGER DEFAULT 0,
    position_executive INTEGER DEFAULT 0,
    
    -- Turnover and transfers
    turnover_count INTEGER DEFAULT 0,
    transfer_count INTEGER DEFAULT 0,
    
    -- Additional fields
    strategic_overview TEXT,
    org_structure TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form windows table
CREATE TABLE IF NOT EXISTS form_windows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_type VARCHAR(50) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_org_id ON survey_responses(organization_id);
CREATE INDEX IF NOT EXISTS idx_hrd_ch1_responses_org_id ON hrd_ch1_responses(organization_id);
CREATE INDEX IF NOT EXISTS idx_form_windows_org_id ON form_windows(organization_id);
