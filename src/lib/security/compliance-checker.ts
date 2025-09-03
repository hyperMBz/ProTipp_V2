import { createClient } from '@supabase/supabase-js';

// Compliance configuration
const COMPLIANCE_CONFIG = {
  gdpr: {
    dataRetentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000, // 7 év
    consentRequired: true,
    rightToBeForgotten: true,
    dataPortability: true,
    breachNotificationPeriod: 72 * 60 * 60 * 1000, // 72 óra
  },
  financial: {
    transactionLogging: true,
    auditTrail: true,
    riskAssessment: true,
    kycRequired: true,
    amlCompliance: true,
  },
  dataProtection: {
    encryptionRequired: true,
    accessLogging: true,
    backupRetention: 10 * 365 * 24 * 60 * 60 * 1000, // 10 év
    dataClassification: true,
  },
} as const;

// GDPR compliance interface
interface GDPRCompliance {
  consent_given: boolean;
  consent_date?: Date;
  consent_version: string;
  data_processing_purposes: string[];
  data_retention_period: number;
  right_to_be_forgotten: boolean;
  data_portability: boolean;
  breach_notification: boolean;
}

// Financial compliance interface
interface FinancialCompliance {
  kyc_completed: boolean;
  kyc_date?: Date;
  kyc_level: 'basic' | 'enhanced' | 'full';
  aml_check: boolean;
  aml_date?: Date;
  risk_assessment: boolean;
  risk_level: 'low' | 'medium' | 'high';
  transaction_monitoring: boolean;
  audit_trail: boolean;
}

// Data protection interface
interface DataProtection {
  encryption_enabled: boolean;
  access_logging: boolean;
  backup_enabled: boolean;
  data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
  retention_policy: string;
  access_controls: string[];
}

// Compliance status interface
interface ComplianceStatus {
  gdpr: GDPRCompliance;
  financial: FinancialCompliance;
  data_protection: DataProtection;
  overall_compliance: 'compliant' | 'non_compliant' | 'partial';
  last_audit: Date;
  next_audit: Date;
  compliance_score: number; // 0-100
}

// Compliance audit interface
interface ComplianceAudit {
  id: string;
  user_id?: string;
  audit_type: 'gdpr' | 'financial' | 'data_protection' | 'overall';
  status: 'pass' | 'fail' | 'warning';
  findings: string[];
  recommendations: string[];
  audit_date: Date;
  auditor: string;
  score: number;
}

// Data breach interface
interface DataBreach {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_users: number;
  data_types: string[];
  discovery_date: Date;
  notification_date?: Date;
  resolution_date?: Date;
  status: 'discovered' | 'investigating' | 'notified' | 'resolved';
}

/**
 * Compliance Checker Service
 * GDPR és financial compliance kezelése
 */
export class ComplianceChecker {
  private static instance: ComplianceChecker;
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  private complianceAudits: ComplianceAudit[] = [];
  private dataBreaches: DataBreach[] = [];

  private constructor() {
    this.initializeCompliance();
  }

  public static getInstance(): ComplianceChecker {
    if (!ComplianceChecker.instance) {
      ComplianceChecker.instance = new ComplianceChecker();
    }
    return ComplianceChecker.instance;
  }

  /**
   * Compliance inicializálása
   */
  private async initializeCompliance(): Promise<void> {
    try {
      // Compliance audits betöltése
      await this.loadComplianceAudits();
      
      // Data breaches betöltése
      await this.loadDataBreaches();
      
      // Compliance monitoring timer
      setInterval(() => {
        this.runComplianceChecks();
      }, 24 * 60 * 60 * 1000); // 24 óránként

      console.log('Compliance checker initialized successfully');
    } catch (error) {
      console.error('Compliance initialization error:', error);
      throw new Error('Compliance checker initialization failed');
    }
  }

  /**
   * Compliance audits betöltése
   */
  private async loadComplianceAudits(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('compliance_audits')
        .select('*')
        .order('audit_date', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Compliance audits load error:', error);
        return;
      }

      data?.forEach(audit => {
        this.complianceAudits.push({
          ...audit,
          audit_date: new Date(audit.audit_date),
        });
      });
    } catch (error) {
      console.error('Compliance audits load error:', error);
    }
  }

  /**
   * Data breaches betöltése
   */
  private async loadDataBreaches(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('data_breaches')
        .select('*')
        .order('discovery_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Data breaches load error:', error);
        return;
      }

      data?.forEach(breach => {
        this.dataBreaches.push({
          ...breach,
          discovery_date: new Date(breach.discovery_date),
          notification_date: breach.notification_date ? new Date(breach.notification_date) : undefined,
          resolution_date: breach.resolution_date ? new Date(breach.resolution_date) : undefined,
        });
      });
    } catch (error) {
      console.error('Data breaches load error:', error);
    }
  }

  /**
   * GDPR compliance ellenőrzése
   */
  async checkGDPRCompliance(userId: string): Promise<{
    compliant: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const gdprStatus = await this.getGDPRStatus(userId);
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // Consent ellenőrzése
      if (!gdprStatus.consent_given) {
        issues.push('Felhasználói hozzájárulás hiányzik');
        recommendations.push('Kérje meg a felhasználót, hogy adja meg a hozzájárulását');
        score -= 30;
      }

      // Consent dátum ellenőrzése
      if (gdprStatus.consent_date) {
        const consentAge = Date.now() - gdprStatus.consent_date.getTime();
        if (consentAge > COMPLIANCE_CONFIG.gdpr.dataRetentionPeriod) {
          issues.push('A hozzájárulás lejárt');
          recommendations.push('Új hozzájárulás kérése szükséges');
          score -= 20;
        }
      }

      // Data retention ellenőrzése
      if (gdprStatus.data_retention_period > COMPLIANCE_CONFIG.gdpr.dataRetentionPeriod) {
        issues.push('Adatmegőrzési időszak túl hosszú');
        recommendations.push('Adatmegőrzési időszak csökkentése szükséges');
        score -= 15;
      }

      // Right to be forgotten ellenőrzése
      if (!gdprStatus.right_to_be_forgotten) {
        issues.push('"Elfelejtéshez való jog" nincs implementálva');
        recommendations.push('Implementálja a felhasználói adatok törlési funkciót');
        score -= 15;
      }

      // Data portability ellenőrzése
      if (!gdprStatus.data_portability) {
        issues.push('Adatportabilitás nincs implementálva');
        recommendations.push('Implementálja az adatexportálási funkciót');
        score -= 10;
      }

      // Breach notification ellenőrzése
      if (!gdprStatus.breach_notification) {
        issues.push('Adatsértési értesítés nincs implementálva');
        recommendations.push('Implementálja az adatsértési értesítési rendszert');
        score -= 10;
      }

      return {
        compliant: score >= 80,
        score: Math.max(0, score),
        issues,
        recommendations,
      };
    } catch (error) {
      console.error('GDPR compliance check error:', error);
      return {
        compliant: false,
        score: 0,
        issues: ['GDPR compliance ellenőrzési hiba'],
        recommendations: ['Tekintse át a compliance rendszert'],
      };
    }
  }

  /**
   * Financial compliance ellenőrzése
   */
  async checkFinancialCompliance(userId: string): Promise<{
    compliant: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const financialStatus = await this.getFinancialStatus(userId);
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // KYC ellenőrzése
      if (!financialStatus.kyc_completed) {
        issues.push('KYC (Know Your Customer) nincs teljesítve');
        recommendations.push('Kérje meg a felhasználót, hogy teljesítse a KYC folyamatot');
        score -= 25;
      }

      // AML ellenőrzése
      if (!financialStatus.aml_check) {
        issues.push('AML (Anti-Money Laundering) ellenőrzés nincs teljesítve');
        recommendations.push('Végezze el az AML ellenőrzést');
        score -= 20;
      }

      // Risk assessment ellenőrzése
      if (!financialStatus.risk_assessment) {
        issues.push('Kockázatértékelés nincs elvégezve');
        recommendations.push('Végezze el a kockázatértékelést');
        score -= 15;
      }

      // Transaction monitoring ellenőrzése
      if (!financialStatus.transaction_monitoring) {
        issues.push('Tranzakciómonitoring nincs aktiválva');
        recommendations.push('Aktiválja a tranzakciómonitoring rendszert');
        score -= 20;
      }

      // Audit trail ellenőrzése
      if (!financialStatus.audit_trail) {
        issues.push('Audit trail nincs implementálva');
        recommendations.push('Implementálja az audit trail rendszert');
        score -= 20;
      }

      return {
        compliant: score >= 80,
        score: Math.max(0, score),
        issues,
        recommendations,
      };
    } catch (error) {
      console.error('Financial compliance check error:', error);
      return {
        compliant: false,
        score: 0,
        issues: ['Financial compliance ellenőrzési hiba'],
        recommendations: ['Tekintse át a financial compliance rendszert'],
      };
    }
  }

  /**
   * Data protection compliance ellenőrzése
   */
  async checkDataProtectionCompliance(userId: string): Promise<{
    compliant: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const dataProtectionStatus = await this.getDataProtectionStatus(userId);
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // Encryption ellenőrzése
      if (!dataProtectionStatus.encryption_enabled) {
        issues.push('Adattitkosítás nincs aktiválva');
        recommendations.push('Aktiválja az adattitkosítást');
        score -= 30;
      }

      // Access logging ellenőrzése
      if (!dataProtectionStatus.access_logging) {
        issues.push('Hozzáférési naplózás nincs aktiválva');
        recommendations.push('Aktiválja a hozzáférési naplózást');
        score -= 20;
      }

      // Backup ellenőrzése
      if (!dataProtectionStatus.backup_enabled) {
        issues.push('Adatmentés nincs aktiválva');
        recommendations.push('Aktiválja az adatmentési rendszert');
        score -= 20;
      }

      // Data classification ellenőrzése
      if (dataProtectionStatus.data_classification === 'public') {
        issues.push('Adatok nincsenek megfelelően besorolva');
        recommendations.push('Implementálja az adatbesorolási rendszert');
        score -= 15;
      }

      // Access controls ellenőrzése
      if (dataProtectionStatus.access_controls.length === 0) {
        issues.push('Hozzáférési kontrollok nincsenek beállítva');
        recommendations.push('Állítsa be a hozzáférési kontrollokat');
        score -= 15;
      }

      return {
        compliant: score >= 80,
        score: Math.max(0, score),
        issues,
        recommendations,
      };
    } catch (error) {
      console.error('Data protection compliance check error:', error);
      return {
        compliant: false,
        score: 0,
        issues: ['Data protection compliance ellenőrzési hiba'],
        recommendations: ['Tekintse át a data protection rendszert'],
      };
    }
  }

  /**
   * Teljes compliance ellenőrzése
   */
  async checkOverallCompliance(userId: string): Promise<ComplianceStatus> {
    try {
      const gdprCheck = await this.checkGDPRCompliance(userId);
      const financialCheck = await this.checkFinancialCompliance(userId);
      const dataProtectionCheck = await this.checkDataProtectionCompliance(userId);

      const overallScore = Math.round(
        (gdprCheck.score + financialCheck.score + dataProtectionCheck.score) / 3
      );

      let overallCompliance: 'compliant' | 'non_compliant' | 'partial';
      if (overallScore >= 90) {
        overallCompliance = 'compliant';
      } else if (overallScore >= 70) {
        overallCompliance = 'partial';
      } else {
        overallCompliance = 'non_compliant';
      }

      const complianceStatus: ComplianceStatus = {
        gdpr: await this.getGDPRStatus(userId),
        financial: await this.getFinancialStatus(userId),
        data_protection: await this.getDataProtectionStatus(userId),
        overall_compliance: overallCompliance,
        last_audit: new Date(),
        next_audit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 nap múlva
        compliance_score: overallScore,
      };

      // Compliance status mentése
      await this.saveComplianceStatus(userId, complianceStatus);

      return complianceStatus;
    } catch (error) {
      console.error('Overall compliance check error:', error);
      throw new Error('Compliance ellenőrzési hiba');
    }
  }

  /**
   * GDPR status lekérése
   */
  private async getGDPRStatus(userId: string): Promise<GDPRCompliance> {
    try {
      const { data, error } = await this.supabase
        .from('gdpr_compliance')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Default GDPR status
        return {
          consent_given: false,
          consent_version: '1.0',
          data_processing_purposes: ['betting_analysis', 'user_experience'],
          data_retention_period: COMPLIANCE_CONFIG.gdpr.dataRetentionPeriod,
          right_to_be_forgotten: false,
          data_portability: false,
          breach_notification: false,
        };
      }

      return {
        ...data,
        consent_date: data.consent_date ? new Date(data.consent_date) : undefined,
      };
    } catch (error) {
      console.error('GDPR status fetch error:', error);
      throw error;
    }
  }

  /**
   * Financial status lekérése
   */
  private async getFinancialStatus(userId: string): Promise<FinancialCompliance> {
    try {
      const { data, error } = await this.supabase
        .from('financial_compliance')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Default financial status
        return {
          kyc_completed: false,
          kyc_level: 'basic',
          aml_check: false,
          risk_assessment: false,
          risk_level: 'medium',
          transaction_monitoring: false,
          audit_trail: false,
        };
      }

      return {
        ...data,
        kyc_date: data.kyc_date ? new Date(data.kyc_date) : undefined,
        aml_date: data.aml_date ? new Date(data.aml_date) : undefined,
      };
    } catch (error) {
      console.error('Financial status fetch error:', error);
      throw error;
    }
  }

  /**
   * Data protection status lekérése
   */
  private async getDataProtectionStatus(userId: string): Promise<DataProtection> {
    try {
      const { data, error } = await this.supabase
        .from('data_protection')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Default data protection status
        return {
          encryption_enabled: false,
          access_logging: false,
          backup_enabled: false,
          data_classification: 'public',
          retention_policy: 'standard',
          access_controls: [],
        };
      }

      return data;
    } catch (error) {
      console.error('Data protection status fetch error:', error);
      throw error;
    }
  }

  /**
   * Compliance status mentése
   */
  private async saveComplianceStatus(userId: string, status: ComplianceStatus): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('compliance_status')
        .upsert({
          user_id: userId,
          gdpr: status.gdpr,
          financial: status.financial,
          data_protection: status.data_protection,
          overall_compliance: status.overall_compliance,
          last_audit: status.last_audit.toISOString(),
          next_audit: status.next_audit.toISOString(),
          compliance_score: status.compliance_score,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Compliance status save error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Compliance status save error:', error);
      throw error;
    }
  }

  /**
   * Data breach jelentése
   */
  async reportDataBreach(breach: Omit<DataBreach, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      const breachId = this.generateBreachId();
      const newBreach: DataBreach = {
        ...breach,
        id: breachId,
      };

      // Data breach mentése
      await this.saveDataBreach(newBreach);
      
      // Data breach hozzáadása a memóriához
      this.dataBreaches.push(newBreach);

      // Notification küldése ha kritikus
      if (breach.severity === 'critical' || breach.severity === 'high') {
        await this.sendBreachNotification(newBreach);
      }

      return { success: true };
    } catch (error) {
      console.error('Data breach report error:', error);
      return { success: false, error: 'Data breach jelentési hiba' };
    }
  }

  /**
   * Data breach mentése
   */
  private async saveDataBreach(breach: DataBreach): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('data_breaches')
        .insert({
          id: breach.id,
          description: breach.description,
          severity: breach.severity,
          affected_users: breach.affected_users,
          data_types: breach.data_types,
          discovery_date: breach.discovery_date.toISOString(),
          notification_date: breach.notification_date?.toISOString(),
          resolution_date: breach.resolution_date?.toISOString(),
          status: breach.status,
        });

      if (error) {
        console.error('Data breach save error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Data breach save error:', error);
      throw error;
    }
  }

  /**
   * Breach notification küldése
   */
  private async sendBreachNotification(breach: DataBreach): Promise<void> {
    try {
      // Itt implementálnánk a notification küldést
      console.log('Sending breach notification:', breach);
      
      // GDPR breach notification (72 órán belül)
      if (breach.severity === 'critical' || breach.severity === 'high') {
        await this.notifyGDPRAuthority(breach);
      }
    } catch (error) {
      console.error('Breach notification error:', error);
    }
  }

  /**
   * GDPR hatóság értesítése
   */
  private async notifyGDPRAuthority(breach: DataBreach): Promise<void> {
    try {
      // Itt implementálnánk a GDPR hatóság értesítését
      console.log('Notifying GDPR authority about breach:', breach.id);
    } catch (error) {
      console.error('GDPR authority notification error:', error);
    }
  }

  /**
   * Compliance audit létrehozása
   */
  async createComplianceAudit(audit: Omit<ComplianceAudit, 'id' | 'audit_date'>): Promise<{ success: boolean; error?: string }> {
    try {
      const auditId = this.generateAuditId();
      const newAudit: ComplianceAudit = {
        ...audit,
        id: auditId,
        audit_date: new Date(),
      };

      // Audit mentése
      await this.saveComplianceAudit(newAudit);
      
      // Audit hozzáadása a memóriához
      this.complianceAudits.push(newAudit);

      return { success: true };
    } catch (error) {
      console.error('Compliance audit creation error:', error);
      return { success: false, error: 'Compliance audit létrehozási hiba' };
    }
  }

  /**
   * Compliance audit mentése
   */
  private async saveComplianceAudit(audit: ComplianceAudit): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('compliance_audits')
        .insert({
          id: audit.id,
          user_id: audit.user_id,
          audit_type: audit.audit_type,
          status: audit.status,
          findings: audit.findings,
          recommendations: audit.recommendations,
          audit_date: audit.audit_date.toISOString(),
          auditor: audit.auditor,
          score: audit.score,
        });

      if (error) {
        console.error('Compliance audit save error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Compliance audit save error:', error);
      throw error;
    }
  }

  /**
   * Compliance checks futtatása
   */
  private async runComplianceChecks(): Promise<void> {
    try {
      // Itt futtatnánk a rendszeres compliance ellenőrzéseket
      console.log('Running scheduled compliance checks...');
      
      // Példa: összes felhasználó compliance ellenőrzése
      // Valós implementációban batch feldolgozás
    } catch (error) {
      console.error('Compliance checks error:', error);
    }
  }

  /**
   * Utility függvények
   */
  private generateBreachId(): string {
    return `breach_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Compliance status lekérése
   */
  getComplianceStatus(): {
    totalAudits: number;
    totalBreaches: number;
    activeBreaches: number;
    averageScore: number;
  } {
    const activeBreaches = this.dataBreaches.filter(b => b.status !== 'resolved').length;
    const averageScore = this.complianceAudits.length > 0 
      ? this.complianceAudits.reduce((sum, audit) => sum + audit.score, 0) / this.complianceAudits.length
      : 0;

    return {
      totalAudits: this.complianceAudits.length,
      totalBreaches: this.dataBreaches.length,
      activeBreaches,
      averageScore: Math.round(averageScore),
    };
  }

  /**
   * Compliance config lekérése
   */
  getComplianceConfig(): typeof COMPLIANCE_CONFIG {
    return COMPLIANCE_CONFIG;
  }
}

// Singleton export
export const complianceChecker = ComplianceChecker.getInstance();
