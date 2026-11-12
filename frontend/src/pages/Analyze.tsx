import React, { useEffect, useState, Suspense } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dots } from '../components/ui/Dots';
import { ScanHints } from '../components/onboarding/ScanHints';
import { SmoothInput } from '../components/ui/SmoothInput';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { addScan, normalizeRiskLevel } from '../lib/scanStore';

type InputMode = 'address' | 'solidity';

const exampleContracts = [
  { name: 'Uniswap V3 Router', address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', chain: 'Ethereum' },
  { name: 'USDC Token', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', chain: 'Ethereum' },
  { name: 'Wrapped ETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', chain: 'Ethereum' },
];

export function Analyze() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [mode, setMode] = useState<InputMode>('address');
  const [contractAddress, setContractAddress] = useState(searchParams.get('address') ?? '');
  const [solidityCode, setSolidityCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const navigate = useNavigate();

  /* The backend sleeps when idle. Ping it on mount so the cold start overlaps
     with the time the user spends pasting an address. */
  useEffect(() => {
    if (!api.isConfigured) return;
    void api.health().catch(() => {});
  }, []);

  const extractAddress = (input: string): string => {
    const trimmed = input.trim();
    
    // If it's a direct address (0x + 40 hex chars), return as-is
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return trimmed;
    
    // A 40-char address inside a URL or pasted text, but never the first 40
    // characters of a 64-char transaction or pair hash.
    const addressMatch = trimmed.match(/(0x[a-fA-F0-9]{40})(?![a-fA-F0-9])/i);
    if (addressMatch) return addressMatch[1];

    return trimmed;
  };

  /* A 64-char hex string is a transaction or pool hash, not a contract address.
     Slicing it to 42 characters invents an address that was never deployed, and
     the result page then reports on a contract that does not exist. */
  const isTransactionOrPairHash = (input: string): boolean => {
    const trimmed = input.trim();
    if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) return true;
    return (
      /0x[a-fA-F0-9]{64}/i.test(trimmed) &&
      !/(0x[a-fA-F0-9]{40})(?![a-fA-F0-9])/i.test(trimmed)
    );
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
      
      if (isTransactionOrPairHash(contractAddress)) {
        setError(
          'That is a 64-character transaction or pool hash, not a contract address. ' +
          'Open the token on Dexscreener or Etherscan and copy its 42-character contract address instead (0x followed by 40 characters).'
        );
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
            contractAddress: mode === 'address' ? extractAddress(contractAddress) : 'Solidity Source',
            inputMode: mode,
            riskScore: null,
            riskLevel: 'Unavailable',
            flags: [],
            modelInfo: { model: 'Not run', features: 0, responseTime: 'n/a' },
            scoreSource: 'policy',
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

      const flags = (data.flags || data.signals || []).map((flag) => ({
        name: flag.name,
        severity: flag.severity,
      }));

      /* Report only what the backend actually ran. An unverified contract gets
         a policy score, not a model score, and the UI must say so. */
      const modelUsed = data.model_used !== false;
      const modelInfo = {
        model: data.model || (modelUsed ? 'XGBoost' : 'Not run'),
        features: data.features_used ?? (modelUsed ? 53 : 0),
        responseTime:
          data.response_time ||
          (data.analysis_time_ms ? `${data.analysis_time_ms} ms` : 'n/a'),
      };

      addScan(user?.id || 'guest', {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        contract: data.contract_address || data.token_address || extractAddress(contractAddress) || 'Contract',
        inputMode: mode === 'solidity' ? 'solidity' : 'address',
        riskScore: data.risk_score,
        riskLevel: normalizeRiskLevel(data.risk_level, data.risk_score),
        flags,
        model: modelInfo.model,
        features: modelInfo.features,
        responseTime: modelInfo.responseTime,
        aiAssessment: data.ai_assessment || data.explanation || '',
        createdAt: new Date().toISOString(),
      });

      navigate('/results', {
        state: {
          contractAddress:
            data.contract_address ||
            data.token_address ||
            (mode === 'address' ? extractAddress(contractAddress) : 'Solidity Source'),
          inputMode: mode,
          riskScore: data.risk_score,
          riskLevel: data.risk_level || (data.risk_score <= 30 ? 'Low' : data.risk_score <= 60 ? 'Medium' : data.risk_score <= 80 ? 'High' : 'Critical'),
          flags,
          saved: true,
          modelInfo,
          scoreSource: modelUsed ? 'model' : 'policy',
          verdictLabel: data.verdict_label || null,
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
    'Extracting 54 security features...',
    'Running rules and XGBoost scoring...',
    'Generating explainable assessment...',
  ];

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="block font-mono text-xs uppercase tracking-[0.18em] text-[#0149FD]">
            Scanner
          </span>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-gray-900 sm:text-4xl">
            Scan a contract
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
            Paste an Ethereum contract address or Solidity source. Verified contracts are scored by
            the rule engine and the model together; unverified ones are scored from bytecode, or
            return UNKNOWN when neither can be read.
          </p>
          <p className="mt-2 font-mono text-xs text-gray-400">
            No account required
          </p>
        </motion.div>

        {/* Scanner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-gray-200 p-6 md:p-8"
        >
          {isAnalyzing ? (
            <div className="py-12 flex flex-col items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-[#0149FD]/5 border border-[#0149FD]/10 flex items-center justify-center">
                <Dots className="w-4 h-4 text-[#0149FD]" dots={3} />
              </div>

              <div className="text-center">
                <p className="text-xl font-display font-semibold text-[#0a0a0a] mb-2">
                  Analyzing contract...
                </p>
                <p className="text-sm text-gray-400">
                  Fetching source, extracting signals, scoring risk
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
                      <Dots className="w-3 h-3 text-[#0149FD] shrink-0" dots={3} />
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
              <div id="scan-mode-tabs" className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
                <button
                  onClick={() => { setMode('address'); setError(''); }}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'address'
                      ? 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(15,18,22,0.06)]'
                      : 'text-gray-600 hover:text-gray-900'
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
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'solidity'
                      ? 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(15,18,22,0.06)]'
                      : 'text-gray-600 hover:text-gray-900'
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
                    <SmoothInput
                      id="scan-input"
                      type="text"
                      value={contractAddress}
                      onChange={(e) => { setContractAddress(e.target.value); setError(''); }}
                      placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f..."
                      aria-label="Ethereum contract address"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-200 focus:border-[#0149FD] focus:ring-4 focus:ring-[#0149FD]/10 focus:outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                    <p className="mt-2 text-xs text-gray-400">Enter any Ethereum mainnet contract address</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Solidity Source Code</label>
                    <textarea
                      id="scan-input"
                      value={solidityCode}
                      onChange={(e) => { setSolidityCode(e.target.value); setError(''); }}
                      placeholder={`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract MyToken {\n  // Paste your Solidity code here\n}`}
                      rows={12}
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-[#0149FD] focus:outline-none focus:ring-4 focus:ring-[#0149FD]/10"
                    />
                    <p className="mt-2 text-xs text-gray-400">
                      {solidityCode ? `${solidityCode.length.toLocaleString()} characters` : 'Paste complete Solidity contract source code'}
                    </p>
                  </div>
                )}

                {error && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -5, x: 0 }}
                    animate={{ opacity: 1, y: 0, x: [0, -5, 4, -2, 0] }}
                    transition={{ x: { duration: 0.35, ease: 'easeInOut' }, opacity: { duration: 0.2 } }}
                    className="mt-3 flex items-start gap-2 text-sm text-red-600"
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
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0149FD] text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#0033CC] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
              >
                Analyze Contract
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              {/* Supported Features */}
              <div className="mt-5 flex flex-wrap gap-5 text-xs text-gray-500">
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#0149FD]/50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  53+ Security Signals
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#0149FD]/50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  AI + Static Analysis
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#0149FD]/50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free for Basic Scans
                </span>
              </div>

              {/* API status */}
              {api.isConfigured && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  API connected
                </div>
              )}
            </>
          )}
        </motion.div>

        <ScanHints visible={mode === 'address' && !isAnalyzing} />

        {/* Example Contracts */}
        {mode === 'address' && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-gray-400">
              Example contracts
            </h3>
            <div id="scan-examples" className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {exampleContracts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => { setContractAddress(example.address); setError(''); }}
                  className="group rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-gray-300"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#0149FD]">{example.name}</p>
                    <span className="font-mono text-[10px] text-gray-400">{example.chain}</span>
                  </div>
                  <p className="truncate font-mono text-xs text-gray-400">{example.address}</p>
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
            className="mt-12 border-t border-gray-200 pt-8"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-400">
                How it works
              </span>
              <Link to="/how-it-works" className="text-xs text-[#0149FD] hover:underline ml-auto">
                See how it works
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Input', desc: 'Paste a contract address or Solidity source code' },
                { step: '02', title: 'Analysis', desc: 'Rules and model score 54 extracted features' },
                { step: '03', title: 'Result', desc: 'Get a risk score with explainable AI reasoning' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="shrink-0 font-mono text-xs text-gray-400">{item.step}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{item.desc}</p>
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
