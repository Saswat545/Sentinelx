import React, { useState } from 'react';
import { NavigationPage, SmartContractReport } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Download, Copy, Check, ChevronDown, ChevronUp, 
  ArrowLeft, Cpu, CheckCircle2
} from 'lucide-react';

interface ResultScreenProps {
  report: SmartContractReport;
  onNavigate: (page: NavigationPage) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  report,
  onNavigate,
}) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [expandedVuln, setExpandedVuln] = useState<string | null>(report.vulnerabilities[0]?.id || null);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#0B0F17] text-gray-100 print:bg-white print:text-black">
      
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('analyzer')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Scanner
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-white tracking-tight">{report.contractName}</h1>
              <Badge riskLevel={report.riskLevel}>{report.riskLevel}</Badge>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Report ID: #{report.id} • Analyzed at {report.analyzedAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            leftIcon={copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedJson ? 'Copied' : 'Copy API JSON'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportPdf}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export PDF Audit
          </Button>
        </div>
      </div>

      {/* Main Verdict & Executive Summary */}
      <Card className="p-6 md:p-8 bg-[#111827] border-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Risk Score Circle */}
          <div className="flex flex-col items-center justify-center text-center lg:border-r border-gray-800 lg:pr-8 py-2">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
              XGBoost Risk Score
            </span>

            <div className="relative my-2 inline-flex items-center justify-center">
              <svg className="w-36 h-36">
                <circle cx="72" cy="72" r="60" stroke="#1F2937" strokeWidth="12" fill="transparent" />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke={report.riskScore >= 75 ? '#EF4444' : report.riskScore >= 45 ? '#F59E0B' : '#10B981'}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="377"
                  strokeDashoffset={377 - (377 * report.riskScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold font-mono text-white tracking-tight">{report.riskScore}</span>
                <span className="text-[10px] font-mono text-gray-400">/ 100</span>
              </div>
            </div>

            <div className="mt-2 space-y-1 font-mono">
              <span className="font-bold text-sm text-white">{report.mlPrediction}</span>
              <p className="text-xs text-gray-400">Model Confidence: {report.confidence}%</p>
            </div>
          </div>

          {/* Verdict Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950/60 text-blue-400 text-xs font-mono border border-blue-800/60">
              <Cpu className="w-3.5 h-3.5" />
              <span>Model: XGBoost v2.4 (SHAP Engine)</span>
            </div>

            <h3 className="text-lg font-bold text-white">
              Executive Security Diagnosis
            </h3>

            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              {report.riskScore >= 50
                ? 'CRITICAL THREAT ALERT: The XGBoost classifier identified high-risk contract vectors. Inspection revealed sell restriction mechanics, unrenounced admin privileges, or unlocked liquidity.'
                : 'VERIFIED SAFE: The smart contract demonstrates standard EVM bytecode structures with no evidence of honeypot fee traps, blacklists, or unrenounced minting privileges.'}
            </p>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0B0F17] rounded-lg border border-gray-800">
                <span className="text-gray-500 block text-[10px] uppercase">Max Sell Tax</span>
                <span className={`font-bold ${report.maxSellFeePercent > 10 ? 'text-red-400' : 'text-gray-200'}`}>
                  {report.maxSellFeePercent}%
                </span>
              </div>

              <div className="p-2.5 bg-[#0B0F17] rounded-lg border border-gray-800">
                <span className="text-gray-500 block text-[10px] uppercase">Liquidity Lock</span>
                <span className={`font-semibold ${report.liquidityLocked ? 'text-emerald-400' : 'text-red-400'}`}>
                  {report.liquidityLocked ? 'Locked' : 'Unlocked'}
                </span>
              </div>

              <div className="p-2.5 bg-[#0B0F17] rounded-lg border border-gray-800">
                <span className="text-gray-500 block text-[10px] uppercase">Blacklist</span>
                <span className={`font-semibold ${report.hasBlacklist ? 'text-red-400' : 'text-emerald-400'}`}>
                  {report.hasBlacklist ? 'Yes (Risk)' : 'None'}
                </span>
              </div>

              <div className="p-2.5 bg-[#0B0F17] rounded-lg border border-gray-800">
                <span className="text-gray-500 block text-[10px] uppercase">Inference Time</span>
                <span className="text-gray-300">{report.processingTimeMs} ms</span>
              </div>
            </div>

          </div>

        </div>
      </Card>

      {/* SHAP TreeExplainer Section */}
      <Card className="bg-[#111827] border-gray-800">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="font-mono">SHAP Feature Attribution Breakdown</CardTitle>
            <CardDescription className="font-mono text-gray-400">
              Mathematical contribution of each feature vector to the overall risk score
            </CardDescription>
          </div>
          <Badge variant="info">TreeSHAP Engine</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {report.shapFeatures.map((feat, idx) => {
            const isPositive = feat.impactScore > 0;
            return (
              <div key={idx} className="p-3 bg-[#0B0F17] rounded-xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{feat.featureName}</span>
                    <span className="text-gray-400">({feat.value})</span>
                    <Badge variant="outline" size="sm">{feat.category}</Badge>
                  </div>

                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                      isPositive ? 'bg-red-950/60 text-red-400 border border-red-800/80' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                    }`}
                  >
                    {isPositive ? `+${feat.impactScore}% Risk` : `${feat.impactScore}% Risk`}
                  </span>
                </div>

                <p className="text-xs text-gray-400 font-sans">{feat.description}</p>

                <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden border border-gray-800">
                  <div
                    className={`h-1.5 rounded-full ${isPositive ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(Math.abs(feat.impactScore) * 2, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Vulnerabilities & Recommendations */}
      <Card className="bg-[#111827] border-gray-800">
        <CardHeader>
          <CardTitle className="font-mono">Threat Breakdown & Security Remediation ({report.vulnerabilities.length})</CardTitle>
          <CardDescription className="font-mono text-gray-400">
            Automated AST inspection findings and recommended code fixes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {report.vulnerabilities.map((vuln) => {
            const isOpen = expandedVuln === vuln.id;
            return (
              <div
                key={vuln.id}
                className="border border-gray-800 rounded-xl overflow-hidden bg-[#0B0F17]"
              >
                <button
                  onClick={() => setExpandedVuln(isOpen ? null : vuln.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-900 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={vuln.severity === 'CRITICAL' || vuln.severity === 'HIGH' ? 'danger' : 'warning'}>
                      {vuln.severity}
                    </Badge>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">{vuln.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{vuln.category} • {vuln.lineRange || 'Bytecode'}</p>
                    </div>
                  </div>

                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 border-t border-gray-800 bg-[#0B0F17] space-y-3 text-xs">
                    <div>
                      <span className="font-mono font-semibold text-gray-300 block mb-1">Description</span>
                      <p className="text-gray-400 leading-relaxed font-sans">{vuln.description}</p>
                    </div>

                    {vuln.codeSnippet && (
                      <div>
                        <span className="font-mono font-semibold text-gray-300 block mb-1">Flagged Snippet</span>
                        <pre className="p-3 bg-gray-950 text-gray-200 rounded-lg font-mono text-[11px] overflow-x-auto border border-gray-800">
                          <code>{vuln.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-emerald-300">
                      <span className="font-mono font-semibold block mb-1 flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Remediation Step
                      </span>
                      <p className="text-[11px] leading-relaxed font-sans">{vuln.remediation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

    </div>
  );
};
