/**
 * Testing Hooks for ProTipp V2
 * Story 1.10: Testing and Quality Assurance
 * 
 * React hooks for testing functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { getTestRunner, TestRunnerConfig, TestResult, TestSuite } from '../testing/test-runner';
import { coverageAnalyzer, CoverageReport } from '../testing/coverage-analyzer';
import { performanceTester, PerformanceReport } from '../testing/performance-tester';
import { securityTester, SecurityReport } from '../testing/security-tester';

export interface TestingState {
  isRunning: boolean;
  progress: number;
  currentTest: string;
  results: TestResult[];
  suites: TestSuite[];
  coverage: CoverageReport | null;
  performance: PerformanceReport | null;
  security: SecurityReport | null;
  error: string | null;
}

export interface TestingActions {
  runAllTests: () => Promise<void>;
  runUnitTests: () => Promise<void>;
  runIntegrationTests: () => Promise<void>;
  runPerformanceTests: () => Promise<void>;
  runSecurityTests: () => Promise<void>;
  runCoverageAnalysis: () => Promise<void>;
  stopTests: () => void;
  clearResults: () => void;
}

export function useTesting(config?: TestRunnerConfig): [TestingState, TestingActions] {
  const [state, setState] = useState<TestingState>({
    isRunning: false,
    progress: 0,
    currentTest: '',
    results: [],
    suites: [],
    coverage: null,
    performance: null,
    security: null,
    error: null
  });

  const testRunner = getTestRunner(config);

  const updateProgress = useCallback((progress: number, currentTest: string) => {
    setState(prev => ({
      ...prev,
      progress,
      currentTest
    }));
  }, []);

  const runAllTests = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      progress: 0,
      currentTest: 'Initializing test suite...',
      error: null
    }));

    try {
      updateProgress(10, 'Running unit tests...');
      const unitResults = await testRunner.runAllTests();
      
      updateProgress(30, 'Running coverage analysis...');
      const coverageResults = await coverageAnalyzer.analyzeCoverage();
      
      updateProgress(50, 'Running performance tests...');
      const performanceResults = await performanceTester.runPerformanceTests();
      
      updateProgress(70, 'Running security tests...');
      const securityResults = await securityTester.runSecurityTests();
      
      updateProgress(90, 'Generating reports...');
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: 100,
        currentTest: 'Tests completed',
        results: unitResults.results,
        suites: unitResults.suites,
        coverage: coverageResults,
        performance: performanceResults,
        security: securityResults
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, [testRunner, updateProgress]);

  const runUnitTests = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      progress: 0,
      currentTest: 'Running unit tests...',
      error: null
    }));

    try {
      const results = await testRunner.runAllTests();
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: 100,
        currentTest: 'Unit tests completed',
        results: results.results.filter(r => r.test_type === 'unit'),
        suites: results.suites.filter(s => s.name.includes('Unit'))
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unit tests failed'
      }));
    }
  }, [testRunner]);

  const runIntegrationTests = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      progress: 0,
      currentTest: 'Running integration tests...',
      error: null
    }));

    try {
      const results = await testRunner.runAllTests();
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: 100,
        currentTest: 'Integration tests completed',
        results: results.results.filter(r => r.test_type === 'integration'),
        suites: results.suites.filter(s => s.name.includes('Integration'))
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Integration tests failed'
      }));
    }
  }, [testRunner]);

  const runPerformanceTests = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      progress: 0,
      currentTest: 'Running performance tests...',
      error: null
    }));

    try {
      const results = await performanceTester.runPerformanceTests();
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: 100,
        currentTest: 'Performance tests completed',
        performance: results
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Performance tests failed'
      }));
    }
  }, []);

  const runSecurityTests = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      progress: 0,
      currentTest: 'Running security tests...',
      error: null
    }));

    try {
      const results = await securityTester.runSecurityTests();
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: 100,
        currentTest: 'Security tests completed',
        security: results
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Security tests failed'
      }));
    }
  }, []);

  const runCoverageAnalysis = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      progress: 0,
      currentTest: 'Analyzing coverage...',
      error: null
    }));

    try {
      const results = await coverageAnalyzer.analyzeCoverage();
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: 100,
        currentTest: 'Coverage analysis completed',
        coverage: results
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Coverage analysis failed'
      }));
    }
  }, []);

  const stopTests = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      currentTest: 'Tests stopped by user'
    }));
  }, []);

  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      suites: [],
      coverage: null,
      performance: null,
      security: null,
      error: null
    }));
  }, []);

  return [state, {
    runAllTests,
    runUnitTests,
    runIntegrationTests,
    runPerformanceTests,
    runSecurityTests,
    runCoverageAnalysis,
    stopTests,
    clearResults
  }];
}

export function useTestResults() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const loadResults = useCallback(async () => {
    setLoading(true);
    try {
      // Load results from saved file
      const response = await fetch('/api/testing/results');
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Failed to load test results:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  return { results, loading, reload: loadResults };
}

export function useCoverageData() {
  const [coverage, setCoverage] = useState<CoverageReport | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCoverage = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/testing/coverage');
      if (response.ok) {
        const data = await response.json();
        setCoverage(data);
      }
    } catch (error) {
      console.error('Failed to load coverage data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoverage();
  }, [loadCoverage]);

  return { coverage, loading, reload: loadCoverage };
}

export function usePerformanceData() {
  const [performance, setPerformance] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPerformance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/testing/performance');
      if (response.ok) {
        const data = await response.json();
        setPerformance(data);
      }
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPerformance();
  }, [loadPerformance]);

  return { performance, loading, reload: loadPerformance };
}

export function useSecurityData() {
  const [security, setSecurity] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSecurity = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/testing/security');
      if (response.ok) {
        const data = await response.json();
        setSecurity(data);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSecurity();
  }, [loadSecurity]);

  return { security, loading, reload: loadSecurity };
}

export function useTestStatus() {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const startTest = useCallback(() => {
    setStatus('running');
    setLastRun(new Date());
  }, []);

  const completeTest = useCallback((success: boolean) => {
    setStatus(success ? 'completed' : 'failed');
  }, []);

  const resetStatus = useCallback(() => {
    setStatus('idle');
  }, []);

  return {
    status,
    lastRun,
    startTest,
    completeTest,
    resetStatus
  };
}
