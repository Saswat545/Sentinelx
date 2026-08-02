import React, { useState } from 'react';
import { NavigationPage, SmartContractReport } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Search, Download, Trash2, Star 
} from 'lucide-react';

interface HistoryScreenProps {
  reports: SmartContractReport[];
  onNavigate: (page: NavigationPage) => void;
  onSelectReport: (report: SmartContractReport) => void;
  onDeleteReport: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  reports,
  onNavigate,
  onSelectReport,
  onDeleteReport,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredReports = reports.filter((rpt) => {
    const matchesSearch =
      rpt.contractName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rpt.tokenSymbol && rpt.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rpt.address && rpt.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filterLevel === 'ALL' ||
      (filterLevel === 'FAVORITES' && rpt.isFavorite) ||
      rpt.riskLevel === filterLevel;

    return matchesSearch && matchesFilter;
  });

  const handleExportCsv = () => {
    const headers = 'ID,ContractName,TokenSymbol,Network,RiskScore,RiskLevel,MLPrediction,AnalyzedAt\n';
    const rows = filteredReports
      .map(
        (r) =>
          `"${r.id}","${r.contractName}","${r.tokenSymbol || ''}","${r.network}",${r.riskScore},"${r.riskLevel}","${r.mlPrediction}","${r.analyzedAt}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SentinelX_Scan_History_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#0B0F17] text-gray-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-tight">Threat Intelligence Database</h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Search, filter, and export contract scan records across Ethereum, BSC, and Polygon chains.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          leftIcon={<Download className="w-3.5 h-3.5 text-gray-400" />}
        >
          Export CSV Log
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-[#111827] border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contract, symbol or address..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 bg-[#0B0F17] text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto font-mono">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'SAFE', 'FAVORITES'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                  filterLevel === lvl
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

        </div>
      </Card>

      {/* Reports Table */}
      <Card className="overflow-hidden bg-[#111827] border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#0B0F17] border-b border-gray-800 text-gray-400 uppercase tracking-wider text-[10px]">
                <th className="p-4">Contract / Token</th>
                <th className="p-4">Network</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">ML Verdict</th>
                <th className="p-4">Scan Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 text-xs">
                    No matching scan records found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((rpt) => (
                  <tr
                    key={rpt.id}
                    className="hover:bg-gray-900 transition-colors group cursor-pointer"
                  >
                    <td
                      onClick={() => {
                        onSelectReport(rpt);
                        onNavigate('result');
                      }}
                      className="p-4"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(rpt.id);
                          }}
                          className={`p-1 rounded hover:bg-gray-800 transition-colors ${
                            rpt.isFavorite ? 'text-amber-400' : 'text-gray-600'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                            {rpt.contractName}
                          </div>
                          <span className="text-[10px] text-gray-500">
                            {rpt.address ? `${rpt.address.substring(0, 10)}...` : 'Source Code'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-gray-300 font-medium">{rpt.network}</td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rpt.riskScore}/100</span>
                        <Badge riskLevel={rpt.riskLevel} size="sm">{rpt.riskLevel}</Badge>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-gray-200">{rpt.mlPrediction}</span>
                    </td>

                    <td className="p-4 text-gray-500 text-[11px]">{rpt.analyzedAt}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectReport(rpt);
                            onNavigate('result');
                          }}
                        >
                          View Report
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteReport(rpt.id);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                          title="Delete Scan Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
