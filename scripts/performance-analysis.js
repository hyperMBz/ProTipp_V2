/**
 * Performance Analysis Script
 * Sprint 11 - Tesztelési Hiányosságok Javítása
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Performance Analysis...\n');

// Bundle size analysis
function analyzeBundleSize() {
  console.log('📦 Analyzing bundle size...');
  
  try {
    // Build the application
    console.log('Building application...');
    execSync('bun run build', { stdio: 'inherit' });
    
    // Analyze bundle size
    const buildDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(buildDir)) {
      const stats = analyzeDirectory(buildDir);
      console.log('Bundle size analysis:');
      console.log(`Total size: ${formatBytes(stats.totalSize)}`);
      console.log(`File count: ${stats.fileCount}`);
      console.log(`Largest files:`);
      stats.largestFiles.slice(0, 10).forEach(file => {
        console.log(`  ${file.name}: ${formatBytes(file.size)}`);
      });
    }
  } catch (error) {
    console.error('Bundle size analysis failed:', error.message);
  }
}

// Memory usage analysis
function analyzeMemoryUsage() {
  console.log('\n🧠 Analyzing memory usage...');
  
  const memoryUsage = process.memoryUsage();
  console.log('Memory usage:');
  console.log(`RSS: ${formatBytes(memoryUsage.rss)}`);
  console.log(`Heap Used: ${formatBytes(memoryUsage.heapUsed)}`);
  console.log(`Heap Total: ${formatBytes(memoryUsage.heapTotal)}`);
  console.log(`External: ${formatBytes(memoryUsage.external)}`);
}

// Performance recommendations
function generateRecommendations() {
  console.log('\n💡 Performance Recommendations:');
  
  const recommendations = [
    '1. Implement lazy loading for components',
    '2. Use dynamic imports for large libraries',
    '3. Optimize images with next/image',
    '4. Implement code splitting',
    '5. Use React.memo for expensive components',
    '6. Implement virtual scrolling for large lists',
    '7. Use Web Workers for heavy computations',
    '8. Implement service worker for caching',
    '9. Optimize bundle with tree shaking',
    '10. Use CDN for static assets'
  ];
  
  recommendations.forEach(rec => console.log(rec));
}

// Helper functions
function analyzeDirectory(dir) {
  let totalSize = 0;
  let fileCount = 0;
  const files = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDir(itemPath);
      } else {
        totalSize += stat.size;
        fileCount++;
        files.push({
          name: path.relative(process.cwd(), itemPath),
          size: stat.size
        });
      }
    });
  }
  
  scanDir(dir);
  
  return {
    totalSize,
    fileCount,
    largestFiles: files.sort((a, b) => b.size - a.size)
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run analysis
async function runAnalysis() {
  try {
    analyzeBundleSize();
    analyzeMemoryUsage();
    generateRecommendations();
    
    console.log('\n✅ Performance analysis completed!');
  } catch (error) {
    console.error('❌ Performance analysis failed:', error);
    process.exit(1);
  }
}

runAnalysis();
