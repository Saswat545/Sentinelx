import React from 'react';
import { motion } from 'framer-motion';

export function TrustMetricsSection() {
  return (
    <section className="py-24 px-4 bg-dark-surface/30 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] bg-brand-cobalt/5 rounded-full blur-3xl" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-brand-cobalt font-mono text-sm tracking-wider uppercase mb-4 block">
            Trust & Metrics
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Why should I believe you?
          </h2>
          <p className="text-lg text-dark-muted max-w-3xl mx-auto">
            Built on transparent, verifiable technology with proven results.
          </p>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { value: '96.15%', label: 'Accuracy', sublabel: 'Evaluation metric' },
            { value: '97.98%', label: 'F1 Score', sublabel: 'Balanced performance' },
            { value: '98.54%', label: 'AUC-ROC', sublabel: 'Discrimination ability' },
            { value: '53+', label: 'Features', sublabel: 'Security signals' },
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass rounded-xl p-6 text-center border border-dark-border"
            >
              <div className="text-3xl md:text-4xl font-display font-bold text-brand-cobalt mb-2">{metric.value}</div>
              <div className="text-sm font-semibold mb-1">{metric.label}</div>
              <div className="text-xs text-dark-muted">{metric.sublabel}</div>
            </motion.div>
          ))}
        </div>

        {/* Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h3 className="text-center text-lg font-display font-semibold mb-8 text-dark-muted">
            Trusted Ecosystem & Security Infrastructure
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {/* Real integration logos */}
            {[
              { name: 'Supabase', url: 'https://supabase.com' },
              { name: 'Clerk', url: 'https://clerk.com' },
              { name: 'Vercel', url: 'https://vercel.com' },
              { name: 'GitHub', url: 'https://github.com' },
              { name: 'Resend', url: 'https://resend.com' },
              { name: 'Cloudflare', url: 'https://cloudflare.com' },
            ].map((integration, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1 }}
                className="opacity-60 hover:opacity-100 transition-opacity duration-300"
              >
                <div className="px-6 py-3 glass rounded-lg border border-dark-border">
                  <span className="text-sm font-mono text-dark-muted">{integration.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center text-xs text-dark-muted mt-12 max-w-2xl mx-auto"
        >
          * Model metrics are evaluation results from our training dataset. 
          SentinelX identifies potential security risks — it does not guarantee 
          the safety or profitability of any asset. This is not financial advice.
        </motion.p>
      </div>
    </section>
  );
}
