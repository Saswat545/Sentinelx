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
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#0B0F17]">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-[#111827] border-gray-800 shadow-2xl">
        
        {type === '404' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-blue-950/60 text-blue-400 mx-auto flex items-center justify-center border border-blue-800/60">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-blue-400 uppercase tracking-widest">404 — Signal Lost</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Page Not Found</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                The requested page does not exist or has been moved. Enter a valid contract address or return to the SentinelX dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => onNavigate('analyzer')}
                leftIcon={<ShieldAlert className="w-4 h-4" />}
              >
                Analyze a Contract
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => onNavigate('landing')}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Return to SentinelX
              </Button>
            </div>
          </>
        )}

        {type === '500' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-950/60 text-red-400 mx-auto flex items-center justify-center border border-red-800/60">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-red-400 uppercase tracking-widest">Server Error</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Analysis Service Error</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                The SentinelX analysis service encountered an unexpected error. Please try again in a moment.
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => onNavigate('analyzer')}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry Analysis
            </Button>
          </>
        )}

        {type === 'maintenance' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-950/60 text-amber-400 mx-auto flex items-center justify-center border border-amber-800/60">
              <Wrench className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">System Upgrade</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Scheduled Maintenance</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                SentinelX is temporarily unavailable for scheduled maintenance. Please check back shortly.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => onNavigate('landing')}
            >
              Return to SentinelX
            </Button>
          </>
        )}

        {type === 'offline' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gray-800 text-gray-400 mx-auto flex items-center justify-center border border-gray-700">
              <WifiOff className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest">Offline</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Connection Lost</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Unable to reach the SentinelX analysis service. Please check your internet connection and try again.
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => window.location.reload()}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Reconnect
            </Button>
          </>
        )}

      </Card>
    </div>
  );
};
