import React, { useState, useEffect } from 'react';
import { NavigationPage, SmartContractReport } from '../../types';
import { SAMPLE_CONTRACTS, SampleContract } from '../../data/sampleContracts';
import { parseSolidityContract, analyzeSmartContract } from '../../services/analyzerEngine';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Search, Play, FileCode, CheckCircle2, ShieldAlert, 
  Cpu, Upload, RefreshCw
} from 'lucide-react';

interface AnalyzerScreenProps {
  onNavigate: (page: NavigationPage) => void;
  onAnalysisComplete: (report: SmartContractReport) => void;
  selectedSampleId?: string | null;
}

export const AnalyzerScreen: React.FC<AnalyzerScreenProps> = ({
  onNavigate,
  onAnalysisComplete,
  selectedSampleId,
}) => {
  const [activeTab, setActiveTab] = useState<'address' | 'paste' | 'upload'>('address');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [contractName, setContractName] = useState<string>('SmartContract');
  const [addressInput, setAddressInput] = useState<string>('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
  const [network, setNetwork] = useState<string>('ETH');
  
  // Pipeline animation state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [analysisStatusText, setAnalysisStatusText] = useState<string>('');

  // Load preset sample if passed
  useEffect(() => {
    if (selectedSampleId) {
      const sample = SAMPLE_CONTRACTS.find((s) => s.id === selectedSampleId);
      if (sample) {
        setSourceCode(sample.sourceCode);
        setContractName(sample.name);
        if (activeTab === 'address') setActiveTab('paste');
      }
    } else if (!sourceCode) {
      setSourceCode(SAMPLE_CONTRACTS[0].sourceCode);
      setContractName(SAMPLE_CONTRACTS[0].name);
    }
  }, [selectedSampleId]);

  const handleSelectPreset = (sample: SampleContract) => {
    setSourceCode(sample.sourceCode);
    setContractName(sample.name);
    setActiveTab('paste');
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setAnalysisStatusText('Fetching contract data & connecting to SentinelX Python API...');

    setTimeout(() => {
      setAnalysisStep(2);
      setAnalysisStatusText('Extracting 53 ML feature vectors from contract code...');
    }, 400);

    setTimeout(() => {
      setAnalysisStep(3);
      setAnalysisStatusText('Running XGBoost classifier & SHAP feature attribution...');
    }, 800);

    try {
      const report = await analyzeSmartContract({
        sourceCode: activeTab === 'paste' || activeTab === 'upload' ? sourceCode : undefined,
        address: activeTab === 'address' ? addressInput : undefined,
        contractName: contractName || 'AnalyzedContract',
        network: network === 'ETH' ? 'Ethereum Mainnet' : network === 'BSC' ? 'Binance Smart Chain' : 'Polygon POS',
        chain: network
      });

      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisStep(4);
        onAnalysisComplete(report);
        onNavigate('result');
      }, 1100);
    } catch (err: any) {
      // Analysis failed — fall back to client-side parser
      const fallbackReport = parseSolidityContract(sourceCode, contractName);
      setIsAnalyzing(false);
      onAnalysisComplete(fallbackReport);
      onNavigate('result');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setSourceCode(content);
        setContractName(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#0B0F17] text-gray-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight font-mono">Contract Security Scanner</h1>
            <Badge variant="info">53 Features ML Engine</Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Analyse smart contracts for rug pull vectors, honeypot patterns, and access control risks before trading.
          </p>
        </div>

        {/* Preset Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-gray-400">Presets:</span>
          {SAMPLE_CONTRACTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectPreset(sample)}
              className="px-2.5 py-1 text-xs rounded bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 font-mono transition-colors cursor-pointer"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scanner Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Workbench */}
        <div className="lg:col-span-3 space-y-6">
          
          <Card className="bg-[#111827] border-gray-800">
            {/* Input Method Segment Tabs */}
            <div className="flex border-b border-gray-800 bg-[#0B0F17] rounded-t-xl px-4 pt-3 gap-2">
              <button
                onClick={() => setActiveTab('address')}
                className={`px-4 py-2 text-xs font-mono font-medium rounded-t-lg transition-colors border-t border-x cursor-pointer ${
                  activeTab === 'address'
                    ? 'bg-[#111827] text-blue-400 border-gray-800'
                    : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  <span>Contract Address / Token URL</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('paste')}
                className={`px-4 py-2 text-xs font-mono font-medium rounded-t-lg transition-colors border-t border-x cursor-pointer ${
                  activeTab === 'paste'
                    ? 'bg-[#111827] text-blue-400 border-gray-800'
                    : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Paste Solidity Source</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 text-xs font-mono font-medium rounded-t-lg transition-colors border-t border-x cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#111827] text-blue-400 border-gray-800'
                    : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .sol File</span>
                </div>
              </button>
            </div>

            <CardContent className="p-6 space-y-4">
              
              {/* Tab 1: Contract Address Input */}
              {activeTab === 'address' && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Network</label>
                      <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        className="w-full p-2.5 text-xs font-mono border border-gray-800 rounded-lg bg-[#0B0F17] text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="BSC">Binance Smart Chain (BSC)</option>
                        <option value="POLYGON">Polygon POS</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-mono text-gray-400 mb-1">Contract Address or Token URL</label>
                      <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        placeholder="Enter Smart Contract Address (0x...) or Paste Token URL"
                        className="w-full p-2.5 font-mono text-xs border border-gray-800 rounded-lg bg-[#0B0F17] text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#0B0F17] border border-gray-800 rounded-lg text-xs text-gray-400 flex items-start gap-2 font-mono">
                    <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      Etherscan V2 API will fetch verified contract source code automatically across Ethereum, BSC, and Polygon chains.
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: Source Code Editor */}
              {activeTab === 'paste' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-mono text-gray-400">Contract Name</label>
                      <input
                        type="text"
                        value={contractName}
                        onChange={(e) => setContractName(e.target.value)}
                        placeholder="e.g. CustomToken"
                        className="mt-1 px-3 py-1.5 text-xs font-mono border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 bg-[#0B0F17] text-white w-64"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-gray-500">
                      {sourceCode.split('\n').length} Lines
                    </span>
                  </div>

                  <div className="relative font-mono text-xs">
                    <textarea
                      value={sourceCode}
                      onChange={(e) => setSourceCode(e.target.value)}
                      rows={16}
                      placeholder="// Paste Solidity contract code here..."
                      className="w-full p-4 border border-gray-800 rounded-xl bg-[#0B0F17] text-gray-200 font-mono text-xs focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Upload File */}
              {activeTab === 'upload' && (
                <div className="py-8 text-center space-y-4">
                  <div className="border-2 border-dashed border-gray-800 rounded-xl p-8 bg-[#0B0F17]">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-xs font-mono font-medium text-gray-300">Drag & drop your .sol contract file here</p>
                    <p className="text-[11px] text-gray-500 mt-1 font-mono">Supports Solidity files up to 10MB</p>

                    <label className="mt-4 inline-block">
                      <span className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer">
                        Select File
                      </span>
                      <input
                        type="file"
                        accept=".sol,.json,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Run Analysis Action Area */}
              <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>XGBoost Classifier • 53 Features • SHAP Engine</span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleRunAnalysis}
                  isLoading={isAnalyzing}
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  {isAnalyzing ? 'Analysing Contract...' : 'Analyse Contract'}
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Analysis Progress Steps Card */}
          {isAnalyzing && (
            <Card className="p-6 bg-[#111827] border-blue-900/60 animate-in fade-in">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                    Analysing smart contract...
                  </span>
                  <span className="text-xs font-mono text-blue-400">Step {analysisStep} of 3</span>
                </div>

                <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
                  <div
                    className="bg-blue-600 h-2 transition-all duration-500 rounded-full"
                    style={{ width: `${(analysisStep / 3) * 100}%` }}
                  ></div>
                </div>

                <p className="text-xs font-mono text-gray-300 bg-[#0B0F17] p-3 rounded-lg border border-gray-800">
                  &gt; {analysisStatusText}
                </p>
              </div>
            </Card>
          )}

        </div>

        {/* Right Sidebar: Security Rules */}
        <div className="space-y-6">
          <Card className="p-5 bg-[#111827] border-gray-800">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-4">
              Security Evaluation Rules
            </h3>

            <div className="space-y-3 text-xs text-gray-400 font-sans">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Honeypot detection: checks sell restrictions and gas traps</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Access control: flags hidden owner variables and keccak hashes</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Economic mechanics: audits uncapped taxes & unlimited minting</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Fund drain: checks selfdestruct, delegatecall & eth withdrawals</span>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 p-3 bg-[#0B0F17]/95 backdrop-blur-md border-t border-gray-800">
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analysing...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Analyse Contract</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
