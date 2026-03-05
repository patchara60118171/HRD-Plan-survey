// Type definitions for Well-being Survey v3.1
// ไฟล์นี้กำหนด Type สำหรับระบบแบบสอบถาม

declare namespace WellBeingSurvey {
  // ============================================
  // Core Types
  // ============================================
  
  interface UserInfo {
    email: string;
    organization?: string;
    submitted_at?: string;
  }

  interface FormData {
    // Section 1: ข้อมูลเบื้องต้น
    agency_name?: string;
    strategic_overview?: string;
    org_structure?: string;
    total_personnel?: number;
    age_distribution?: AgeDistribution;
    service_years_distribution?: ServiceYearsDistribution;
    position_types?: PositionType[];
    turnover_rate?: number;
    
    // Section 2: นโยบายและบริบท
    related_policies?: string;
    external_context?: string;
    
    // Section 3: ข้อมูลสุขภาวะ
    ncd_data?: NCDData;
    sick_leave_data?: SickLeaveData[];
    clinic_data?: ClinicData;
    mental_health_data?: MentalHealthData;
    engagement_data?: EngagementData[];
    other_surveys?: string;
    
    // Section 4: ระบบการบริหาร
    support_systems?: SupportSystem[];
    training_hours?: number;
    digital_systems?: string;
    ergonomics?: string;
    wellbeing_analysis?: string;
    
    // Section 5: ทิศทางและเป้าหมาย
    development_priorities?: string[];
    intervention_suggestions?: string;
    hrd_plan_file?: string;
    
    // Metadata
    respondent_email: string;
    submitted_at?: string;
    created_at?: string;
    updated_at?: string;
  }

  // ============================================
  // Section-specific Types
  // ============================================
  
  interface AgeDistribution {
    under_30: number;
    age_30_40: number;
    age_40_50: number;
    over_50: number;
  }

  interface ServiceYearsDistribution {
    under_5: number;
    years_5_10: number;
    years_10_15: number;
    years_15_20: number;
    years_20_25: number;
    years_25_30: number;
    years_30_35: number;
    over_35: number;
  }

  interface PositionType {
    level: string;
    count: number;
  }

  interface NCDData {
    diabetes: number;
    hypertension: number;
    heart_disease: number;
    cancer: number;
    kidney_disease: number;
    respiratory: number;
    other: number;
  }

  interface SickLeaveData {
    year: number;
    days: number;
    percentage: number;
  }

  interface ClinicData {
    has_clinic: boolean;
    services?: string;
    utilization_rate?: number;
  }

  interface MentalHealthData {
    stress: number;
    anxiety: number;
    depression: number;
    burnout: number;
    other: number;
  }

  interface EngagementData {
    year: number;
    score: number;
    level: 'high' | 'medium' | 'low';
  }

  interface SupportSystem {
    id: string;
    name: string;
    status: 'full' | 'partial' | 'none';
  }

  // ============================================
  // Component Types
  // ============================================
  
  interface ValidationError {
    field: string;
    message: string;
    type: 'required' | 'format' | 'range' | 'custom';
  }

  interface ToastOptions {
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    position?: 'top' | 'bottom' | 'center';
  }

  interface RateLimitInfo {
    allowed: boolean;
    reason?: string;
    remainingAttempts?: number;
    resetTime?: number;
  }

  // ============================================
  // Supabase Types
  // ============================================
  
  interface SupabaseResponse<T> {
    data: T | null;
    error: SupabaseError | null;
  }

  interface SupabaseError {
    message: string;
    code: string;
    details?: string;
    hint?: string;
  }

  // ============================================
  // Analytics Types
  // ============================================
  
  interface AnalyticsEvent {
    eventName: string;
    parameters?: Record<string, string | number | boolean>;
    timestamp?: number;
  }

  interface WebVitalsMetric {
    name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta?: number;
    entries?: PerformanceEntry[];
  }

  // ============================================
  // Service Worker Types
  // ============================================
  
  interface CacheStrategy {
    cacheName: string;
    maxEntries?: number;
    maxAge?: number;
  }

  interface OfflineData {
    formData: FormData;
    currentStep: number;
    timestamp: number;
    synced: boolean;
  }
}

// Global type augmentations
declare global {
  interface Window {
    supabase: any;
    ch1Sb: any;
    rateLimiter: any;
    loadingManager: any;
  }
}

export {};
