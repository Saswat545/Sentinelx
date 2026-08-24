import React from 'react';
import { motion } from 'framer-motion';

export function ExplainableAISection() {
  return (
    <section className="py-24 px-4 bg-dark-surface/30 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="glass rounded-2xl p-8 border border-brand-cobalt/30">
              <h4 className="text-sm font-mono text-dark-muted mb-4">SHAP Feature Importance</h4>
              
              {/* SHAP visualization */}
              <div className="space-y-4">
                {[
                  { feature: 'is_honeypot', impact: 0.85, direction: 'positive' },
                  { feature: 'owner_percent', impact: 0.72, direction: 'positive' },
                  { feature: 'has_mint', impact: 0.68, direction: 'positive' },
                  { feature: 'has_proxy', impact: 0.54, direction: 'positive' },
                  { feature: 'trade_fee', impact: 0.41, direction: 'negative' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 text-xs font-mono text-dark-muted truncate">{item.feature}</div>
                    <div className="flex-1 h-3 bg-dark-deep rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.impact * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full rounded-full ${item.direction === 'positive' ? 'bg-brand-danger' : 'bg-green-500'}`}
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-mono text-dark-muted">
                      {(item.impact * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-dark-border">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-danger" />
                    <span className="text-dark-muted">Increases Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-dark-muted">Decreases Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <span className="text-brand-cobalt font-mono text-sm tracking-wider uppercase mb-4 block">
              Explainable AI
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Why should I trust the result?
            </h2>
            <p className="text-dark-muted text-lg mb-8 leading-relaxed">
              SentinelX doesn't just give you a score — it shows you exactly which features 
              contributed to the risk assessment using SHAP (SHapley Additive exPlanations).
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-cobalt/10 flex items-center justify-center text-brand-cobalt flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-semibold mb-1">Transparent Analysis</h4>
                  <p className="text-sm text-dark-muted">See exactly which contract features triggered the risk score.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-cobalt/10 flex items-center justify-center text-brand-cobalt flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-semibold mb-1">Feature Breakdown</h4>
                  <p className="text-sm text-dark-muted">Understand the contribution of each security signal.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-cobalt/10 flex items-center justify-center text-brand-cobalt flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-semibold mb-1">No Black Box</h4>
                  <p className="text-sm text-dark-muted">Every decision is explainable and auditable.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
