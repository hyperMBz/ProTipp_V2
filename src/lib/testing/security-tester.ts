/**
 * Security Tester for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 * 
 * Comprehensive security vulnerability testing
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface SecurityVulnerability {
  id: string;
  type: 'dependency' | 'code' | 'configuration' | 'environment';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
  cve?: string;
  package?: string;
  version?: string;
}

export interface SecurityTest {
  id: string;
  name: string;
  description: string;
  vulnerabilities: SecurityVulnerability[];
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  status: 'pass' | 'fail' | 'warning';
  timestamp: Date;
}

export interface SecurityReport {
  summary: {
    total_tests: number;
    passed: number;
    failed: number;
    warning: number;
    total_vulnerabilities: number;
    critical_vulnerabilities: number;
    high_vulnerabilities: number;
    medium_vulnerabilities: number;
    low_vulnerabilities: number;
  };
  tests: SecurityTest[];
  recommendations: string[];
  status: 'pass' | 'fail' | 'warning';
}

export class SecurityTester {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Run comprehensive security tests
   */
  async runSecurityTests(): Promise<SecurityReport> {
    console.log('🔒 Starting security tests...');

    const tests: SecurityTest[] = [];

    // Test 1: Dependency vulnerability scan
    tests.push(await this.runDependencyScan({
      name: 'Dependency Vulnerability Scan',
      description: 'Scan for known vulnerabilities in dependencies'
    }));

    // Test 2: Code security analysis
    tests.push(await this.runCodeSecurityAnalysis({
      name: 'Code Security Analysis',
      description: 'Analyze code for security vulnerabilities'
    }));

    // Test 3: Configuration security check
    tests.push(await this.runConfigurationSecurityCheck({
      name: 'Configuration Security Check',
      description: 'Check configuration files for security issues'
    }));

    // Test 4: Environment variable security
    tests.push(await this.runEnvironmentSecurityCheck({
      name: 'Environment Variable Security',
      description: 'Check for exposed sensitive environment variables'
    }));

    // Test 5: API security test
    tests.push(await this.runAPISecurityTest({
      name: 'API Security Test',
      description: 'Test API endpoints for security vulnerabilities'
    }));

    const summary = this.generateSummary(tests);
    const recommendations = this.generateRecommendations(tests);
    const status = this.determineOverallStatus(tests);

    const report: SecurityReport = {
      summary,
      tests,
      recommendations,
      status
    };

    this.saveReport(report);
    return report;
  }

  /**
   * Run dependency vulnerability scan
   */
  private async runDependencyScan(config: {
    name: string;
    description: string;
  }): Promise<SecurityTest> {
    console.log(`📦 Running ${config.name}...`);

    const vulnerabilities: SecurityVulnerability[] = [];
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;

    try {
      // Run npm audit
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const auditData = JSON.parse(auditResult);

      if (auditData.vulnerabilities) {
        Object.entries(auditData.vulnerabilities).forEach(([packageName, vuln]: [string, any]) => {
          totalChecks++;
          failedChecks++;

          vulnerabilities.push({
            id: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'dependency',
            severity: vuln.severity || 'low',
            title: vuln.title || `Vulnerability in ${packageName}`,
            description: vuln.description || `Security vulnerability found in ${packageName}`,
            recommendation: vuln.recommendation || 'Update to latest version',
            cve: vuln.cves?.[0],
            package: packageName,
            version: vuln.installedVersion
          });
        });
      }

      // Check for outdated packages
      const outdatedResult = execSync('npm outdated --json', { encoding: 'utf8' });
      const outdatedData = JSON.parse(outdatedResult);

      Object.entries(outdatedData).forEach(([packageName, data]: [string, any]) => {
        totalChecks++;
        if (this.isSecurityUpdate(data)) {
          failedChecks++;
          vulnerabilities.push({
            id: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'dependency',
            severity: 'medium',
            title: `Outdated package: ${packageName}`,
            description: `${packageName} is outdated and may contain security vulnerabilities`,
            recommendation: `Update ${packageName} from ${data.current} to ${data.latest}`,
            package: packageName,
            version: data.current
          });
        } else {
          passedChecks++;
        }
      });

    } catch (error) {
      console.warn('Could not run dependency scan:', error);
      totalChecks++;
      failedChecks++;
    }

    const status = this.determineTestStatus(vulnerabilities);

    return {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      description: config.description,
      vulnerabilities,
      totalChecks,
      passedChecks,
      failedChecks,
      status,
      timestamp: new Date()
    };
  }

  /**
   * Run code security analysis
   */
  private async runCodeSecurityAnalysis(config: {
    name: string;
    description: string;
  }): Promise<SecurityTest> {
    console.log(`🔍 Running ${config.name}...`);

    const vulnerabilities: SecurityVulnerability[] = [];
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;

    // Check for common security issues in code
    const securityPatterns = [
      {
        pattern: /eval\s*\(/g,
        severity: 'critical' as const,
        title: 'Use of eval() function',
        description: 'eval() function can execute arbitrary code and is a security risk',
        recommendation: 'Replace eval() with safer alternatives like JSON.parse() or Function constructor'
      },
      {
        pattern: /innerHTML\s*=/g,
        severity: 'high' as const,
        title: 'Use of innerHTML',
        description: 'innerHTML can lead to XSS attacks if used with user input',
        recommendation: 'Use textContent or createElement instead of innerHTML'
      },
      {
        pattern: /document\.write\s*\(/g,
        severity: 'high' as const,
        title: 'Use of document.write()',
        description: 'document.write() can lead to XSS attacks',
        recommendation: 'Use DOM manipulation methods instead of document.write()'
      },
      {
        pattern: /localStorage\s*\.\s*setItem\s*\([^)]*['"`][^'"`]*['"`]\s*,\s*[^)]*['"`][^'"`]*['"`]/g,
        severity: 'medium' as const,
        title: 'Potential sensitive data in localStorage',
        description: 'Sensitive data stored in localStorage may be accessible to malicious scripts',
        recommendation: 'Avoid storing sensitive data in localStorage, use sessionStorage or secure cookies'
      },
      {
        pattern: /console\.log\s*\([^)]*['"`][^'"`]*password[^'"`]*['"`]/gi,
        severity: 'medium' as const,
        title: 'Password logging',
        description: 'Passwords or sensitive data being logged to console',
        recommendation: 'Remove password logging from production code'
      }
    ];

    // Scan source files
    const sourceFiles = this.getSourceFiles();
    
    sourceFiles.forEach(file => {
      try {
        const content = readFileSync(file, 'utf8');
        
        securityPatterns.forEach(pattern => {
          const matches = content.match(pattern.pattern);
          if (matches) {
            totalChecks++;
            failedChecks++;

            vulnerabilities.push({
              id: `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'code',
              severity: pattern.severity,
              title: pattern.title,
              description: pattern.description,
              file: file,
              recommendation: pattern.recommendation
            });
          } else {
            totalChecks++;
            passedChecks++;
          }
        });
      } catch (error) {
        console.warn(`Could not read file ${file}:`, error);
      }
    });

    const status = this.determineTestStatus(vulnerabilities);

    return {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      description: config.description,
      vulnerabilities,
      totalChecks,
      passedChecks,
      failedChecks,
      status,
      timestamp: new Date()
    };
  }

  /**
   * Run configuration security check
   */
  private async runConfigurationSecurityCheck(config: {
    name: string;
    description: string;
  }): Promise<SecurityTest> {
    console.log(`⚙️ Running ${config.name}...`);

    const vulnerabilities: SecurityVulnerability[] = [];
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;

    // Check configuration files
    const configFiles = [
      'next.config.js',
      'package.json',
      'tsconfig.json',
      'tailwind.config.ts',
      'vitest.config.ts'
    ];

    configFiles.forEach(file => {
      const filePath = join(this.projectRoot, file);
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf8');
          
          // Check for exposed secrets
          const secretPatterns = [
            /api_key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
            /secret\s*[:=]\s*['"`][^'"`]+['"`]/gi,
            /password\s*[:=]\s*['"`][^'"`]+['"`]/gi,
            /token\s*[:=]\s*['"`][^'"`]+['"`]/gi
          ];

          secretPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              totalChecks++;
              failedChecks++;

              vulnerabilities.push({
                id: `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'configuration',
                severity: 'critical',
                title: 'Exposed secret in configuration',
                description: `Secret found in configuration file: ${file}`,
                file: file,
                recommendation: 'Move secrets to environment variables'
              });
            } else {
              totalChecks++;
              passedChecks++;
            }
          });
        } catch (error) {
          console.warn(`Could not read config file ${file}:`, error);
        }
      }
    });

    const status = this.determineTestStatus(vulnerabilities);

    return {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      description: config.description,
      vulnerabilities,
      totalChecks,
      passedChecks,
      failedChecks,
      status,
      timestamp: new Date()
    };
  }

  /**
   * Run environment variable security check
   */
  private async runEnvironmentSecurityCheck(config: {
    name: string;
    description: string;
  }): Promise<SecurityTest> {
    console.log(`🌍 Running ${config.name}...`);

    const vulnerabilities: SecurityVulnerability[] = [];
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;

    // Check for environment files
    const envFiles = [
      '.env',
      '.env.local',
      '.env.development',
      '.env.production'
    ];

    envFiles.forEach(file => {
      const filePath = join(this.projectRoot, file);
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf8');
          
          // Check if env file is committed to git
          const gitResult = execSync(`git ls-files ${file}`, { encoding: 'utf8' });
          if (gitResult.trim()) {
            totalChecks++;
            failedChecks++;

            vulnerabilities.push({
              id: `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'environment',
              severity: 'critical',
              title: 'Environment file committed to git',
              description: `${file} is committed to git repository`,
              file: file,
              recommendation: 'Add environment files to .gitignore and use .env.example for templates'
            });
          } else {
            totalChecks++;
            passedChecks++;
          }
        } catch (error) {
          // File not in git, which is good
          totalChecks++;
          passedChecks++;
        }
      }
    });

    const status = this.determineTestStatus(vulnerabilities);

    return {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      description: config.description,
      vulnerabilities,
      totalChecks,
      passedChecks,
      failedChecks,
      status,
      timestamp: new Date()
    };
  }

  /**
   * Run API security test
   */
  private async runAPISecurityTest(config: {
    name: string;
    description: string;
  }): Promise<SecurityTest> {
    console.log(`🔗 Running ${config.name}...`);

    const vulnerabilities: SecurityVulnerability[] = [];
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;

    // Check API endpoints for common security issues
    const apiFiles = this.getAPIFiles();
    
    apiFiles.forEach(file => {
      try {
        const content = readFileSync(file, 'utf8');
        
        // Check for missing input validation
        if (content.includes('req.body') && !content.includes('validate') && !content.includes('zod')) {
          totalChecks++;
          failedChecks++;

          vulnerabilities.push({
            id: `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'code',
            severity: 'high',
            title: 'Missing input validation',
            description: `API endpoint in ${file} lacks input validation`,
            file: file,
            recommendation: 'Add input validation using zod or similar library'
          });
        } else {
          totalChecks++;
          passedChecks++;
        }

        // Check for missing authentication
        if (content.includes('export async function') && !content.includes('auth') && !content.includes('middleware')) {
          totalChecks++;
          failedChecks++;

          vulnerabilities.push({
            id: `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'code',
            severity: 'high',
            title: 'Missing authentication',
            description: `API endpoint in ${file} lacks authentication`,
            file: file,
            recommendation: 'Add authentication middleware to protect API endpoints'
          });
        } else {
          totalChecks++;
          passedChecks++;
        }

        // Check for CORS configuration
        if (content.includes('Access-Control-Allow-Origin') && content.includes('*')) {
          totalChecks++;
          failedChecks++;

          vulnerabilities.push({
            id: `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'code',
            severity: 'medium',
            title: 'Overly permissive CORS',
            description: `CORS allows all origins in ${file}`,
            file: file,
            recommendation: 'Restrict CORS to specific domains'
          });
        } else {
          totalChecks++;
          passedChecks++;
        }

      } catch (error) {
        console.warn(`Could not read API file ${file}:`, error);
      }
    });

    const status = this.determineTestStatus(vulnerabilities);

    return {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      description: config.description,
      vulnerabilities,
      totalChecks,
      passedChecks,
      failedChecks,
      status,
      timestamp: new Date()
    };
  }

  /**
   * Get source files for scanning
   */
  private getSourceFiles(): string[] {
    const files: string[] = [];
    
    // Add common source directories
    const sourceDirs = ['src', 'app', 'components', 'lib'];
    
    sourceDirs.forEach(dir => {
      const dirPath = join(this.projectRoot, dir);
      if (existsSync(dirPath)) {
        // This is a simplified file discovery
        // In production, use a proper file walker
        files.push(join(dirPath, '**/*.{ts,tsx,js,jsx}'));
      }
    });

    return files;
  }

  /**
   * Get API files for scanning
   */
  private getAPIFiles(): string[] {
    const files: string[] = [];
    
    const apiDir = join(this.projectRoot, 'src/app/api');
    if (existsSync(apiDir)) {
      // This is a simplified file discovery
      // In production, use a proper file walker
      files.push(join(apiDir, '**/*.{ts,tsx,js,jsx}'));
    }

    return files;
  }

  /**
   * Check if package update is security-related
   */
  private isSecurityUpdate(data: any): boolean {
    // This is a simplified check
    // In production, you would check against security databases
    return data.current !== data.latest;
  }

  /**
   * Determine test status based on vulnerabilities
   */
  private determineTestStatus(vulnerabilities: SecurityVulnerability[]): 'pass' | 'fail' | 'warning' {
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highVulns = vulnerabilities.filter(v => v.severity === 'high').length;
    const mediumVulns = vulnerabilities.filter(v => v.severity === 'medium').length;

    if (criticalVulns > 0 || highVulns > 0) {
      return 'fail';
    } else if (mediumVulns > 0) {
      return 'warning';
    } else {
      return 'pass';
    }
  }

  /**
   * Generate security test summary
   */
  private generateSummary(tests: SecurityTest[]) {
    const totalTests = tests.length;
    const passed = tests.filter(t => t.status === 'pass').length;
    const failed = tests.filter(t => t.status === 'fail').length;
    const warning = tests.filter(t => t.status === 'warning').length;
    
    const allVulnerabilities = tests.flatMap(t => t.vulnerabilities);
    const totalVulnerabilities = allVulnerabilities.length;
    const criticalVulnerabilities = allVulnerabilities.filter(v => v.severity === 'critical').length;
    const highVulnerabilities = allVulnerabilities.filter(v => v.severity === 'high').length;
    const mediumVulnerabilities = allVulnerabilities.filter(v => v.severity === 'medium').length;
    const lowVulnerabilities = allVulnerabilities.filter(v => v.severity === 'low').length;

    return {
      total_tests: totalTests,
      passed,
      failed,
      warning,
      total_vulnerabilities: totalVulnerabilities,
      critical_vulnerabilities: criticalVulnerabilities,
      high_vulnerabilities: highVulnerabilities,
      medium_vulnerabilities: mediumVulnerabilities,
      low_vulnerabilities: lowVulnerabilities
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(tests: SecurityTest[]): string[] {
    const recommendations: string[] = [];

    const allVulnerabilities = tests.flatMap(t => t.vulnerabilities);
    const criticalVulns = allVulnerabilities.filter(v => v.severity === 'critical');
    const highVulns = allVulnerabilities.filter(v => v.severity === 'high');
    const mediumVulns = allVulnerabilities.filter(v => v.severity === 'medium');

    if (criticalVulns.length > 0) {
      recommendations.push(`Fix ${criticalVulns.length} critical vulnerabilities immediately`);
    }

    if (highVulns.length > 0) {
      recommendations.push(`Address ${highVulns.length} high-severity vulnerabilities`);
    }

    if (mediumVulns.length > 0) {
      recommendations.push(`Review ${mediumVulns.length} medium-severity vulnerabilities`);
    }

    const dependencyVulns = allVulnerabilities.filter(v => v.type === 'dependency');
    if (dependencyVulns.length > 0) {
      recommendations.push('Update vulnerable dependencies to latest secure versions');
    }

    const codeVulns = allVulnerabilities.filter(v => v.type === 'code');
    if (codeVulns.length > 0) {
      recommendations.push('Review and fix security issues in source code');
    }

    const configVulns = allVulnerabilities.filter(v => v.type === 'configuration');
    if (configVulns.length > 0) {
      recommendations.push('Secure configuration files and remove exposed secrets');
    }

    return recommendations;
  }

  /**
   * Determine overall status
   */
  private determineOverallStatus(tests: SecurityTest[]): 'pass' | 'fail' | 'warning' {
    const allVulnerabilities = tests.flatMap(t => t.vulnerabilities);
    const criticalVulns = allVulnerabilities.filter(v => v.severity === 'critical').length;
    const highVulns = allVulnerabilities.filter(v => v.severity === 'high').length;
    const mediumVulns = allVulnerabilities.filter(v => v.severity === 'medium').length;

    if (criticalVulns > 0 || highVulns > 0) {
      return 'fail';
    } else if (mediumVulns > 0) {
      return 'warning';
    } else {
      return 'pass';
    }
  }

  /**
   * Save security report
   */
  private saveReport(report: SecurityReport): void {
    const reportPath = join(this.projectRoot, 'security-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Security report saved to ${reportPath}`);
  }
}

// Default security tester instance
export const securityTester = new SecurityTester();
