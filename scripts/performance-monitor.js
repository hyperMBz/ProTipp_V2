#!/usr/bin/env node

/**
 * 🚀 ProTipp V2 - Performance Monitoring Script
 * 
 * This script monitors and analyzes the performance of the ProTipp V2 application
 * in production, providing insights and recommendations for optimization.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🚀 ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSection(message) {
  log(`\n📊 ${message}`, 'blue');
  log('-'.repeat(40), 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

// Performance thresholds
const THRESHOLDS = {
  bundleSize: {
    warning: 500, // KB
    error: 1000, // KB
  },
  buildTime: {
    warning: 120, // seconds
    error: 300, // seconds
  },
  lighthouse: {
    performance: 90,
    accessibility: 90,
    bestPractices: 90,
    seo: 90,
  },
};

class PerformanceMonitor {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      buildTime: 0,
      bundleSize: {},
      lighthouse: {},
      recommendations: [],
    };
  }

  // Analyze bundle size
  analyzeBundleSize() {
    logSection('Bundle Size Analysis');
    
    try {
      const nextDir = path.join(process.cwd(), '.next');
      
      if (!fs.existsSync(nextDir)) {
        logError('Build directory not found. Run build first.');
        return;
      }

      // Analyze main chunks
      const staticDir = path.join(nextDir, 'static', 'chunks');
      if (fs.existsSync(staticDir)) {
        const chunks = fs.readdirSync(staticDir);
        
        chunks.forEach(chunk => {
          const chunkPath = path.join(staticDir, chunk);
          const stats = fs.statSync(chunkPath);
          const sizeKB = Math.round(stats.size / 1024);
          
          this.results.bundleSize[chunk] = sizeKB;
          
          if (sizeKB > THRESHOLDS.bundleSize.error) {
            logError(`${chunk}: ${sizeKB}KB (exceeds ${THRESHOLDS.bundleSize.error}KB limit)`);
            this.results.recommendations.push(`Optimize ${chunk} bundle size`);
          } else if (sizeKB > THRESHOLDS.bundleSize.warning) {
            logWarning(`${chunk}: ${sizeKB}KB (exceeds ${THRESHOLDS.bundleSize.warning}KB warning)`);
          } else {
            logSuccess(`${chunk}: ${sizeKB}KB`);
          }
        });
      }

      // Analyze total bundle size
      const totalSize = this.getTotalBundleSize();
      if (totalSize > THRESHOLDS.bundleSize.error) {
        logError(`Total bundle size: ${totalSize}KB (exceeds limit)`);
        this.results.recommendations.push('Consider code splitting and lazy loading');
      } else if (totalSize > THRESHOLDS.bundleSize.warning) {
        logWarning(`Total bundle size: ${totalSize}KB (warning threshold)`);
      } else {
        logSuccess(`Total bundle size: ${totalSize}KB`);
      }

    } catch (error) {
      logError(`Bundle analysis failed: ${error.message}`);
    }
  }

  // Get total bundle size
  getTotalBundleSize() {
    return Object.values(this.results.bundleSize).reduce((total, size) => total + size, 0);
  }

  // Analyze build time
  analyzeBuildTime() {
    logSection('Build Time Analysis');
    
    this.results.buildTime = Math.round((Date.now() - this.startTime) / 1000);
    
    if (this.results.buildTime > THRESHOLDS.buildTime.error) {
      logError(`Build time: ${this.results.buildTime}s (exceeds ${THRESHOLDS.buildTime.error}s limit)`);
      this.results.recommendations.push('Optimize build process and dependencies');
    } else if (this.results.buildTime > THRESHOLDS.buildTime.warning) {
      logWarning(`Build time: ${this.results.buildTime}s (exceeds ${THRESHOLDS.buildTime.warning}s warning)`);
    } else {
      logSuccess(`Build time: ${this.results.buildTime}s`);
    }
  }

  // Run Lighthouse audit (if available)
  async runLighthouseAudit() {
    logSection('Lighthouse Performance Audit');
    
    try {
      // Check if Lighthouse CLI is available
      execSync('lighthouse --version', { stdio: 'ignore' });
      
      const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      log(`Running Lighthouse audit for: ${url}`);
      
      // Run Lighthouse audit
      const lighthouseCommand = `lighthouse ${url} --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless"`;
      execSync(lighthouseCommand, { stdio: 'pipe' });
      
      // Parse results
      if (fs.existsSync('./lighthouse-report.json')) {
        const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'));
        const scores = report.categories;
        
        this.results.lighthouse = {
          performance: Math.round(scores.performance.score * 100),
          accessibility: Math.round(scores.accessibility.score * 100),
          bestPractices: Math.round(scores['best-practices'].score * 100),
          seo: Math.round(scores.seo.score * 100),
        };
        
        // Log results
        Object.entries(this.results.lighthouse).forEach(([category, score]) => {
          const threshold = THRESHOLDS.lighthouse[category];
          if (score < threshold) {
            logError(`${category}: ${score}% (below ${threshold}% threshold)`);
            this.results.recommendations.push(`Improve ${category} score`);
          } else {
            logSuccess(`${category}: ${score}%`);
          }
        });
        
        // Clean up
        fs.unlinkSync('./lighthouse-report.json');
      }
      
    } catch (error) {
      logWarning('Lighthouse CLI not available. Install with: npm install -g lighthouse');
      logWarning('Skipping Lighthouse audit');
    }
  }

  // Analyze dependencies
  analyzeDependencies() {
    logSection('Dependency Analysis');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});
      
      log(`Production dependencies: ${dependencies.length}`);
      log(`Development dependencies: ${devDependencies.length}`);
      
      // Check for large dependencies
      const largeDeps = ['@tensorflow/tfjs', 'chart.js', 'recharts'];
      const foundLargeDeps = dependencies.filter(dep => largeDeps.includes(dep));
      
      if (foundLargeDeps.length > 0) {
        logWarning(`Large dependencies found: ${foundLargeDeps.join(', ')}`);
        this.results.recommendations.push('Consider lazy loading for large dependencies');
      }
      
      // Check for outdated dependencies
      try {
        const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
        const outdatedDeps = JSON.parse(outdated);
        
        if (Object.keys(outdatedDeps).length > 0) {
          logWarning(`${Object.keys(outdatedDeps).length} outdated dependencies found`);
          this.results.recommendations.push('Update outdated dependencies');
        } else {
          logSuccess('All dependencies are up to date');
        }
      } catch (error) {
        logWarning('Could not check for outdated dependencies');
      }
      
    } catch (error) {
      logError(`Dependency analysis failed: ${error.message}`);
    }
  }

  // Generate performance report
  generateReport() {
    logSection('Performance Report Generation');
    
    const report = {
      timestamp: new Date().toISOString(),
      buildTime: this.results.buildTime,
      bundleSize: this.results.bundleSize,
      totalBundleSize: this.getTotalBundleSize(),
      lighthouse: this.results.lighthouse,
      recommendations: this.results.recommendations,
      thresholds: THRESHOLDS,
    };
    
    const reportFile = `performance-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    logSuccess(`Performance report saved: ${reportFile}`);
    
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    const markdownFile = `performance-report-${Date.now()}.md`;
    fs.writeFileSync(markdownFile, markdownReport);
    
    logSuccess(`Markdown report saved: ${markdownFile}`);
    
    return report;
  }

  // Generate markdown report
  generateMarkdownReport(report) {
    return `# ProTipp V2 - Performance Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}

## Build Performance

- **Build Time:** ${report.buildTime}s
- **Total Bundle Size:** ${report.totalBundleSize}KB

## Bundle Analysis

${Object.entries(report.bundleSize).map(([chunk, size]) => `- **${chunk}:** ${size}KB`).join('\n')}

## Lighthouse Scores

${Object.entries(report.lighthouse).map(([category, score]) => `- **${category}:** ${score}%`).join('\n')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Performance Thresholds

- **Bundle Size Warning:** ${THRESHOLDS.bundleSize.warning}KB
- **Bundle Size Error:** ${THRESHOLDS.bundleSize.error}KB
- **Build Time Warning:** ${THRESHOLDS.buildTime.warning}s
- **Build Time Error:** ${THRESHOLDS.buildTime.error}s
- **Lighthouse Performance:** ${THRESHOLDS.lighthouse.performance}%
- **Lighthouse Accessibility:** ${THRESHOLDS.lighthouse.accessibility}%
- **Lighthouse Best Practices:** ${THRESHOLDS.lighthouse.bestPractices}%
- **Lighthouse SEO:** ${THRESHOLDS.lighthouse.seo}%

## Next Steps

1. Address all recommendations
2. Monitor performance in production
3. Set up continuous performance monitoring
4. Regular performance audits
`;
  }

  // Run complete analysis
  async run() {
    logHeader('ProTipp V2 Performance Monitor');
    
    this.analyzeBuildTime();
    this.analyzeBundleSize();
    this.analyzeDependencies();
    await this.runLighthouseAudit();
    
    const report = this.generateReport();
    
    logHeader('Performance Analysis Complete');
    log(`Total bundle size: ${report.totalBundleSize}KB`, 'cyan');
    log(`Build time: ${report.buildTime}s`, 'cyan');
    log(`Recommendations: ${report.recommendations.length}`, 'cyan');
    
    if (report.recommendations.length > 0) {
      log('\n📋 Recommendations:', 'yellow');
      report.recommendations.forEach(rec => log(`  • ${rec}`, 'yellow'));
    }
    
    return report;
  }
}

// Main execution
async function main() {
  const monitor = new PerformanceMonitor();
  
  try {
    await monitor.run();
  } catch (error) {
    logError(`Performance monitoring failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = PerformanceMonitor;
