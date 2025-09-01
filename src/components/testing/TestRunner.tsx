/**
 * Test Runner Component for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 * 
 * Individual test execution and monitoring component
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  FileText,
  BarChart3,
  Zap,
  Shield,
  TrendingUp,
  Settings,
  Download
} from 'lucide-react';
import { useTesting } from '@/lib/hooks/use-testing';

interface TestRunnerProps {
  testType?: 'unit' | 'integration' | 'performance' | 'security' | 'e2e' | 'coverage';
  showDetails?: boolean;
  compact?: boolean;
}

export function TestRunner({ 
  testType = 'unit', 
  showDetails = true, 
  compact = false 
}: TestRunnerProps) {
  const [state, actions] = useTesting();
  const [showConfig, setShowConfig] = useState(false);

  const getTestTypeConfig = () => {
    switch (testType) {
      case 'unit':
        return {
          title: 'Unit Tests',
          description: 'Individual component and function testing',
          icon: <FileText className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          runAction: actions.runUnitTests
        };
      case 'integration':
        return {
          title: 'Integration Tests',
          description: 'Component interaction and API testing',
          icon: <BarChart3 className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          runAction: actions.runIntegrationTests
        };
      case 'performance':
        return {
          title: 'Performance Tests',
          description: 'Load testing and performance validation',
          icon: <Zap className="h-5 w-5" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          runAction: actions.runPerformanceTests
        };
      case 'security':
        return {
          title: 'Security Tests',
          description: 'Vulnerability scanning and security validation',
          icon: <Shield className="h-5 w-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          runAction: actions.runSecurityTests
        };
      case 'e2e':
        return {
          title: 'End-to-End Tests',
          description: 'Complete user workflow testing',
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          runAction: actions.runE2ETests
        };
      case 'coverage':
        return {
          title: 'Coverage Analysis',
          description: 'Code coverage measurement and analysis',
          icon: <BarChart3 className="h-5 w-5" />,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          runAction: actions.runCoverageAnalysis
        };
      default:
        return {
          title: 'Tests',
          description: 'Test execution',
          icon: <FileText className="h-5 w-5" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          runAction: actions.runAllTests
        };
    }
  };

  const config = getTestTypeConfig();
  const isRunning = state.isRunning && state.currentTestType === testType;
  const results = state.results.filter(r => r.test_type === testType);
  const passedCount = results.filter(r => r.status === 'passed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

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

  if (compact) {
    return (
      <Card className={`${config.bgColor} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={config.color}>{config.icon}</div>
              <div>
                <h3 className="font-medium">{config.title}</h3>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {results.length > 0 && (
                <div className="text-right">
                  <p className="text-sm font-medium">{passedCount}/{results.length}</p>
                  <p className="text-xs text-muted-foreground">passed</p>
                </div>
              )}
              <Button
                onClick={config.runAction}
                disabled={state.isRunning}
                size="sm"
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Square className="h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {isRunning && (
            <div className="mt-3">
              <Progress value={state.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{state.currentTest}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <div className={config.color}>{config.icon}</div>
            </div>
            <div>
              <CardTitle>{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={config.runAction}
              disabled={state.isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop Tests
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Tests
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Configuration Panel */}
        {showConfig && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-3">Test Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Timeout</p>
                <p className="text-muted-foreground">30 seconds</p>
              </div>
              <div>
                <p className="font-medium">Retries</p>
                <p className="text-muted-foreground">3 attempts</p>
              </div>
              <div>
                <p className="font-medium">Parallel Execution</p>
                <p className="text-muted-foreground">Enabled</p>
              </div>
              <div>
                <p className="font-medium">Coverage Threshold</p>
                <p className="text-muted-foreground">80%</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Test Progress</span>
              <span className="text-sm text-muted-foreground">{state.progress}%</span>
            </div>
            <Progress value={state.progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{state.currentTest}</p>
          </div>
        )}

        {/* Error Alert */}
        {state.error && state.currentTestType === testType && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Test Results</h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={actions.clearResults}>
                  <RefreshCw className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{results.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">{passedCount}</p>
                <p className="text-sm text-muted-foreground">Passed</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>

            {/* Detailed Results */}
            {showDetails && (
              <div className="space-y-2">
                <h5 className="font-medium">Recent Test Results</h5>
                {results.slice(0, 5).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.test_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.duration_ms}ms • {new Date(result.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
                {results.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Showing 5 of {results.length} results
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {results.length === 0 && !isRunning && (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              {config.icon}
            </div>
            <p className="text-muted-foreground">No test results available</p>
            <p className="text-sm text-muted-foreground">Run tests to see results</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Test Suite Runner Component
interface TestSuiteRunnerProps {
  suiteName: string;
  description?: string;
  testFiles: string[];
  onRun?: () => void;
  onStop?: () => void;
  isRunning?: boolean;
  results?: any[];
}

export function TestSuiteRunner({
  suiteName,
  description,
  testFiles,
  onRun,
  onStop,
  isRunning = false,
  results = []
}: TestSuiteRunnerProps) {
  const passedCount = results.filter(r => r.status === 'passed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{suiteName}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button
            onClick={isRunning ? onStop : onRun}
            disabled={!onRun && !onStop}
            size="sm"
          >
            {isRunning ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Suite
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Test Files */}
          <div>
            <h4 className="font-medium mb-2">Test Files ({testFiles.length})</h4>
            <div className="space-y-1">
              {testFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{file}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          {results.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Results</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-2 border rounded">
                  <p className="text-lg font-bold">{results.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-2 border rounded">
                  <p className="text-lg font-bold text-green-600">{passedCount}</p>
                  <p className="text-xs text-muted-foreground">Passed</p>
                </div>
                <div className="text-center p-2 border rounded">
                  <p className="text-lg font-bold text-red-600">{failedCount}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
