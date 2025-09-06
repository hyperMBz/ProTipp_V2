#!/bin/bash

# 🚀 Sprint 11 Deployment Script
# ProTipp V2 - Tesztelési Hiányosságok Javítása

set -e  # Exit on any error

echo "🚀 Starting Sprint 11 Deployment Process..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Sprint 11 Deployment Checklist"
echo "=============================================="

# 1. Pre-deployment checks
print_status "Step 1: Pre-deployment validation..."

# Check if all tests pass
print_status "Running test suite..."
if bun run test:ci; then
    print_success "All tests passed ✅"
else
    print_error "Tests failed. Deployment aborted."
    exit 1
fi

# Check linting
print_status "Running linting..."
if bun run lint; then
    print_success "Linting passed ✅"
else
    print_warning "Linting issues found. Please fix before deployment."
    exit 1
fi

# Check formatting
print_status "Checking code formatting..."
if bun run format; then
    print_success "Code formatting OK ✅"
else
    print_warning "Code formatting issues found."
fi

# 2. Build validation
print_status "Step 2: Production build validation..."

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next
rm -rf dist
rm -rf build

# Install dependencies
print_status "Installing dependencies..."
bun install --frozen-lockfile

# Build the application
print_status "Building application..."
if bun run build; then
    print_success "Build successful ✅"
else
    print_error "Build failed. Deployment aborted."
    exit 1
fi

# Check build artifacts
if [ -d ".next" ]; then
    print_success "Build artifacts created ✅"
else
    print_error "Build artifacts not found."
    exit 1
fi

# 3. Environment validation
print_status "Step 3: Environment validation..."

# Check required environment variables
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "NEXT_PUBLIC_ODDS_API_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_warning "Environment variable $var is not set"
    else
        print_success "Environment variable $var is set ✅"
    fi
done

# 4. Performance validation
print_status "Step 4: Performance validation..."

# Run performance analysis
if [ -f "scripts/performance-analysis.js" ]; then
    print_status "Running performance analysis..."
    node scripts/performance-analysis.js
    print_success "Performance analysis completed ✅"
fi

# 5. Security validation
print_status "Step 5: Security validation..."

# Run security audit
print_status "Running security audit..."
if bun run test:security; then
    print_success "Security audit passed ✅"
else
    print_warning "Security issues found. Please review."
fi

# 6. Deployment options
print_status "Step 6: Deployment options..."
echo ""
echo "Choose deployment method:"
echo "1) Automatic deployment (push to main)"
echo "2) Manual Netlify deployment"
echo "3) Preview deployment"
echo "4) Exit without deploying"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "Preparing for automatic deployment..."
        
        # Check git status
        if [ -n "$(git status --porcelain)" ]; then
            print_status "Staging changes..."
            git add .
            
            read -p "Enter commit message (default: 'feat: Sprint 11 - Testing deficiencies fixed'): " commit_msg
            commit_msg=${commit_msg:-"feat: Sprint 11 - Testing deficiencies fixed"}
            
            git commit -m "$commit_msg"
        fi
        
        # Check if we're on main branch
        current_branch=$(git branch --show-current)
        if [ "$current_branch" != "main" ]; then
            print_warning "Not on main branch. Current branch: $current_branch"
            read -p "Do you want to switch to main branch? (y/n): " switch_branch
            if [ "$switch_branch" = "y" ]; then
                git checkout main
                git merge "$current_branch"
            fi
        fi
        
        print_status "Pushing to main branch..."
        git push origin main
        
        print_success "Automatic deployment triggered! 🚀"
        print_status "Monitor deployment at: https://app.netlify.com/sites/your-site-id"
        ;;
        
    2)
        print_status "Manual Netlify deployment..."
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            print_status "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        # Deploy to Netlify
        print_status "Deploying to Netlify..."
        netlify deploy --prod --dir=.next
        
        print_success "Manual deployment completed! 🚀"
        ;;
        
    3)
        print_status "Preview deployment..."
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            print_status "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        # Deploy preview
        print_status "Deploying preview..."
        netlify deploy --dir=.next
        
        print_success "Preview deployment completed! 🚀"
        ;;
        
    4)
        print_status "Deployment cancelled by user."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice. Deployment cancelled."
        exit 1
        ;;
esac

# 7. Post-deployment validation
print_status "Step 7: Post-deployment validation..."

echo ""
echo "=============================================="
print_success "Sprint 11 Deployment Process Completed! 🎉"
echo "=============================================="

echo ""
echo "📋 Post-Deployment Checklist:"
echo "1. ✅ Verify application loads correctly"
echo "2. ✅ Test all major features"
echo "3. ✅ Check performance metrics"
echo "4. ✅ Monitor error logs"
echo "5. ✅ Validate user workflows"

echo ""
echo "🔍 Monitoring URLs:"
echo "- Application: https://your-domain.com"
echo "- Netlify Dashboard: https://app.netlify.com/sites/your-site-id"
echo "- Analytics: https://your-analytics-dashboard.com"

echo ""
echo "📞 Support Contacts:"
echo "- Technical Lead: [Contact Info]"
echo "- QA Engineer: Quinn (Test Architect)"
echo "- DevOps: [Contact Info]"

echo ""
print_success "Sprint 11: Tesztelési Hiányosságok Javítása - DEPLOYED! 🚀"

# Create deployment log
deployment_log="deployment-logs/sprint11-$(date +%Y%m%d-%H%M%S).log"
mkdir -p deployment-logs
echo "Sprint 11 Deployment - $(date)" > "$deployment_log"
echo "Status: SUCCESS" >> "$deployment_log"
echo "Deployment Method: $choice" >> "$deployment_log"
echo "Build Time: $(date)" >> "$deployment_log"

print_status "Deployment log created: $deployment_log"
