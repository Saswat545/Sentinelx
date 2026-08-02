import React, { useState } from 'react';
import { NavigationPage } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Check, CreditCard, X } from 'lucide-react';

interface PricingScreenProps {
  onNavigate: (page: NavigationPage) => void;
}

export const PricingScreen: React.FC<PricingScreenProps> = ({ onNavigate }) => {
  const [annual, setAnnual] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSimulateCheckout = (planName: string) => {
    setCheckoutPlan(planName);
    setPaymentSuccess(false);
  };

  const handleConfirmPayment = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setCheckoutPlan(null);
      setPaymentSuccess(false);
      onNavigate('dashboard');
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-[#0B0F17] text-gray-100">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4 font-mono">
        <Badge variant="info">Predictable SaaS Plans</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          SentinelX Pricing Plans
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-sans">
          From individual traders to DeFi protocol teams, security leads, and institutional audit firms.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center bg-[#111827] p-1 rounded-lg border border-gray-800 mt-4">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-1.5 text-xs font-mono rounded transition-all cursor-pointer ${
              !annual ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-1.5 text-xs font-mono rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              annual ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-800">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Tier 1: Free */}
        <Card className="p-6 space-y-6 flex flex-col justify-between bg-[#111827] border-gray-800">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white font-mono">Developer Free</h3>
              <p className="text-xs text-gray-400 mt-1 font-sans">For individual developers testing smart contract safety.</p>
            </div>

            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-xs text-gray-400 font-medium">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-300 pt-4 border-t border-gray-800 font-sans">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100 Contract Scans / month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>53 Feature XGBoost Classifier</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Basic SHAP Feature Summary</span>
              </li>
            </ul>
          </div>

          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => onNavigate('analyzer')}
          >
            Get Started
          </Button>
        </Card>

        {/* Tier 2: Pro */}
        <Card className="p-6 space-y-6 flex flex-col justify-between bg-[#111827] border-2 border-blue-600 relative shadow-xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-0.5 rounded">
            Most Popular
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white font-mono">Pro Security</h3>
              <p className="text-xs text-gray-400 mt-1 font-sans">For Web3 traders, protocols & security leads.</p>
            </div>

            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-4xl font-extrabold text-white">
                ${annual ? '63' : '79'}
              </span>
              <span className="text-xs text-gray-400 font-medium">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-300 pt-4 border-t border-gray-800 font-sans">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <strong className="text-white">1,000 Contract Scans / month</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Full TreeSHAP Waterfall Engine</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>5 REST API Keys</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>PDF Audit Report Export</span>
              </li>
            </ul>
          </div>

          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={() => handleSimulateCheckout('Pro Security Plan')}
          >
            Upgrade to Pro
          </Button>
        </Card>

        {/* Tier 3: Enterprise */}
        <Card className="p-6 space-y-6 flex flex-col justify-between bg-[#111827] border-gray-800">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white font-mono">Enterprise Audit</h3>
              <p className="text-xs text-gray-400 mt-1 font-sans">For hedge funds, exchanges & security firms.</p>
            </div>

            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-4xl font-extrabold text-white">
                ${annual ? '319' : '399'}
              </span>
              <span className="text-xs text-gray-400 font-medium">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-300 pt-4 border-t border-gray-800 font-sans">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <strong className="text-white">Unlimited Smart Contract Scans</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom Model Retraining</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated FastAPI Cluster</span>
              </li>
            </ul>
          </div>

          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => handleSimulateCheckout('Enterprise Audit Plan')}
          >
            Contact Enterprise
          </Button>
        </Card>

      </div>

      {/* Stripe Modal Simulation */}
      {checkoutPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] rounded-xl max-w-md w-full p-6 space-y-6 border border-gray-800 shadow-2xl animate-in zoom-in-95 font-mono">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-sm">Stripe Checkout</h3>
              </div>
              <button
                onClick={() => setCheckoutPlan(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-base">Subscription Activated!</h4>
                <p className="text-xs text-gray-400">Redirecting to console...</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#0B0F17] rounded-lg border border-gray-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">{checkoutPlan}</span>
                    <span className="text-gray-400 text-[11px]">{annual ? 'Billed annually' : 'Billed monthly'}</span>
                  </div>
                  <span className="font-extrabold text-sm text-white">
                    {checkoutPlan.includes('Pro') ? (annual ? '$756/yr' : '$79/mo') : '$3,828/yr'}
                  </span>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Card Number</label>
                  <input
                    type="text"
                    defaultValue="4242 •••• •••• 4242"
                    className="w-full p-2.5 border border-gray-800 rounded-lg font-mono text-xs bg-[#0B0F17] text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Expiry</label>
                    <input
                      type="text"
                      defaultValue="08/28"
                      className="w-full p-2.5 border border-gray-800 rounded-lg font-mono text-xs bg-[#0B0F17] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">CVC</label>
                    <input
                      type="text"
                      defaultValue="888"
                      className="w-full p-2.5 border border-gray-800 rounded-lg font-mono text-xs bg-[#0B0F17] text-white"
                    />
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full justify-center mt-2"
                  onClick={handleConfirmPayment}
                >
                  Confirm & Pay Subscription
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
