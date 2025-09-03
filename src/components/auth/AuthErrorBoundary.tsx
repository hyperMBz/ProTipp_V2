/**
 * Auth Error Boundary Component
 * Globális authentication error handling
 */

'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Auth Error Boundary - Elkapja az authentication hibákat
 */
export class AuthErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚫 Auth Error Boundary caught error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Error reporting service-be küldés (ha van)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Itt küldhetnénk el a hibát egy error reporting service-be
    // pl. Sentry, LogRocket, stb.
    console.log('📊 Error reported:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      // Max retry elérve, teljes oldal újratöltés
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback ha van
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Alapértelmezett error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Hitelesítési hiba
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Váratlan hiba történt az alkalmazás betöltése során
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error details - csak development-ben */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-medium text-red-800">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="mt-2 text-xs text-red-600 overflow-x-auto">
                      {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col space-y-2">
                {this.state.retryCount < this.maxRetries ? (
                  <Button
                    onClick={this.handleRetry}
                    variant="default"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Újrapróbálás ({this.state.retryCount + 1}/{this.maxRetries})
                  </Button>
                ) : (
                  <Button
                    onClick={this.handleReload}
                    variant="default"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Oldal újratöltése
                  </Button>
                )}
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  Vissza a főoldalra
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Ha a probléma továbbra is fennáll, kérjük vegye fel velünk a kapcsolatot.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Auth Error Handler Hook - Function komponensekben használható
 */
export function useAuthErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`🚫 Auth Error${context ? ` (${context})` : ''}:`, error);
    
    // Error típus alapján különböző kezelés
    if (isAuthError(error)) {
      // Authentication specifikus hibák
      console.warn('Authentication error detected, redirecting to login...');
      window.location.href = '/?error=auth_required';
    } else if (isNetworkError(error)) {
      // Hálózati hibák
      console.warn('Network error detected');
      // Toast notification vagy retry mechanizmus
    } else {
      // Általános hibák
      console.error('General error:', error);
    }
  };

  return { handleError };
}

/**
 * Error type checkers
 */
function isAuthError(error: Error): boolean {
  const authErrorMessages = [
    'authentication required',
    'invalid token',
    'session expired',
    'unauthorized',
    'forbidden',
  ];
  
  return authErrorMessages.some(msg => 
    error.message.toLowerCase().includes(msg)
  );
}

function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'network error',
    'fetch failed',
    'connection refused',
    'timeout',
  ];
  
  return networkErrorMessages.some(msg =>
    error.message.toLowerCase().includes(msg)
  );
}

/**
 * Global Error Handler - Window error events kezelése
 */
export function setupGlobalErrorHandler() {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚫 Unhandled Promise Rejection:', event.reason);
    
    if (isAuthError(event.reason)) {
      event.preventDefault(); // Megakadályozzuk a default error handling-et
      window.location.href = '/?error=auth_failed';
    }
  });

  // JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('🚫 Global JavaScript Error:', event.error);
    
    if (event.error && isAuthError(event.error)) {
      window.location.href = '/?error=auth_failed';
    }
  });
}

/**
 * Error Recovery Utilities
 */
export const ErrorRecovery = {
  /**
   * Retry function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`🔄 Retry attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  },

  /**
   * Safe async function wrapper
   */
  async safe<T>(
    fn: () => Promise<T>,
    fallback?: T,
    onError?: (error: Error) => void
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      console.error('🚫 Safe async function failed:', error);
      
      if (onError) {
        onError(error as Error);
      }

      return fallback;
    }
  },
};
