import React from 'react';
import { NavigationPage } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ShieldAlert, ArrowLeft, RefreshCw, AlertTriangle, WifiOff, Wrench } from 'lucide-react';

interface ErrorPagesProps {
  type: '404' | '500' | 'maintenance' | 'offline';
  onNavigate: (page: NavigationPage) => void;
}

export const ErrorPages: React.FC<ErrorPagesProps> = ({ type, onNavigate }) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-white">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-white border-gray-200 shadow-sm">
        
        {type === '404' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-blue-600 uppercase tracking-widest">Error 404</span>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Contract Report Not Found</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                The requested smart contract analysis record or screen route does not exist or has been deleted.
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => onNavigate('dashboard')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Dashboard
            </Button>
          </>
        )}

        {type === '500' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-red-600 uppercase tracking-widest">Error 500</span>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Inference Pipeline Error</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                FastAPI model service encountered an unexpected error during AST feature vector calculation.
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => onNavigate('analyzer')}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry Contract Analysis
            </Button>
          </>
        )}

        {type === 'maintenance' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Wrench className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-amber-600 uppercase tracking-widest">System Upgrade</span>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">XGBoost Model Retraining</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                We are deploying XGBoost v2.5 weights trained on 20,000 new Arbitrum bytecode samples. Scheduled downtime ends in 15 minutes.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => onNavigate('dashboard')}
            >
              Check System Status Page
            </Button>
          </>
        )}

        {type === 'offline' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-600 mx-auto flex items-center justify-center">
              <WifiOff className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest">Offline Mode</span>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Network Connection Lost</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Unable to establish connection with the RugGuard FastAPI cluster. Please check your internet connection.
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => window.location.reload()}
            >
              Reconnect to Cluster
            </Button>
          </>
        )}

      </Card>
    </div>
  );
};
