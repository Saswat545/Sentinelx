export type NavigationPage = 
  | 'landing' 
  | 'auth' 
  | 'dashboard' 
  | 'analyzer' 
  | 'result' 
  | 'history' 
  | 'pricing' 
  | 'settings' 
  | 'docs' 
  | '404' 
  | '500' 
  | 'maintenance' 
  | 'offline';

export type AuthMode = 'login' | 'signup' | 'forgot-password';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';

export interface ShapFeature {
  featureName: string;
  value: string | number;
  impactScore: number; // positive = increases risk, negative = decreases risk
  description: string;
  category: 'Liquidity' | 'Ownership' | 'Tax/Fees' | 'Code/AST' | 'Proxy/Upgrade';
}

export interface VulnerabilityItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  lineRange?: string;
  codeSnippet?: string;
  description: string;
  remediation: string;
  category: string;
  confidenceScore: number;
}

export interface SmartContractReport {
  id: string;
  contractName: string;
  tokenSymbol?: string;
  address?: string;
  network: 'Ethereum Mainnet' | 'Arbitrum One' | 'Base' | 'Polygon' | 'Custom';
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  confidence: number; // 0 to 100%
  mlPrediction: 'HIGH RUG PULL RISK' | 'MODERATE RUG PULL RISK' | 'LOW RUG PULL RISK' | 'VERIFIED SAFE';
  analyzedAt: string;
  processingTimeMs: number;
  modelVersion: string;
  shapFeatures: ShapFeature[];
  vulnerabilities: VulnerabilityItem[];
  liquidityLocked: boolean;
  liquidityLockDays?: number;
  isRenounced: boolean;
  maxSellFeePercent: number;
  hasHiddenMint: boolean;
  hasBlacklist: boolean;
  hasPauseFunction: boolean;
  isProxy: boolean;
  codeLengthLines: number;
  sourceCode: string;
  tags: string[];
  isFavorite?: boolean;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey?: string;
  createdAt: string;
  lastUsedAt: string;
  requestsCount: number;
  monthlyLimit: number;
  status: 'active' | 'revoked';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  company?: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  analysesUsed: number;
  analysesLimit: number;
  apiKeyCount: number;
}
