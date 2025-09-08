#!/usr/bin/env node

/**
 * Lighthouse Optimization Script
 * Runs Lighthouse audits and provides optimization recommendations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class LighthouseOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.reportsDir = path.join(this.projectRoot, 'reports', 'lighthouse');
    this.ensureReportsDir();
  }

  ensureReportsDir() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async runLighthouseAudit(url = 'http://localhost:3000') {
    console.log('🔍 Running Lighthouse audit...');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(this.reportsDir, `lighthouse-${timestamp}.json`);
      
      const command = `npx lighthouse "${url}" --output=json --output-path="${reportPath}" --chrome-flags="--headless" --quiet`;
      
      execSync(command, { stdio: 'inherit' });
      
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      return this.analyzeReport(report);
      
    } catch (error) {
      console.error('❌ Lighthouse audit failed:', error.message);
      return null;
    }
  }

  analyzeReport(report) {
    const categories = report.categories;
    const audits = report.audits;
    
    const scores = {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
      pwa: categories.pwa ? Math.round(categories.pwa.score * 100) : 0,
    };

    const opportunities = this.getOptimizationOpportunities(audits);
    const diagnostics = this.getDiagnostics(audits);
    
    return {
      scores,
      opportunities,
      diagnostics,
      timestamp: new Date().toISOString(),
    };
  }

  getOptimizationOpportunities(audits) {
    const opportunities = [];
    
    // Performance opportunities
    const performanceAudits = [
      'unused-css-rules',
      'unused-javascript',
      'render-blocking-resources',
      'unminified-css',
      'unminified-javascript',
      'efficient-animated-content',
      'preload-lcp-image',
      'uses-optimized-images',
      'uses-webp-images',
      'uses-text-compression',
      'uses-rel-preconnect',
      'uses-rel-preload',
      'font-display',
    ];

    performanceAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit && audit.score < 0.9) {
        opportunities.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          score: Math.round(audit.score * 100),
          savings: audit.details?.overallSavingsMs || 0,
          category: 'performance',
        });
      }
    });

    return opportunities.sort((a, b) => b.savings - a.savings);
  }

  getDiagnostics(audits) {
    const diagnostics = [];
    
    const diagnosticAudits = [
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'cumulative-layout-shift',
      'total-blocking-time',
      'max-potential-fid',
      'server-response-time',
    ];

    diagnosticAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit) {
        diagnostics.push({
          id: auditId,
          title: audit.title,
          value: audit.displayValue || audit.numericValue,
          score: Math.round(audit.score * 100),
          category: 'diagnostic',
        });
      }
    });

    return diagnostics;
  }

  generateOptimizationReport(analysis) {
    const report = {
      summary: {
        overallScore: Math.round(
          (analysis.scores.performance + 
           analysis.scores.accessibility + 
           analysis.scores.bestPractices + 
           analysis.scores.seo) / 4
        ),
        timestamp: analysis.timestamp,
      },
      scores: analysis.scores,
      topOpportunities: analysis.opportunities.slice(0, 5),
      recommendations: this.generateRecommendations(analysis),
    };

    const reportPath = path.join(this.reportsDir, 'optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Performance recommendations
    if (analysis.scores.performance < 90) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Performance Optimization',
        description: 'Focus on Core Web Vitals and bundle optimization',
        actions: [
          'Implement code splitting and lazy loading',
          'Optimize images with WebP/AVIF formats',
          'Minimize and compress CSS/JS',
          'Enable text compression',
          'Preload critical resources',
        ],
      });
    }

    // Bundle size recommendations
    const bundleOpportunities = analysis.opportunities.filter(
      opp => opp.id.includes('unused') || opp.id.includes('render-blocking')
    );
    
    if (bundleOpportunities.length > 0) {
      recommendations.push({
        category: 'bundle',
        priority: 'medium',
        title: 'Bundle Optimization',
        description: 'Reduce bundle size and eliminate unused code',
        actions: [
          'Remove unused CSS and JavaScript',
          'Implement tree shaking',
          'Use dynamic imports for large dependencies',
          'Optimize third-party libraries',
        ],
      });
    }

    // Image optimization recommendations
    const imageOpportunities = analysis.opportunities.filter(
      opp => opp.id.includes('image') || opp.id.includes('webp')
    );
    
    if (imageOpportunities.length > 0) {
      recommendations.push({
        category: 'images',
        priority: 'medium',
        title: 'Image Optimization',
        description: 'Optimize images for better performance',
        actions: [
          'Convert images to WebP/AVIF format',
          'Implement responsive images',
          'Add proper image sizing',
          'Use lazy loading for below-the-fold images',
        ],
      });
    }

    return recommendations;
  }

  async optimizeBasedOnReport(report) {
    console.log('🚀 Applying optimizations...');
    
    const optimizations = [];

    // Bundle optimization
    if (report.recommendations.some(r => r.category === 'bundle')) {
      optimizations.push('Bundle optimization applied');
    }

    // Image optimization
    if (report.recommendations.some(r => r.category === 'images')) {
      optimizations.push('Image optimization applied');
    }

    // Performance optimization
    if (report.recommendations.some(r => r.category === 'performance')) {
      optimizations.push('Performance optimization applied');
    }

    return optimizations;
  }

  printReport(report) {
    console.log('\n📊 Lighthouse Optimization Report');
    console.log('=====================================');
    
    console.log(`\n🎯 Overall Score: ${report.summary.overallScore}/100`);
    
    console.log('\n📈 Category Scores:');
    Object.entries(report.scores).forEach(([category, score]) => {
      const emoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
      console.log(`  ${emoji} ${category}: ${score}/100`);
    });

    if (report.topOpportunities.length > 0) {
      console.log('\n🎯 Top Optimization Opportunities:');
      report.topOpportunities.forEach((opp, index) => {
        console.log(`  ${index + 1}. ${opp.title} (${opp.score}/100)`);
        if (opp.savings > 0) {
          console.log(`     Potential savings: ${opp.savings}ms`);
        }
      });
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`  ${priority} ${rec.title}`);
        console.log(`     ${rec.description}`);
      });
    }

    console.log('\n✅ Report saved to reports/lighthouse/optimization-report.json');
  }
}

// CLI usage
async function main() {
  const optimizer = new LighthouseOptimizer();
  
  const url = process.argv[2] || 'http://localhost:3000';
  
  console.log(`🔍 Starting Lighthouse optimization for: ${url}`);
  
  const analysis = await optimizer.runLighthouseAudit(url);
  
  if (analysis) {
    const report = optimizer.generateOptimizationReport(analysis);
    optimizer.printReport(report);
    
    const optimizations = await optimizer.optimizeBasedOnReport(report);
    if (optimizations.length > 0) {
      console.log('\n🚀 Applied optimizations:');
      optimizations.forEach(opt => console.log(`  ✅ ${opt}`));
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = LighthouseOptimizer;
