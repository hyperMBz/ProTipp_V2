/**
 * Coverage Analyzer for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 * 
 * Analyzes test coverage and provides detailed reports
 */

// Server-side only imports
const isServer = typeof window === 'undefined';

export interface CoverageData {
  totalStatements: number;
  coveredStatements: number;
  totalBranches: number;
  coveredBranches: number;
  totalFunctions: number;
  coveredFunctions: number;
  totalLines: number;
  coveredLines: number;
  percentage: number;
}

export interface FileCoverage {
  file: string;
  coverage: CoverageData;
  uncoveredLines: number[];
  uncoveredBranches: number[];
  uncoveredFunctions: number[];
}

export interface CoverageReport {
  summary: CoverageData;
  files: FileCoverage[];
  thresholds: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  recommendations: string[];
  status: 'pass' | 'fail' | 'warning';
}

export class CoverageAnalyzer {
  private coveragePath: string;
  private thresholds: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };

  constructor(
    coveragePath: string = 'coverage/coverage-final.json',
    thresholds: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    } = {
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90
    }
  ) {
    this.coveragePath = coveragePath;
    this.thresholds = thresholds;
  }

  /**
   * Analyze coverage from coverage report
   */
  async analyzeCoverage(): Promise<CoverageReport> {
    if (!isServer) {
      console.warn('Coverage analysis is only available on the server side');
      return this.generateEmptyReport();
    }

    console.log('📊 Analyzing test coverage...');

    try {
      const fs = await import('fs');
      const path = await import('path');
      
      if (!fs.existsSync(this.coveragePath)) {
        console.warn(`⚠️ Coverage file not found: ${this.coveragePath}`);
        return this.generateEmptyReport();
      }

      const coverageData = JSON.parse(fs.readFileSync(this.coveragePath, 'utf8'));
      const files = this.parseCoverageData(coverageData);
      const summary = this.calculateSummary(files);
      const recommendations = this.generateRecommendations(files, summary);
      const status = this.determineStatus(summary);

      const report: CoverageReport = {
        summary,
        files,
        thresholds: this.thresholds,
        recommendations,
        status
      };

      this.saveReport(report, fs, path);
      return report;
    } catch (error) {
      console.error('❌ Error analyzing coverage:', error);
      return this.generateEmptyReport();
    }
  }

  /**
   * Parse coverage data from coverage report
   */
  private parseCoverageData(coverageData: any): FileCoverage[] {
    const files: FileCoverage[] = [];

    Object.entries(coverageData).forEach(([filePath, data]: [string, any]) => {
      // Skip node_modules and test files
      if (filePath.includes('node_modules') || filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.')) {
        return;
      }

      const coverage = this.calculateFileCoverage(data);
      const uncoveredLines = this.findUncoveredLines(data.s);
      const uncoveredBranches = this.findUncoveredBranches(data.b);
      const uncoveredFunctions = this.findUncoveredFunctions(data.f);

      files.push({
        file: filePath,
        coverage,
        uncoveredLines,
        uncoveredBranches,
        uncoveredFunctions
      });
    });

    return files;
  }

  /**
   * Calculate coverage for a single file
   */
  private calculateFileCoverage(data: any): CoverageData {
    const statements = this.calculateStatementsCoverage(data.s);
    const branches = this.calculateBranchesCoverage(data.b);
    const functions = this.calculateFunctionsCoverage(data.f);
    const lines = this.calculateLinesCoverage(data.s);

    const totalStatements = Object.keys(data.s).length;
    const coveredStatements = Object.values(data.s).filter((v: any) => v > 0).length;

    const totalBranches = Object.keys(data.b).length;
    const coveredBranches = Object.values(data.b).filter((arr: any) => arr.some((v: any) => v > 0)).length;

    const totalFunctions = Object.keys(data.f).length;
    const coveredFunctions = Object.values(data.f).filter((v: any) => v > 0).length;

    const totalLines = Object.keys(data.s).length;
    const coveredLines = Object.values(data.s).filter((v: any) => v > 0).length;

    const percentage = totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0;

    return {
      totalStatements,
      coveredStatements,
      totalBranches,
      coveredBranches,
      totalFunctions,
      coveredFunctions,
      totalLines,
      coveredLines,
      percentage
    };
  }

  /**
   * Calculate statements coverage
   */
  private calculateStatementsCoverage(statements: any): number {
    const total = Object.keys(statements).length;
    const covered = Object.values(statements).filter((v: any) => v > 0).length;
    return total > 0 ? (covered / total) * 100 : 0;
  }

  /**
   * Calculate branches coverage
   */
  private calculateBranchesCoverage(branches: any): number {
    const total = Object.keys(branches).length;
    const covered = Object.values(branches).filter((arr: any) => arr.some((v: any) => v > 0)).length;
    return total > 0 ? (covered / total) * 100 : 0;
  }

  /**
   * Calculate functions coverage
   */
  private calculateFunctionsCoverage(functions: any): number {
    const total = Object.keys(functions).length;
    const covered = Object.values(functions).filter((v: any) => v > 0).length;
    return total > 0 ? (covered / total) * 100 : 0;
  }

  /**
   * Calculate lines coverage
   */
  private calculateLinesCoverage(statements: any): number {
    const total = Object.keys(statements).length;
    const covered = Object.values(statements).filter((v: any) => v > 0).length;
    return total > 0 ? (covered / total) * 100 : 0;
  }

  /**
   * Find uncovered lines
   */
  private findUncoveredLines(statements: any): number[] {
    return Object.entries(statements)
      .filter(([_, count]) => count === 0)
      .map(([line]) => parseInt(line))
      .sort((a, b) => a - b);
  }

  /**
   * Find uncovered branches
   */
  private findUncoveredBranches(branches: any): number[] {
    return Object.entries(branches)
      .filter(([_, counts]) => Array.isArray(counts) && counts.every((count: any) => count === 0))
      .map(([branch]) => parseInt(branch))
      .sort((a, b) => a - b);
  }

  /**
   * Find uncovered functions
   */
  private findUncoveredFunctions(functions: any): number[] {
    return Object.entries(functions)
      .filter(([_, count]) => count === 0)
      .map(([func]) => parseInt(func))
      .sort((a, b) => a - b);
  }

  /**
   * Calculate overall summary
   */
  private calculateSummary(files: FileCoverage[]): CoverageData {
    const totalStatements = files.reduce((sum, file) => sum + file.coverage.totalStatements, 0);
    const coveredStatements = files.reduce((sum, file) => sum + file.coverage.coveredStatements, 0);
    const totalBranches = files.reduce((sum, file) => sum + file.coverage.totalBranches, 0);
    const coveredBranches = files.reduce((sum, file) => sum + file.coverage.coveredBranches, 0);
    const totalFunctions = files.reduce((sum, file) => sum + file.coverage.totalFunctions, 0);
    const coveredFunctions = files.reduce((sum, file) => sum + file.coverage.coveredFunctions, 0);
    const totalLines = files.reduce((sum, file) => sum + file.coverage.totalLines, 0);
    const coveredLines = files.reduce((sum, file) => sum + file.coverage.coveredLines, 0);

    const percentage = totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0;

    return {
      totalStatements,
      coveredStatements,
      totalBranches,
      coveredBranches,
      totalFunctions,
      coveredFunctions,
      totalLines,
      coveredLines,
      percentage
    };
  }

  /**
   * Generate recommendations based on coverage
   */
  private generateRecommendations(files: FileCoverage[], summary: CoverageData): string[] {
    const recommendations: string[] = [];

    // Overall coverage recommendations
    if (summary.percentage < this.thresholds.statements) {
      recommendations.push(`Increase overall statement coverage from ${summary.percentage.toFixed(1)}% to at least ${this.thresholds.statements}%`);
    }

    if (summary.coveredBranches / summary.totalBranches * 100 < this.thresholds.branches) {
      recommendations.push(`Increase branch coverage from ${(summary.coveredBranches / summary.totalBranches * 100).toFixed(1)}% to at least ${this.thresholds.branches}%`);
    }

    if (summary.coveredFunctions / summary.totalFunctions * 100 < this.thresholds.functions) {
      recommendations.push(`Increase function coverage from ${(summary.coveredFunctions / summary.totalFunctions * 100).toFixed(1)}% to at least ${this.thresholds.functions}%`);
    }

    // File-specific recommendations
    const lowCoverageFiles = files.filter(file => file.coverage.percentage < 50);
    if (lowCoverageFiles.length > 0) {
      recommendations.push(`Add tests for files with low coverage: ${lowCoverageFiles.slice(0, 5).map(f => f.file.split('/').pop()).join(', ')}`);
    }

    // Uncovered lines recommendations
    const filesWithUncoveredLines = files.filter(file => file.uncoveredLines.length > 0);
    if (filesWithUncoveredLines.length > 0) {
      const totalUncovered = filesWithUncoveredLines.reduce((sum, file) => sum + file.uncoveredLines.length, 0);
      recommendations.push(`Add tests for ${totalUncovered} uncovered lines across ${filesWithUncoveredLines.length} files`);
    }

    // Uncovered branches recommendations
    const filesWithUncoveredBranches = files.filter(file => file.uncoveredBranches.length > 0);
    if (filesWithUncoveredBranches.length > 0) {
      const totalUncovered = filesWithUncoveredBranches.reduce((sum, file) => sum + file.uncoveredBranches.length, 0);
      recommendations.push(`Add tests for ${totalUncovered} uncovered branches across ${filesWithUncoveredBranches.length} files`);
    }

    return recommendations;
  }

  /**
   * Determine overall status
   */
  private determineStatus(summary: CoverageData): 'pass' | 'fail' | 'warning' {
    const statementCoverage = summary.percentage;
    const branchCoverage = summary.totalBranches > 0 ? (summary.coveredBranches / summary.totalBranches) * 100 : 100;
    const functionCoverage = summary.totalFunctions > 0 ? (summary.coveredFunctions / summary.totalFunctions) * 100 : 100;
    const lineCoverage = summary.totalLines > 0 ? (summary.coveredLines / summary.totalLines) * 100 : 100;

    if (statementCoverage >= this.thresholds.statements &&
        branchCoverage >= this.thresholds.branches &&
        functionCoverage >= this.thresholds.functions &&
        lineCoverage >= this.thresholds.lines) {
      return 'pass';
    } else if (statementCoverage >= this.thresholds.statements * 0.8) {
      return 'warning';
    } else {
      return 'fail';
    }
  }

  /**
   * Save coverage report
   */
  private saveReport(report: CoverageReport, fs: any, path: any): void {
    const reportPath = path.join(process.cwd(), 'coverage-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Coverage report saved to ${reportPath}`);
  }

  /**
   * Generate empty report when coverage file is not found
   */
  private generateEmptyReport(): CoverageReport {
    const emptyCoverage: CoverageData = {
      totalStatements: 0,
      coveredStatements: 0,
      totalBranches: 0,
      coveredBranches: 0,
      totalFunctions: 0,
      coveredFunctions: 0,
      totalLines: 0,
      coveredLines: 0,
      percentage: 0
    };

    return {
      summary: emptyCoverage,
      files: [],
      thresholds: this.thresholds,
      recommendations: ['Run tests with coverage to generate coverage report'],
      status: 'fail'
    };
  }

  /**
   * Get coverage for specific file
   */
  async getFileCoverage(filePath: string): Promise<FileCoverage | null> {
    if (!isServer) {
      return null;
    }

    try {
      const fs = await import('fs');
      
      if (!fs.existsSync(this.coveragePath)) {
        return null;
      }

      const coverageData = JSON.parse(fs.readFileSync(this.coveragePath, 'utf8'));
      const fileData = coverageData[filePath];

      if (!fileData) {
        return null;
      }

      const coverage = this.calculateFileCoverage(fileData);
      const uncoveredLines = this.findUncoveredLines(fileData.s);
      const uncoveredBranches = this.findUncoveredBranches(fileData.b);
      const uncoveredFunctions = this.findUncoveredFunctions(fileData.f);

      return {
        file: filePath,
        coverage,
        uncoveredLines,
        uncoveredBranches,
        uncoveredFunctions
      };
    } catch (error) {
      console.error('Error getting file coverage:', error);
      return null;
    }
  }

  /**
   * Get files with low coverage
   */
  async getLowCoverageFiles(threshold: number = 50): Promise<FileCoverage[]> {
    if (!isServer) {
      return [];
    }

    try {
      const fs = await import('fs');
      
      if (!fs.existsSync(this.coveragePath)) {
        return [];
      }

      const coverageData = JSON.parse(fs.readFileSync(this.coveragePath, 'utf8'));
      const files = this.parseCoverageData(coverageData);
      return files.filter(file => file.coverage.percentage < threshold);
    } catch (error) {
      console.error('Error getting low coverage files:', error);
      return [];
    }
  }

  /**
   * Get coverage trends (if historical data available)
   */
  async getCoverageTrends(): Promise<{
    current: CoverageData;
    previous?: CoverageData;
    trend: 'improving' | 'declining' | 'stable';
  }> {
    const current = await this.analyzeCoverage();
    
    // In a real implementation, you would load historical data
    // For now, return current data only
    return {
      current: current.summary,
      trend: 'stable'
    };
  }
}

// Default analyzer instance
export const coverageAnalyzer = new CoverageAnalyzer();
