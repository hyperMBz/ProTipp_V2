import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/lib/security/auth-manager';
import { apiSecurityManager } from '@/lib/security/api-security';
import { encryptionService } from '@/lib/security/encryption-service';

/**
 * GET /api/v1/security
 * Get security status, violations, or configuration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('user_id');

    switch (type) {
      case 'config': {
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'user_id is required for config' },
            { status: 400 }
          );
        }

        const config = await authManager.getSecurityConfig(userId);
        return NextResponse.json({
          success: true,
          data: config,
        });
      }

      case 'violations': {
        const limit = parseInt(searchParams.get('limit') || '100');
        const severity = searchParams.get('severity');
        const resolved = searchParams.get('resolved');

        const filters: any = { limit };
        if (severity) filters.severity = severity;
        if (resolved !== null) filters.resolved = resolved === 'true';

        const violations = apiSecurityManager.getViolations(filters);
        return NextResponse.json({
          success: true,
          data: violations,
        });
      }

      case 'metrics': {
        const metrics = apiSecurityManager.getSecurityMetrics();
        return NextResponse.json({
          success: true,
          data: metrics,
        });
      }

      case 'sessions': {
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'user_id is required for sessions' },
            { status: 400 }
          );
        }

        const sessions = authManager.getUserSessions(userId);
        return NextResponse.json({
          success: true,
          data: sessions,
        });
      }

      case 'api-keys': {
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'user_id is required for api-keys' },
            { status: 400 }
          );
        }

        const config = await authManager.getSecurityConfig(userId);
        return NextResponse.json({
          success: true,
          data: config?.api_keys || [],
        });
      }

      default: {
        // Return comprehensive security status
        const [metrics, violations] = await Promise.all([
          apiSecurityManager.getSecurityMetrics(),
          apiSecurityManager.getViolations({ limit: 10 }),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            metrics,
            recent_violations: violations,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

  } catch (error) {
    console.error('[Security API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/security
 * Security operations: MFA setup, API key generation, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, user_id, ...data } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'setup_mfa': {
        const { method = 'totp' } = data;
        
        const mfaSetup = await authManager.setupMFA(user_id, method);
        return NextResponse.json({
          success: true,
          data: mfaSetup,
        });
      }

      case 'enable_mfa': {
        const { verification_code, method = 'totp' } = data;
        
        if (!verification_code) {
          return NextResponse.json(
            { success: false, error: 'verification_code is required' },
            { status: 400 }
          );
        }

        const success = await authManager.enableMFA(user_id, verification_code, method);
        return NextResponse.json({
          success,
          message: success ? 'MFA enabled successfully' : 'Failed to enable MFA',
        });
      }

      case 'disable_mfa': {
        const { verification_code } = data;
        
        if (!verification_code) {
          return NextResponse.json(
            { success: false, error: 'verification_code is required' },
            { status: 400 }
          );
        }

        const success = await authManager.disableMFA(user_id, verification_code);
        return NextResponse.json({
          success,
          message: success ? 'MFA disabled successfully' : 'Failed to disable MFA',
        });
      }

      case 'verify_mfa': {
        const { code, method = 'totp' } = data;
        
        if (!code) {
          return NextResponse.json(
            { success: false, error: 'code is required' },
            { status: 400 }
          );
        }

        const isValid = await authManager.verifyMFA(user_id, code, method);
        return NextResponse.json({
          success: true,
          valid: isValid,
        });
      }

      case 'generate_api_key': {
        const { name, permissions = [] } = data;
        
        if (!name) {
          return NextResponse.json(
            { success: false, error: 'name is required' },
            { status: 400 }
          );
        }

        const keyData = await authManager.generateAPIKey(user_id, name, permissions);
        return NextResponse.json({
          success: true,
          data: keyData,
        });
      }

      case 'encrypt_data': {
        const { data: plaintext, key_id = 'default' } = data;
        
        if (!plaintext) {
          return NextResponse.json(
            { success: false, error: 'data is required' },
            { status: 400 }
          );
        }

        const encrypted = await encryptionService.encryptData(plaintext, key_id);
        return NextResponse.json({
          success: true,
          data: encrypted,
        });
      }

      case 'decrypt_data': {
        const { encrypted_data, key_id = 'default' } = data;
        
        if (!encrypted_data) {
          return NextResponse.json(
            { success: false, error: 'encrypted_data is required' },
            { status: 400 }
          );
        }

        const decrypted = await encryptionService.decryptData(encrypted_data, key_id);
        return NextResponse.json({
          success: true,
          data: decrypted,
        });
      }

      case 'hash_password': {
        const { password, salt } = data;
        
        if (!password) {
          return NextResponse.json(
            { success: false, error: 'password is required' },
            { status: 400 }
          );
        }

        const hashed = await encryptionService.hashPassword(password, salt);
        return NextResponse.json({
          success: true,
          data: hashed,
        });
      }

      case 'block_ip': {
        const { ip_address, reason } = data;
        
        if (!ip_address) {
          return NextResponse.json(
            { success: false, error: 'ip_address is required' },
            { status: 400 }
          );
        }

        apiSecurityManager.blockIP(ip_address, reason || 'Manual block');
        return NextResponse.json({
          success: true,
          message: 'IP blocked successfully',
        });
      }

      default: {
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
      }
    }

  } catch (error) {
    console.error('[Security API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Security operation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/security
 * Update security configuration or resolve violations
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, user_id, ...data } = body;

    switch (action) {
      case 'update_config': {
        if (!user_id) {
          return NextResponse.json(
            { success: false, error: 'user_id is required' },
            { status: 400 }
          );
        }

        const { security_settings } = data;
        const currentConfig = await authManager.getSecurityConfig(user_id);
        
        if (!currentConfig) {
          return NextResponse.json(
            { success: false, error: 'Security config not found' },
            { status: 404 }
          );
        }

        const updatedConfig = {
          ...currentConfig,
          security_settings: {
            ...currentConfig.security_settings,
            ...security_settings,
          },
        };

        await authManager.updateSecurityConfig(user_id, updatedConfig);
        
        return NextResponse.json({
          success: true,
          message: 'Security configuration updated',
        });
      }

      case 'resolve_violation': {
        const { violation_id } = data;
        
        if (!violation_id) {
          return NextResponse.json(
            { success: false, error: 'violation_id is required' },
            { status: 400 }
          );
        }

        const success = apiSecurityManager.resolveViolation(violation_id);
        return NextResponse.json({
          success,
          message: success ? 'Violation resolved' : 'Violation not found',
        });
      }

      case 'unblock_ip': {
        const { ip_address } = data;
        
        if (!ip_address) {
          return NextResponse.json(
            { success: false, error: 'ip_address is required' },
            { status: 400 }
          );
        }

        const success = apiSecurityManager.unblockIP(ip_address);
        return NextResponse.json({
          success,
          message: success ? 'IP unblocked successfully' : 'IP not found in block list',
        });
      }

      case 'rotate_key': {
        const { key_id } = data;
        
        if (!key_id) {
          return NextResponse.json(
            { success: false, error: 'key_id is required' },
            { status: 400 }
          );
        }

        const newKey = await encryptionService.rotateKey(key_id);
        return NextResponse.json({
          success: true,
          data: newKey,
        });
      }

      default: {
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
      }
    }

  } catch (error) {
    console.error('[Security API] Error updating:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update security configuration',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/security
 * Delete security resources: API keys, sessions, etc.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('user_id');

    switch (type) {
      case 'api_key': {
        const keyId = searchParams.get('key_id');
        
        if (!userId || !keyId) {
          return NextResponse.json(
            { success: false, error: 'user_id and key_id are required' },
            { status: 400 }
          );
        }

        const success = await authManager.revokeAPIKey(userId, keyId);
        return NextResponse.json({
          success,
          message: success ? 'API key revoked successfully' : 'API key not found',
        });
      }

      case 'session': {
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          return NextResponse.json(
            { success: false, error: 'session_id is required' },
            { status: 400 }
          );
        }

        const success = await authManager.terminateSession(sessionId);
        return NextResponse.json({
          success,
          message: success ? 'Session terminated successfully' : 'Session not found',
        });
      }

      case 'all_sessions': {
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'user_id is required' },
            { status: 400 }
          );
        }

        const sessions = authManager.getUserSessions(userId);
        const terminationPromises = sessions.map(session => 
          authManager.terminateSession(session.session_id)
        );
        
        await Promise.all(terminationPromises);
        
        return NextResponse.json({
          success: true,
          message: `${sessions.length} sessions terminated`,
        });
      }

      case 'encryption_key': {
        const keyId = searchParams.get('key_id');
        
        if (!keyId) {
          return NextResponse.json(
            { success: false, error: 'key_id is required' },
            { status: 400 }
          );
        }

        encryptionService.revokeKey(keyId);
        return NextResponse.json({
          success: true,
          message: 'Encryption key revoked successfully',
        });
      }

      default: {
        return NextResponse.json(
          { success: false, error: 'type parameter is required (api_key|session|all_sessions|encryption_key)' },
          { status: 400 }
        );
      }
    }

  } catch (error) {
    console.error('[Security API] Error deleting:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete security resource',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
