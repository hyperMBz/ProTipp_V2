/**
 * Test Results Component for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 * 
 * Detailed test results display and analysis component
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  FileText,
  BarChart3,
  Zap,
  Shield,
  TrendingUp,
  Download,
  Filter,
  Search,
  Calendar,
  Timer,
  Info,
  ExternalLink
} from 'lucide-react';
import { useTestResults, useCoverageData, usePerformanceData, useSecurityData } from '@/lib/hooks/use-testing';

interface TestResultsProps {
  testType?: 'all' | 'unit' | 'integration' | 'performance' | 'security' | 'e2e';
  showFilters?: boolean;
  maxResults?: number;
}

export function TestResults({ 
  testType = 'all', 
  showFilters = true, 
  maxResults = 50 
}: TestResultsProps) {
  const results = useTestResults();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'duration' | 'name'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter results based on props and filters
  const filteredResults = results
    .filter(result => {
      if (testType !== 'all' && result.test_type !== testType) return false;
      if (statusFilter !== 'all' && result.status !== statusFilter) return false;
      if (searchTerm && !result.test_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'duration':
          comparison = a.duration_ms - b.duration_ms;
          break;
        case 'name':
          comparison = a.test_name.localeCompare(b.test_name);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    })
    .slice(0, maxResults);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'fail':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'unit':
        return <FileText className="h-4 w-4" />;
      case 'integration':
        return <BarChart3 className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'e2e':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(filteredResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-results-${testType}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: filteredResults.length,
    passed: filteredResults.filter(r => r.status === 'passed').length,
    failed: filteredResults.filter(r => r.status === 'failed').length,
    warning: filteredResults.filter(r => r.status === 'warning').length,
    avgDuration: filteredResults.length > 0 
      ? Math.round(filteredResults.reduce((sum, r) => sum + r.duration_ms, 0) / filteredResults.length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test Results</h2>
          <p className="text-muted-foreground">
            {testType === 'all' ? 'All test results' : `${testType} test results`}
          </p>
        </div>
        <Button onClick={exportResults} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Results
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Tests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
              <p className="text-sm text-muted-foreground">Passed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.avgDuration}ms</p>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search test names..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="warning">Warning</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="timestamp">Sort by Time</option>
                  <option value="duration">Sort by Duration</option>
                  <option value="name">Sort by Name</option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.map((result) => (
          <TestResultCard key={result.id} result={result} />
        ))}
        
        {filteredResults.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No test results found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Run some tests to see results'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination Info */}
      {results.length > maxResults && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredResults.length} of {results.length} results
        </div>
      )}
    </div>
  );
}

// Individual Test Result Card
function TestResultCard({ result }: { result: any }) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'fail':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'unit':
        return <FileText className="h-4 w-4" />;
      case 'integration':
        return <BarChart3 className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'e2e':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getStatusIcon(result.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{result.test_name}</h3>
                <Badge className={getStatusColor(result.status)}>
                  {result.status}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {getTestTypeIcon(result.test_type)}
                  <span className="text-sm">{result.test_type}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  <span>{result.duration_ms}ms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(result.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {result.error && (
                <div className="mt-2">
                  <Alert variant="destructive" className="py-2">
                    <XCircle className="h-3 w-3" />
                    <AlertDescription className="text-sm">
                      {result.error}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {showDetails && result.details && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{result.details}</pre>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {result.details && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Details'}
              </Button>
            )}
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Coverage Results Component
export function CoverageResults() {
  const coverage = useCoverageData();

  if (!coverage) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No coverage data available</p>
          <p className="text-sm text-muted-foreground">Run coverage analysis to see results</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coverage Analysis</h2>
          <p className="text-muted-foreground">Code coverage measurement and analysis</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Coverage
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {coverage.summary.percentage.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Overall Coverage</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {coverage.summary.coveredStatements}
              </p>
              <p className="text-sm text-muted-foreground">Covered Statements</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {coverage.summary.totalStatements}
              </p>
              <p className="text-sm text-muted-foreground">Total Statements</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {coverage.files.length}
              </p>
              <p className="text-sm text-muted-foreground">Files Analyzed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {coverage.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Coverage Recommendations</CardTitle>
            <CardDescription>Suggestions to improve test coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {coverage.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Performance Results Component
export function PerformanceResults() {
  const performance = usePerformanceData();

  if (!performance) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No performance data available</p>
          <p className="text-sm text-muted-foreground">Run performance tests to see results</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Analysis</h2>
          <p className="text-muted-foreground">Load testing and performance validation results</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Performance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {performance.summary.total_tests}
              </p>
              <p className="text-sm text-muted-foreground">Total Tests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {performance.summary.passed}
              </p>
              <p className="text-sm text-muted-foreground">Passed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {performance.summary.failed}
              </p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {performance.summary.avg_response_time}ms
              </p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {performance.tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{test.name}</CardTitle>
                <Badge className={test.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {test.status}
                </Badge>
              </div>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Concurrent Users</span>
                  <span className="text-sm font-medium">{test.concurrent_users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Duration</span>
                  <span className="text-sm font-medium">{test.duration_seconds}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Response Time</span>
                  <span className="text-sm font-medium">{test.metrics.avg_response_time}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="text-sm font-medium">{test.metrics.success_rate.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Security Results Component
export function SecurityResults() {
  const security = useSecurityData();

  if (!security) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No security data available</p>
          <p className="text-sm text-muted-foreground">Run security tests to see results</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Analysis</h2>
          <p className="text-muted-foreground">Security vulnerability testing results</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Security
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {security.summary.total_tests}
              </p>
              <p className="text-sm text-muted-foreground">Total Tests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {security.summary.critical_vulnerabilities}
              </p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {security.summary.high_vulnerabilities}
              </p>
              <p className="text-sm text-muted-foreground">High</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {security.summary.medium_vulnerabilities}
              </p>
              <p className="text-sm text-muted-foreground">Medium</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {security.summary.low_vulnerabilities}
              </p>
              <p className="text-sm text-muted-foreground">Low</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {security.tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{test.name}</CardTitle>
                <Badge className={test.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {test.status}
                </Badge>
              </div>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Total Checks</p>
                    <p className="text-muted-foreground">{test.totalChecks}</p>
                  </div>
                  <div>
                    <p className="font-medium">Passed</p>
                    <p className="text-green-600">{test.passedChecks}</p>
                  </div>
                  <div>
                    <p className="font-medium">Failed</p>
                    <p className="text-red-600">{test.failedChecks}</p>
                  </div>
                </div>
                
                {test.vulnerabilities.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Vulnerabilities Found:</p>
                    <div className="space-y-2">
                      {test.vulnerabilities.map((vuln) => (
                        <div key={vuln.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{vuln.title}</p>
                              <p className="text-sm text-muted-foreground">{vuln.description}</p>
                            </div>
                            <Badge className={getStatusColor(vuln.severity)}>
                              {vuln.severity}
                            </Badge>
                          </div>
                          {vuln.recommendation && (
                            <p className="text-sm text-blue-600 mt-2">
                              <strong>Recommendation:</strong> {vuln.recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Helper function for status colors
function getStatusColor(status: string) {
  switch (status) {
    case 'pass':
    case 'passed':
      return 'bg-green-100 text-green-800';
    case 'fail':
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
