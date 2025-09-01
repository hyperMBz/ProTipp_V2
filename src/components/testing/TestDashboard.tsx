/**
 * Test Dashboard Component for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 * 
 * Comprehensive testing dashboard with real-time monitoring
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  Shield,
  Zap,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useTesting, TestingState, TestingActions } from '@/lib/hooks/use-testing';

export function TestDashboard() {
  const [state, actions] = useTesting();

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive testing and quality assurance for ProTipp V2
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={actions.runAllTests}
            disabled={state.isRunning}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Run All Tests
          </Button>
          {state.isRunning && (
            <Button
              onClick={actions.stopTests}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Tests
            </Button>
          )}
          <Button
            onClick={actions.clearResults}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Clear Results
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {state.isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Test Progress</span>
                <span className="text-sm text-muted-foreground">{state.progress}%</span>
              </div>
              <Progress value={state.progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{state.currentTest}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="unit">Unit Tests</TabsTrigger>
          <TabsTrigger value="integration">Integration Tests</TabsTrigger>
          <TabsTrigger value="performance">Performance Tests</TabsTrigger>
          <TabsTrigger value="security">Security Tests</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Test Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.results.length}</div>
                <p className="text-xs text-muted-foreground">
                  {state.results.filter(r => r.status === 'passed').length} passed
                </p>
              </CardContent>
            </Card>

            {/* Coverage Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {state.coverage?.summary.percentage.toFixed(1) || '0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {state.coverage?.summary.coveredStatements || 0} / {state.coverage?.summary.totalStatements || 0} statements
                </p>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {state.performance?.summary.avg_response_time || 0}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  {state.performance?.summary.passed || 0} / {state.performance?.summary.total_tests || 0} tests passed
                </p>
              </CardContent>
            </Card>

            {/* Security Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {state.security?.summary.total_vulnerabilities || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {state.security?.summary.critical_vulnerabilities || 0} critical
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>Latest test execution results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.results.slice(0, 5).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTestTypeIcon(result.test_type)}
                      <div>
                        <p className="font-medium">{result.test_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.duration_ms}ms • {new Date(result.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {state.results.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No test results available. Run tests to see results.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unit Tests Tab */}
        <TabsContent value="unit" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={actions.runUnitTests} disabled={state.isRunning}>
              Run Unit Tests
            </Button>
          </div>
          <TestResultsList 
            results={state.results.filter(r => r.test_type === 'unit')}
            suites={state.suites.filter(s => s.name.includes('Unit'))}
          />
        </TabsContent>

        {/* Integration Tests Tab */}
        <TabsContent value="integration" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={actions.runIntegrationTests} disabled={state.isRunning}>
              Run Integration Tests
            </Button>
          </div>
          <TestResultsList 
            results={state.results.filter(r => r.test_type === 'integration')}
            suites={state.suites.filter(s => s.name.includes('Integration'))}
          />
        </TabsContent>

        {/* Performance Tests Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={actions.runPerformanceTests} disabled={state.isRunning}>
              Run Performance Tests
            </Button>
          </div>
          {state.performance && <PerformanceResults performance={state.performance} />}
        </TabsContent>

        {/* Security Tests Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={actions.runSecurityTests} disabled={state.isRunning}>
              Run Security Tests
            </Button>
          </div>
          {state.security && <SecurityResults security={state.security} />}
        </TabsContent>

        {/* Coverage Tab */}
        <TabsContent value="coverage" className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={actions.runCoverageAnalysis} disabled={state.isRunning}>
              Analyze Coverage
            </Button>
          </div>
          {state.coverage && <CoverageResults coverage={state.coverage} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Test Results List Component
function TestResultsList({ results, suites }: { results: any[], suites: any[] }) {
  return (
    <div className="space-y-4">
      {suites.map((suite) => (
        <Card key={suite.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{suite.name}</CardTitle>
                <CardDescription>{suite.description}</CardDescription>
              </div>
              <Badge className={getStatusColor(suite.status)}>
                {suite.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Total Tests</p>
                <p className="text-muted-foreground">{suite.test_count}</p>
              </div>
              <div>
                <p className="font-medium">Passed</p>
                <p className="text-green-600">{suite.passed_count}</p>
              </div>
              <div>
                <p className="font-medium">Failed</p>
                <p className="text-red-600">{suite.failed_count}</p>
              </div>
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-muted-foreground">{suite.total_duration_ms}ms</p>
              </div>
            </div>
            {suite.coverage_percentage > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium">Coverage: {suite.coverage_percentage}%</p>
                <Progress value={suite.coverage_percentage} className="mt-2" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {suites.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No test suites available. Run tests to see results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Performance Results Component
function PerformanceResults({ performance }: { performance: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Load testing and performance validation results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">Total Tests</p>
              <p className="text-2xl font-bold">{performance.summary.total_tests}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Passed</p>
              <p className="text-2xl font-bold text-green-600">{performance.summary.passed}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-600">{performance.summary.failed}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Avg Response</p>
              <p className="text-2xl font-bold">{performance.summary.avg_response_time}ms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {performance.tests.map((test: any) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{test.name}</CardTitle>
                <Badge className={getStatusColor(test.status)}>
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
function SecurityResults({ security }: { security: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Security Summary</CardTitle>
          <CardDescription>Security vulnerability testing results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm font-medium">Total Tests</p>
              <p className="text-2xl font-bold">{security.summary.total_tests}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Critical</p>
              <p className="text-2xl font-bold text-red-600">{security.summary.critical_vulnerabilities}</p>
            </div>
            <div>
              <p className="text-sm font-medium">High</p>
              <p className="text-2xl font-bold text-orange-600">{security.summary.high_vulnerabilities}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Medium</p>
              <p className="text-2xl font-bold text-yellow-600">{security.summary.medium_vulnerabilities}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Low</p>
              <p className="text-2xl font-bold text-blue-600">{security.summary.low_vulnerabilities}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {security.tests.map((test: any) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{test.name}</CardTitle>
                <Badge className={getStatusColor(test.status)}>
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
                      {test.vulnerabilities.map((vuln: any) => (
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

// Coverage Results Component
function CoverageResults({ coverage }: { coverage: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Coverage Summary</CardTitle>
          <CardDescription>Code coverage analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">Statements</p>
              <p className="text-2xl font-bold">{coverage.summary.percentage.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                {coverage.summary.coveredStatements} / {coverage.summary.totalStatements}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Branches</p>
              <p className="text-2xl font-bold">
                {coverage.summary.totalBranches > 0 
                  ? ((coverage.summary.coveredBranches / coverage.summary.totalBranches) * 100).toFixed(1)
                  : '0'}%
              </p>
              <p className="text-xs text-muted-foreground">
                {coverage.summary.coveredBranches} / {coverage.summary.totalBranches}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Functions</p>
              <p className="text-2xl font-bold">
                {coverage.summary.totalFunctions > 0 
                  ? ((coverage.summary.coveredFunctions / coverage.summary.totalFunctions) * 100).toFixed(1)
                  : '0'}%
              </p>
              <p className="text-xs text-muted-foreground">
                {coverage.summary.coveredFunctions} / {coverage.summary.totalFunctions}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Lines</p>
              <p className="text-2xl font-bold">
                {coverage.summary.totalLines > 0 
                  ? ((coverage.summary.coveredLines / coverage.summary.totalLines) * 100).toFixed(1)
                  : '0'}%
              </p>
              <p className="text-xs text-muted-foreground">
                {coverage.summary.coveredLines} / {coverage.summary.totalLines}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="font-medium mb-2">Coverage Progress</p>
            <Progress value={coverage.summary.percentage} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {coverage.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggestions to improve test coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {coverage.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
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
