import React, { useState, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dots } from '../components/ui/Dots';
import { api } from '../lib/api';

type InputMode = 'address' | 'solidity';

const exampleContracts = [
  { name: 'Uniswap V3 Router', address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', chain: 'Ethereum' },
  { name: 'USDC Token', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', chain: 'Ethereum' },
  { name: 'Wrapped ETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', chain: 'Ethereum' },
];

export function Analyze() {
  const [mode, setMode] = useState<InputMode>('address');
  const [contractAddress, setContractAddress] = useState('');
  const [solidityCode, setSolidityCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const navigate = useNavigate();

  const extractAddress = (input: string): string => {
    const trimmed = input.trim();
    
    // If it's a direct address (0x + 40 hex chars), return as-is
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return trimmed;
    
    // If it's a URL, try to extract a 40-char address from it
    const urlMatch = trimmed.match(/(0x[a-fA-F0-9]{40})/);
    if (urlMatch) return urlMatch[1];
    
    // If it's a URL with a 64-char hash (like DEXScreener pair hash), extract first 40 chars
    const longHashMatch = trimmed.match(/(0x[a-fA-F0-9]{64})/);
    if (longHashMatch) return longHashMatch[1].slice(0, 42); // Take first 42 chars (0x + 40)
    
    return trimmed;
  };

  const isDexScreenerUrl = (input: string) => /dexscreener\.com/i.test(input);

  const validateAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(extractAddress(addr));

  const handleAnalyze = async () => {
    setError('');

    if (mode === 'address') {
      if (!contractAddress.trim()) {
        setError('Please enter a contract address');
        return;
      }
      
      // Special message for DEXScreener URLs with pair hashes
      if (isDexScreenerUrl(contractAddress)) {
        const hasLongHash = /0x[a-fA-F0-9]{40,}/i.test(contractAddress);
        if (hasLongHash) {
          setError(
            'This DEXScreener URL contains a pair/pool hash (64 chars), not a token address. ' +
            'Click on the token name (e.g., "GULD") on DEXScreener to find its contract address (42 chars starting with 0x).'
          );
          return;
        }
      }
      
      const extracted = extractAddress(contractAddress);
      if (!validateAddress(extracted)) {
        setError('Enter a valid Ethereum address (0x followed by 40 hex characters), or paste a URL containing a contract address');
        return;
      }
      // Auto-extract address from URL if needed
      if (extracted !== contractAddress.trim()) {
        setContractAddress(extracted);
      }
    } else {
      if (!solidityCode.trim()) {
        setError('Please paste Solidity source code');
        return;
      }
      if (solidityCode.trim().length < 20) {
        setError('Code seems too short. Please provide complete Solidity source code.');
        return;
      }
      if (!solidityCode.includes('pragma') && !solidityCode.includes('contract') && !solidityCode.includes('function')) {
        setError('This does not appear to be valid Solidity code.');
        return;
      }
    }

    setIsAnalyzing(true);
    setAnalyzingStep(0);

    // Simulate step progression
    const stepTimer = setInterval(() => {
      setAnalyzingStep(prev => Math.min(prev + 1, 3));
    }, 800);

    if (!api.isConfigured) {
      clearInterval(stepTimer);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalyzingStep(0);
        navigate('/results', {
          state: {
            contractAddress: mode === 'address' ? contractAddress.trim() : 'Solidity Source',
            inputMode: mode,
            riskScore: null,
            riskLevel: 'Unavailable',
            flags: [],
            modelInfo: { model: 'XGBoost ML', features: 53, responseTime: 'N/A' },
            aiAssessment: '',
            error: 'Backend API not configured. Set VITE_API_URL environment variable to enable real analysis.',
          },
        });
      }, 2500);
      return;
    }

    try {
      const input = mode === 'address' ? extractAddress(contractAddress) : solidityCode.trim();
      const data = await api.analyze({ input });

      clearInterval(stepTimer);
      setIsAnalyzing(false);

      navigate('/results', {
        state: {
          contractAddress: data.contract_address || contractAddress.trim(),
          inputMode: mode,
          riskScore: data.risk_score,
          riskLevel: data.risk_level || (data.risk_score <= 30 ? 'Low' : data.risk_score <= 60 ? 'Medium' : data.risk_score <= 80 ? 'High' : 'Critical'),
          flags: data.flags || data.signals || [],
          modelInfo: {
            model: data.model || 'XGBoost ML',
            features: data.features_used || 53,
            responseTime: data.response_time || '<3s',
          },
          aiAssessment: data.ai_assessment || data.explanation || '',
          shapValues: data.shap_values || null,
        },
      });
    } catch (err: any) {
      clearInterval(stepTimer);
      setIsAnalyzing(false);
      setError(err?.message || 'Failed to connect to the analysis backend. Please try again.');
    }
  };

  const analyzingLabels = [
    mode === 'address' ? 'Fetching contract source code...' : 'Parsing Solidity source code...',
    'Extracting 53+ security features...',
    'Running XGBoost risk classification...',
    'Generating explainable assessment...',
  ];

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">
            Contract Scanner
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#0a0a0a] mb-4">
            Analyze a Smart Contract
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Paste an Ethereum contract address or Solidity source code to detect
            potential rug pulls, honeypots, and security vulnerabilities.
          </p>
          <p className="mt-3 text-xs text-gray-400 font-mono">
            No account required for basic scans
          </p>
        </motion.div>

        {/* Scanner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm"
        >
          {isAnalyzing ? (
            <div className="py-12 flex flex-col items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-[#6D001A]/5 border border-[#6D001A]/10 flex items-center justify-center">
                <Dots className="w-4 h-4 text-[#6D001A]" dots={3} />
              </div>

              <div className="text-center">
                <p className="text-xl font-display font-semibold text-[#0a0a0a] mb-2">
                  Analyzing contract...
                </p>
                <p className="text-sm text-gray-400">
                  Running 53+ security checks with XGBoost ML
                </p>
              </div>

              <div className="w-full max-w-sm space-y-3">
                {analyzingLabels.map((label, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: analyzingStep >= index ? 1 : 0.3,
                      x: analyzingStep >= index ? 0 : -10,
                    }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    {analyzingStep > index ? (
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : analyzingStep === index ? (
                      <Dots className="w-3 h-3 text-[#6D001A] shrink-0" dots={3} />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-gray-200 shrink-0" />
                    )}
                    <span className={`text-sm ${analyzingStep >= index ? 'text-[#0a0a0a]' : 'text-gray-300'}`}>
                      {label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Mode Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => { setMode('address'); setError(''); }}
                  className={`flex-1 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    mode === 'address'
                      ? 'bg-[#0a0a0a] text-white'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Contract Address
                  </span>
                </button>
                <button
                  onClick={() => { setMode('solidity'); setError(''); }}
                  className={`flex-1 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    mode === 'solidity'
                      ? 'bg-[#0a0a0a] text-white'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Solidity Code
                  </span>
                </button>
              </div>

              {/* Input Area */}
              <div className="mb-6">
                {mode === 'address' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Contract Address</label>
                    <input
                      type="text"
                      value={contractAddress}
                      onChange={(e) => { setContractAddress(e.target.value); setError(''); }}
                      placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f..."
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0a0a] placeholder-gray-400 font-mono text-sm focus:outline-none focus:border-[#6D001A] focus:ring-1 focus:ring-[#6D001A]/20 transition-all duration-300"
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                    <p className="mt-2 text-xs text-gray-400">Enter any Ethereum mainnet contract address</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Solidity Source Code</label>
                    <textarea
                      value={solidityCode}
                      onChange={(e) => { setSolidityCode(e.target.value); setError(''); }}
                      placeholder={`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract MyToken {\n  // Paste your Solidity code here\n}`}
                      rows={12}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0a0a] placeholder-gray-400 font-mono text-sm focus:outline-none focus:border-[#6D001A] focus:ring-1 focus:ring-[#6D001A]/20 transition-all duration-300 resize-none leading-relaxed"
                    />
                    <p className="mt-2 text-xs text-gray-400">
                      {solidityCode ? `${solidityCode.length.toLocaleString()} characters` : 'Paste complete Solidity contract source code'}
                    </p>
                  </div>
                )}

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-red-500 flex items-start gap-2"
                  >
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={mode === 'address' ? !contractAddress.trim() : !solidityCode.trim()}
                className="w-full py-4 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:shadow-[#6D001A]/15"
              >
                Analyze Contract
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              {/* Supported Features */}
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#6D001A]/50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  53+ Security Signals
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#6D001A]/50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  AI + Static Analysis
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#6D001A]/50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free for Basic Scans
                </span>
              </div>

              {/* API status */}
              {api.isConfigured && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  API Connected
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Example Contracts */}
        {mode === 'address' && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
              Try an Example
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {exampleContracts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => { setContractAddress(example.address); setError(''); }}
                  className="p-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#6D001A]/20 rounded-xl text-left transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-[#0a0a0a] group-hover:text-[#6D001A] transition-colors">{example.name}</p>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{example.chain}</span>
                  </div>
                  <p className="font-mono text-xs text-gray-400 truncate">{example.address}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* How it works mini-section */}
        {!isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase">
                How it works
              </span>
              <Link to="/how-it-works" className="text-xs text-[#6D001A] hover:underline ml-auto">
                Learn more
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Input', desc: 'Paste a contract address or Solidity source code' },
                { step: '02', title: 'Analysis', desc: 'XGBoost model extracts 53+ features in real-time' },
                { step: '03', title: 'Result', desc: 'Get a risk score with explainable AI reasoning' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl font-display font-bold text-[#6D001A]/15 shrink-0">{item.step}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#0a0a0a] mb-0.5">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
