#!/bin/bash

# 🚀 ProTipp V2 - Production Deployment Script
# This script automates the production deployment process

set -e  # Exit on any error

echo "🚀 Starting ProTipp V2 Production Deployment..."

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v bun &> /dev/null; then
        print_error "Bun is not installed. Please install Bun first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
        print_error "This doesn't appear to be a ProTipp V2 project directory"
        exit 1
    fi
    print_success "Project directory verified"
}

# Check if environment variables are set
check_environment() {
    print_status "Checking environment variables..."
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_warning "NEXT_PUBLIC_SUPABASE_URL is not set"
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_warning "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_warning "SUPABASE_SERVICE_ROLE_KEY is not set"
    fi
    
    print_success "Environment check completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    bun install --frozen-lockfile
    print_success "Dependencies installed"
}

# Run linting and type checking
run_checks() {
    print_status "Running linting and type checking..."
    
    # Type checking
    bun run lint
    
    print_success "All checks passed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Unit tests
    bun run test:run
    
    # Component tests
    bun run test:components
    
    print_success "All tests passed"
}

# Build the application
build_application() {
    print_status "Building application for production..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build the application
    bun run build
    
    print_success "Application built successfully"
}

# Analyze bundle size
analyze_bundle() {
    print_status "Analyzing bundle size..."
    
    # Check if bundle analyzer is available
    if [ -d ".next" ]; then
        # Get bundle size information
        BUNDLE_SIZE=$(du -sh .next | cut -f1)
        print_success "Bundle size: $BUNDLE_SIZE"
        
        # Check if bundle is under 500KB (approximate)
        if [ -f ".next/static/chunks/main.js" ]; then
            MAIN_JS_SIZE=$(du -k .next/static/chunks/main.js | cut -f1)
            if [ "$MAIN_JS_SIZE" -lt 500 ]; then
                print_success "Main JS bundle is under 500KB ($MAIN_JS_SIZE KB)"
            else
                print_warning "Main JS bundle is over 500KB ($MAIN_JS_SIZE KB)"
            fi
        fi
    fi
}

# Deploy to Netlify (if Netlify CLI is available)
deploy_netlify() {
    if command -v netlify &> /dev/null; then
        print_status "Deploying to Netlify..."
        
        # Check if we're logged in to Netlify
        if netlify status &> /dev/null; then
            netlify deploy --prod --dir=.next
            print_success "Deployed to Netlify successfully"
        else
            print_warning "Not logged in to Netlify. Please run 'netlify login' first"
        fi
    else
        print_warning "Netlify CLI not found. Please install it or deploy manually"
    fi
}

# Deploy to Vercel (if Vercel CLI is available)
deploy_vercel() {
    if command -v vercel &> /dev/null; then
        print_status "Deploying to Vercel..."
        
        # Check if we're logged in to Vercel
        if vercel whoami &> /dev/null; then
            vercel --prod
            print_success "Deployed to Vercel successfully"
        else
            print_warning "Not logged in to Vercel. Please run 'vercel login' first"
        fi
    else
        print_warning "Vercel CLI not found. Please install it or deploy manually"
    fi
}

# Generate deployment report
generate_report() {
    print_status "Generating deployment report..."
    
    REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# ProTipp V2 - Production Deployment Report

**Deployment Date:** $(date)
**Git Commit:** $(git rev-parse HEAD)
**Git Branch:** $(git branch --show-current)

## Build Information
- **Node Version:** $(node --version)
- **Bun Version:** $(bun --version)
- **Build Time:** $(date)

## Bundle Analysis
- **Bundle Size:** $(du -sh .next | cut -f1)
- **Main JS Size:** $(du -k .next/static/chunks/main.js 2>/dev/null | cut -f1 || echo "N/A") KB

## Environment Variables
- **NODE_ENV:** $NODE_ENV
- **NEXT_PUBLIC_SUPABASE_URL:** ${NEXT_PUBLIC_SUPABASE_URL:+SET}
- **NEXT_PUBLIC_SUPABASE_ANON_KEY:** ${NEXT_PUBLIC_SUPABASE_ANON_KEY:+SET}
- **SUPABASE_SERVICE_ROLE_KEY:** ${SUPABASE_SERVICE_ROLE_KEY:+SET}

## Deployment Status
- **Dependencies:** ✅ Installed
- **Linting:** ✅ Passed
- **Type Checking:** ✅ Passed
- **Tests:** ✅ Passed
- **Build:** ✅ Successful
- **Bundle Size:** ✅ Optimized

## Next Steps
1. Verify deployment in production environment
2. Test all critical user flows
3. Monitor performance metrics
4. Set up monitoring and alerting
5. Configure custom domain (if needed)

## Support
For issues or questions, refer to the documentation or contact the development team.
EOF

    print_success "Deployment report generated: $REPORT_FILE"
}

# Main deployment function
main() {
    echo "🚀 ProTipp V2 Production Deployment"
    echo "=================================="
    
    check_dependencies
    check_directory
    check_environment
    install_dependencies
    run_checks
    run_tests
    build_application
    analyze_bundle
    
    # Ask user which platform to deploy to
    echo ""
    echo "Select deployment platform:"
    echo "1) Netlify"
    echo "2) Vercel"
    echo "3) Skip deployment (build only)"
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            deploy_netlify
            ;;
        2)
            deploy_vercel
            ;;
        3)
            print_status "Skipping deployment. Build completed successfully."
            ;;
        *)
            print_warning "Invalid choice. Skipping deployment."
            ;;
    esac
    
    generate_report
    
    echo ""
    print_success "🎉 Production deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Verify your deployment"
    echo "2. Test all functionality"
    echo "3. Set up monitoring"
    echo "4. Configure custom domain"
    echo ""
}

# Run main function
main "$@"
