import React from 'react';
import { NavigationPage, SmartContractReport, UserProfile } from '../../types';
import { Badge } from '../ui/Badge';
import { 
  ShieldAlert, Terminal, Activity, BarChart3, Clock, 
  ChevronRight, Key
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigate: (page: NavigationPage) => void;
  reports: SmartContractReport[];
  user: UserProfile;
  onSelectReport: (report: SmartContractReport) => void;
  onSelectSampleContract: (sampleId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  reports,
  user,
  onSelectReport,
  onSelectSampleContract,
}) => {
  const totalScans = reports.length + 138;
  const avgRisk = Math.round(reports.reduce((acc, r) => acc + r.riskScore, 0) / (reports.length || 1));
  const highRiskCount = reports.filter((r) => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH').length;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0b132b] text-[#f1faee] font-sans">
      
      {/* Top Console Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#457b9d]/30">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold font-heading text-[#f1faee] tracking-tight">Security Console</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-semibold bg-[#1c2541] text-[#a8dadc] border border-[#457b9d]/40">
              REST Engine Active
            </span>
          </div>
          <p className="text-xs text-[#a8dadc]">
            Account: <strong className="text-[#f1faee]">{user.name}</strong> • Tier: <strong className="text-[#a8dadc] font-semibold">{user.plan}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 font-heading">
          <button
            onClick={() => onNavigate('history')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1c2541] hover:bg-[#15263f] text-[#f1faee] border border-[#457b9d]/40 transition-colors cursor-pointer flex items-center gap-2"
          >
            <Clock className="w-3.5 h-3.5 text-[#a8dadc]" />
            <span>Scan History</span>
          </button>
          <button
            onClick={() => onNavigate('analyzer')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#e63946] hover:bg-[#d62828] text-white transition-colors shadow-md cursor-pointer flex items-center gap-2"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>New Contract Scan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        
        <div className="p-5 bg-[#1c2541] rounded-2xl border border-[#457b9d]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold text-[#a8dadc] uppercase">Total Scans</span>
            <div className="w-8 h-8 rounded-xl bg-[#0b132b] text-[#a8dadc] border border-[#457b9d]/40 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#f1faee] font-number">{totalScans}</span>
          </div>
          <p className="text-[11px] text-[#a8dadc] font-sans">EVM AST Analysis Pipeline</p>
        </div>

        <div className="p-5 bg-[#1c2541] rounded-2xl border border-[#457b9d]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold text-[#a8dadc] uppercase">Average Risk Score</span>
            <div className="w-8 h-8 rounded-xl bg-[#0b132b] text-[#a8dadc] border border-[#457b9d]/40 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#f1faee] font-number">{avgRisk} / 100</span>
          </div>
          <p className="text-[11px] text-[#a8dadc] font-sans">XGBoost Weighted Average</p>
        </div>

        <div className="p-5 bg-[#1c2541] rounded-2xl border border-[#457b9d]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold text-[#a8dadc] uppercase">Threats Flagged</span>
            <div className="w-8 h-8 rounded-xl bg-[#0b132b] text-[#e63946] border border-[#e63946]/40 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#f1faee] font-number">{highRiskCount + 42}</span>
          </div>
          <p className="text-[11px] text-[#a8dadc] font-sans">Honeypots & Tax Traps</p>
        </div>

        <div className="p-5 bg-[#1c2541] rounded-2xl border border-[#457b9d]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold text-[#a8dadc] uppercase">API Limit</span>
            <div className="w-8 h-8 rounded-xl bg-[#0b132b] text-[#a8dadc] border border-[#457b9d]/40 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-[#f1faee] font-number">{user.analysesUsed} / {user.analysesLimit}</span>
          </div>
          <div className="w-full bg-[#0b132b] rounded-full h-1.5 border border-[#457b9d]/30 overflow-hidden">
            <div className="bg-[#457b9d] h-1.5 rounded-full" style={{ width: '14%' }}></div>
          </div>
        </div>

      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Scans List Table */}
        <div className="lg:col-span-2 space-y-4 text-left">
          <div className="bg-[#1c2541] rounded-2xl border border-[#457b9d]/40 overflow-hidden">
            <div className="p-5 border-b border-[#457b9d]/30 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#f1faee] font-heading">Recent Contract Scans</h3>
                <p className="text-xs text-[#a8dadc]">Live evaluation queue & Threat Reports</p>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-heading font-semibold text-[#a8dadc] hover:text-[#f1faee] cursor-pointer"
              >
                View History →
              </button>
            </div>

            <div className="divide-y divide-[#457b9d]/30">
              {reports.slice(0, 5).map((rpt) => (
                <div
                  key={rpt.id}
                  onClick={() => {
                    onSelectReport(rpt);
                    onNavigate('result');
                  }}
                  className="p-4 hover:bg-[#15263f] transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0b132b] border border-[#457b9d]/40 flex items-center justify-center font-heading text-xs font-bold text-[#f1faee]">
                      {rpt.tokenSymbol ? rpt.tokenSymbol.substring(0, 3) : 'SOL'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#f1faee] group-hover:text-[#a8dadc] transition-colors font-heading">
                          {rpt.contractName}
                        </span>
                        <span className="text-[10px] text-[#a8dadc] font-number">{rpt.address ? `${rpt.address.substring(0, 8)}...` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#a8dadc] mt-0.5 font-sans">
                        <span>{rpt.network}</span>
                        <span>•</span>
                        <span>{rpt.analyzedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#f1faee] font-number">Score: {rpt.riskScore}/100</div>
                      <Badge riskLevel={rpt.riskLevel} size="sm">{rpt.mlPrediction}</Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#a8dadc] group-hover:text-[#f1faee] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Quick Test Presets */}
        <div className="space-y-4 text-left font-sans">
          <div className="bg-[#1c2541] p-5 rounded-2xl border border-[#457b9d]/40 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#f1faee] font-heading">Audit Presets</h3>
              <p className="text-xs text-[#a8dadc]">Run verified contract samples</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  onSelectSampleContract('sample-honeypot');
                  onNavigate('analyzer');
                }}
                className="w-full p-3.5 bg-[#0b132b] border border-[#457b9d]/40 rounded-xl text-left hover:border-[#a8dadc] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#f1faee] font-heading">ElonMars (Honeypot)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#e63946]/20 text-[#e63946] border border-[#e63946]/50 font-bold">CRITICAL</span>
                </div>
                <p className="text-[11px] text-[#a8dadc] mt-1 font-sans">
                  Sell tax override logic & transfer restrictions.
                </p>
              </button>

              <button
                onClick={() => {
                  onSelectSampleContract('sample-safe-erc20');
                  onNavigate('analyzer');
                }}
                className="w-full p-3.5 bg-[#0b132b] border border-[#457b9d]/40 rounded-xl text-left hover:border-[#a8dadc] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#f1faee] font-heading">Aether Token (Safe)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#457b9d]/30 text-[#a8dadc] border border-[#457b9d]/50 font-bold">VERIFIED</span>
                </div>
                <p className="text-[11px] text-[#a8dadc] mt-1 font-sans">
                  OpenZeppelin Standard ERC-20 implementation.
                </p>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
