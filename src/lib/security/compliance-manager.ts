/**
 * Compliance Manager - Compliance kezelő
 * GDPR compliance, adatmegőrzési politikák és adatvédelmi funkciók
 */

import { createClient } from '@supabase/supabase-js';

export interface DataRetentionPolicy {
  id: string;
  name: string;
  data_type: string;
  retention_period: number; // napokban
  retention_unit: 'days' | 'months' | 'years';
  deletion_strategy: 'soft' | 'hard' | 'anonymize';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DataSubjectRequest {
  id: string;
  user_id: string;
  request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  description: string;
  requested_data_types: string[];
  created_at: Date;
  completed_at?: Date;
  response_data?: any;
  rejection_reason?: string;
}

export interface PrivacyConsent {
  id: string;
  user_id: string;
  consent_type: 'marketing' | 'analytics' | 'necessary' | 'third_party';
  granted: boolean;
  granted_at: Date;
  revoked_at?: Date;
  ip_address: string;
  user_agent: string;
  consent_version: string;
}

export interface DataProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  legal_basis: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation' | 'vital_interest' | 'public_interest';
  data_categories: string[];
  recipients: string[];
  retention_period: number;
  data_transfers: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ComplianceConfig {
  gdpr_enabled: boolean;
  default_retention_period: number;
  consent_required: boolean;
  data_export_enabled: boolean;
  data_deletion_enabled: boolean;
  privacy_policy_version: string;
  cookie_policy_version: string;
  terms_of_service_version: string;
}

class ComplianceManager {
  private static instance: ComplianceManager;
  private supabase: any;
  private config: ComplianceConfig;

  private constructor() {
    // Teszt környezetben mock client, production-ben valós Supabase client
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      this.supabase = null as any; // Mock client teszt környezetben
    } else {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    
    this.config = {
      gdpr_enabled: true,
      default_retention_period: 2555, // 7 év
      consent_required: true,
      data_export_enabled: true,
      data_deletion_enabled: true,
      privacy_policy_version: '1.0.0',
      cookie_policy_version: '1.0.0',
      terms_of_service_version: '1.0.0'
    };
  }

  public static getInstance(): ComplianceManager {
    if (!ComplianceManager.instance) {
      ComplianceManager.instance = new ComplianceManager();
    }
    return ComplianceManager.instance;
  }

  /**
   * Adatmegőrzési politika létrehozása
   */
  async createRetentionPolicy(policy: Omit<DataRetentionPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<DataRetentionPolicy> {
    try {
      const retentionPolicy: DataRetentionPolicy = {
        ...policy,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date()
      };

      const { error } = await this.supabase
        .from('data_retention_policies')
        .insert({
          id: retentionPolicy.id,
          name: retentionPolicy.name,
          data_type: retentionPolicy.data_type,
          retention_period: retentionPolicy.retention_period,
          retention_unit: retentionPolicy.retention_unit,
          deletion_strategy: retentionPolicy.deletion_strategy,
          is_active: retentionPolicy.is_active,
          created_at: retentionPolicy.created_at.toISOString(),
          updated_at: retentionPolicy.updated_at.toISOString()
        });

      if (error) {
        throw error;
      }

      return retentionPolicy;
    } catch (error) {
      console.error('Retention policy creation error:', error);
      throw new Error('Adatmegőrzési politika létrehozás sikertelen');
    }
  }

  /**
   * Adatmegőrzési politikák lekérése
   */
  async getRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    try {
      const { data, error } = await this.supabase
        .from('data_retention_policies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data ? data.map(policy => ({
        ...policy,
        created_at: new Date(policy.created_at),
        updated_at: new Date(policy.updated_at)
      })) : [];
    } catch (error) {
      console.error('Retention policies retrieval error:', error);
      return [];
    }
  }

  /**
   * Adatmegőrzési politika frissítése
   */
  async updateRetentionPolicy(policyId: string, updates: Partial<DataRetentionPolicy>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('data_retention_policies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Retention policy update error:', error);
      throw new Error('Adatmegőrzési politika frissítés sikertelen');
    }
  }

  /**
   * Adatmegőrzési politika törlése
   */
  async deleteRetentionPolicy(policyId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('data_retention_policies')
        .delete()
        .eq('id', policyId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Retention policy deletion error:', error);
      throw new Error('Adatmegőrzési politika törlés sikertelen');
    }
  }

  /**
   * Adatigénylés létrehozása
   */
  async createDataSubjectRequest(request: Omit<DataSubjectRequest, 'id' | 'created_at'>): Promise<DataSubjectRequest> {
    try {
      const dataSubjectRequest: DataSubjectRequest = {
        ...request,
        id: crypto.randomUUID(),
        created_at: new Date()
      };

      const { error } = await this.supabase
        .from('data_subject_requests')
        .insert({
          id: dataSubjectRequest.id,
          user_id: dataSubjectRequest.user_id,
          request_type: dataSubjectRequest.request_type,
          status: dataSubjectRequest.status,
          description: dataSubjectRequest.description,
          requested_data_types: dataSubjectRequest.requested_data_types,
          created_at: dataSubjectRequest.created_at.toISOString()
        });

      if (error) {
        throw error;
      }

      return dataSubjectRequest;
    } catch (error) {
      console.error('Data subject request creation error:', error);
      throw new Error('Adatigénylés létrehozás sikertelen');
    }
  }

  /**
   * Felhasználó adatigényléseinek lekérése
   */
  async getUserDataSubjectRequests(userId: string): Promise<DataSubjectRequest[]> {
    try {
      const { data, error } = await this.supabase
        .from('data_subject_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data ? data.map(request => ({
        ...request,
        created_at: new Date(request.created_at),
        completed_at: request.completed_at ? new Date(request.completed_at) : undefined
      })) : [];
    } catch (error) {
      console.error('User data subject requests retrieval error:', error);
      return [];
    }
  }

  /**
   * Adatigénylés frissítése
   */
  async updateDataSubjectRequest(requestId: string, updates: Partial<DataSubjectRequest>): Promise<void> {
    try {
      const updateData: any = { ...updates };
      if (updates.completed_at) {
        updateData.completed_at = updates.completed_at.toISOString();
      }

      const { error } = await this.supabase
        .from('data_subject_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Data subject request update error:', error);
      throw new Error('Adatigénylés frissítés sikertelen');
    }
  }

  /**
   * Adatexport generálása
   */
  async generateDataExport(userId: string, dataTypes: string[] = []): Promise<any> {
    try {
      const exportData: any = {
        user_info: {},
        personal_data: {},
        activity_data: {},
        consent_data: {},
        export_metadata: {
          export_date: new Date().toISOString(),
          data_types: dataTypes,
          format: 'json'
        }
      };

      // Felhasználói információk
      const { data: userData } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userData) {
        exportData.user_info = {
          id: userData.id,
          email: userData.email,
          created_at: userData.created_at,
          last_sign_in: userData.last_sign_in
        };
      }

      // Személyes adatok
      if (dataTypes.includes('personal_data') || dataTypes.length === 0) {
        const { data: profileData } = await this.supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId);

        if (profileData) {
          exportData.personal_data = profileData;
        }
      }

      // Tevékenységi adatok
      if (dataTypes.includes('activity_data') || dataTypes.length === 0) {
        const { data: activityData } = await this.supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', userId);

        if (activityData) {
          exportData.activity_data = activityData;
        }
      }

      // Hozzájárulási adatok
      if (dataTypes.includes('consent_data') || dataTypes.length === 0) {
        const { data: consentData } = await this.supabase
          .from('privacy_consents')
          .select('*')
          .eq('user_id', userId);

        if (consentData) {
          exportData.consent_data = consentData;
        }
      }

      return exportData;
    } catch (error) {
      console.error('Data export generation error:', error);
      throw new Error('Adatexport generálás sikertelen');
    }
  }

  /**
   * Adatok törlése (jog az elfeledéshez)
   */
  async deleteUserData(userId: string, dataTypes: string[] = []): Promise<void> {
    try {
      // Adatok törlése típusonként
      if (dataTypes.includes('personal_data') || dataTypes.length === 0) {
        await this.supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', userId);
      }

      if (dataTypes.includes('activity_data') || dataTypes.length === 0) {
        await this.supabase
          .from('user_activities')
          .delete()
          .eq('user_id', userId);
      }

      if (dataTypes.includes('consent_data') || dataTypes.length === 0) {
        await this.supabase
          .from('privacy_consents')
          .delete()
          .eq('user_id', userId);
      }

      if (dataTypes.includes('api_keys') || dataTypes.length === 0) {
        await this.supabase
          .from('api_keys')
          .delete()
          .eq('user_id', userId);
      }

      // Felhasználói fiók törlése (ha minden adat törlésre kerül)
      if (dataTypes.length === 0) {
        await this.supabase
          .from('users')
          .delete()
          .eq('id', userId);
      }
    } catch (error) {
      console.error('User data deletion error:', error);
      throw new Error('Felhasználói adatok törlése sikertelen');
    }
  }

  /**
   * Hozzájárulás kezelése
   */
  async manageConsent(consent: Omit<PrivacyConsent, 'id'>): Promise<PrivacyConsent> {
    try {
      const privacyConsent: PrivacyConsent = {
        ...consent,
        id: crypto.randomUUID()
      };

      const { error } = await this.supabase
        .from('privacy_consents')
        .insert({
          id: privacyConsent.id,
          user_id: privacyConsent.user_id,
          consent_type: privacyConsent.consent_type,
          granted: privacyConsent.granted,
          granted_at: privacyConsent.granted_at.toISOString(),
          revoked_at: privacyConsent.revoked_at?.toISOString(),
          ip_address: privacyConsent.ip_address,
          user_agent: privacyConsent.user_agent,
          consent_version: privacyConsent.consent_version
        });

      if (error) {
        throw error;
      }

      return privacyConsent;
    } catch (error) {
      console.error('Consent management error:', error);
      throw new Error('Hozzájárulás kezelés sikertelen');
    }
  }

  /**
   * Felhasználó hozzájárulásainak lekérése
   */
  async getUserConsents(userId: string): Promise<PrivacyConsent[]> {
    try {
      const { data, error } = await this.supabase
        .from('privacy_consents')
        .select('*')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data ? data.map(consent => ({
        ...consent,
        granted_at: new Date(consent.granted_at),
        revoked_at: consent.revoked_at ? new Date(consent.revoked_at) : undefined
      })) : [];
    } catch (error) {
      console.error('User consents retrieval error:', error);
      return [];
    }
  }

  /**
   * Adatfeldolgozási tevékenység létrehozása
   */
  async createDataProcessingActivity(activity: Omit<DataProcessingActivity, 'id' | 'created_at' | 'updated_at'>): Promise<DataProcessingActivity> {
    try {
      const dataProcessingActivity: DataProcessingActivity = {
        ...activity,
        id: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date()
      };

      const { error } = await this.supabase
        .from('data_processing_activities')
        .insert({
          id: dataProcessingActivity.id,
          name: dataProcessingActivity.name,
          purpose: dataProcessingActivity.purpose,
          legal_basis: dataProcessingActivity.legal_basis,
          data_categories: dataProcessingActivity.data_categories,
          recipients: dataProcessingActivity.recipients,
          retention_period: dataProcessingActivity.retention_period,
          data_transfers: dataProcessingActivity.data_transfers,
          is_active: dataProcessingActivity.is_active,
          created_at: dataProcessingActivity.created_at.toISOString(),
          updated_at: dataProcessingActivity.updated_at.toISOString()
        });

      if (error) {
        throw error;
      }

      return dataProcessingActivity;
    } catch (error) {
      console.error('Data processing activity creation error:', error);
      throw new Error('Adatfeldolgozási tevékenység létrehozás sikertelen');
    }
  }

  /**
   * Adatfeldolgozási tevékenységek lekérése
   */
  async getDataProcessingActivities(): Promise<DataProcessingActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('data_processing_activities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data ? data.map(activity => ({
        ...activity,
        created_at: new Date(activity.created_at),
        updated_at: new Date(activity.updated_at)
      })) : [];
    } catch (error) {
      console.error('Data processing activities retrieval error:', error);
      return [];
    }
  }

  /**
   * Lejárt adatok tisztítása
   */
  async cleanupExpiredData(): Promise<{ deleted_count: number; errors: string[] }> {
    try {
      const policies = await this.getRetentionPolicies();
      let deletedCount = 0;
      const errors: string[] = [];

      for (const policy of policies) {
        try {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - policy.retention_period);

          // Adatok törlése a politikának megfelelően
          const { error } = await this.supabase
            .from(policy.data_type)
            .delete()
            .lt('created_at', cutoffDate.toISOString());

          if (error) {
            errors.push(`Error cleaning up ${policy.data_type}: ${error.message}`);
          } else {
            deletedCount++;
          }
        } catch (error) {
          errors.push(`Error processing policy ${policy.name}: ${error}`);
        }
      }

      return { deleted_count: deletedCount, errors };
    } catch (error) {
      console.error('Data cleanup error:', error);
      throw new Error('Lejárt adatok tisztítása sikertelen');
    }
  }

  /**
   * Compliance jelentés generálása
   */
  async generateComplianceReport(): Promise<any> {
    try {
      const report = {
        generated_at: new Date().toISOString(),
        gdpr_compliance: {
          data_retention_policies: await this.getRetentionPolicies(),
          data_processing_activities: await this.getDataProcessingActivities(),
          active_consents: 0,
          pending_requests: 0
        },
        data_protection: {
          encryption_enabled: true,
          access_controls: true,
          audit_logging: true
        },
        recommendations: []
      };

      // Hozzájárulások számolása
      const { count: consentsCount } = await this.supabase
        .from('privacy_consents')
        .select('*', { count: 'exact', head: true })
        .eq('granted', true);

      report.gdpr_compliance.active_consents = consentsCount || 0;

      // Függő kérések számolása
      const { count: requestsCount } = await this.supabase
        .from('data_subject_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      report.gdpr_compliance.pending_requests = requestsCount || 0;

      return report;
    } catch (error) {
      console.error('Compliance report generation error:', error);
      throw new Error('Compliance jelentés generálás sikertelen');
    }
  }

  /**
   * Konfiguráció frissítése
   */
  updateConfig(newConfig: Partial<ComplianceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Jelenlegi konfiguráció lekérése
   */
  getConfig(): ComplianceConfig {
    return { ...this.config };
  }
}

export const complianceManager = ComplianceManager.getInstance();
export default complianceManager;
