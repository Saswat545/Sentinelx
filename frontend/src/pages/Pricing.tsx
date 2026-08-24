import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Pricing() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">Pricing</span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#0a0a0a] mb-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Start analyzing smart contracts for free. Upgrade when you need more.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Free', price: '$0', period: 'forever', features: ['5 scans per day', 'Basic risk analysis', 'Email support'], cta: 'Get Started', ctaHref: '/scan', popular: false },
            { name: 'Pro', price: '$29', period: 'per month', features: ['Unlimited scans', 'Advanced analysis', 'API access', 'Priority support'], cta: 'Start Pro Trial', ctaHref: '/signup', popular: true },
            { name: 'Enterprise', price: 'Custom', period: '', features: ['Custom limits', 'Dedicated support', 'SLA guarantee', 'On-premise option'], cta: 'Contact Sales', ctaHref: '/contact', popular: false },
          ].map((plan, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={`rounded-2xl p-8 border ${plan.popular ? 'bg-white border-[#6D001A] relative shadow-lg shadow-[#6D001A]/10' : 'bg-white border-gray-200 shadow-sm'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-[#6D001A] text-white text-xs font-semibold rounded-full">Most Popular</div>}
              <h3 className="text-xl font-display font-semibold text-[#0a0a0a] mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold text-[#0a0a0a]">{plan.price}</span>
                {plan.period && <span className="text-gray-400 text-sm ml-1">/{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-[#6D001A]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to={plan.ctaHref} className={`block w-full py-3 rounded-xl font-semibold transition-all duration-300 text-center ${plan.popular ? 'bg-[#6D001A] hover:bg-[#8B0023] text-white' : 'bg-gray-50 hover:bg-gray-100 text-[#0a0a0a] border border-gray-200'}`}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
