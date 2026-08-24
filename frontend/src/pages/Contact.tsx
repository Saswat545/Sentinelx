import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-[#0a0a0a] transition-colors">Home</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-[#0a0a0a]">Contact</span>
          </div>
          <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">Get in Touch</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0a0a0a] mb-2">Contact Us</h1>
          <p className="text-gray-500">Have questions? We'd love to hear from you.</p>
        </motion.div>

        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-[#6D001A]/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#6D001A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-2">Message Sent!</h2>
            <p className="text-gray-500">We'll get back to you within 24 hours.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <form onSubmit={() => setSubmitted(true)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Name</label>
                <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0a0a] placeholder-gray-400 focus:outline-none focus:border-[#6D001A] focus:ring-1 focus:ring-[#6D001A]/20 transition-all duration-300" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0a0a] placeholder-gray-400 focus:outline-none focus:border-[#6D001A] focus:ring-1 focus:ring-[#6D001A]/20 transition-all duration-300" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Subject</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0a0a] focus:outline-none focus:border-[#6D001A] focus:ring-1 focus:ring-[#6D001A]/20 transition-all duration-300 appearance-none">
                  <option>General</option>
                  <option>Security</option>
                  <option>Business</option>
                  <option>Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Message</label>
                <textarea required rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0a0a] placeholder-gray-400 focus:outline-none focus:border-[#6D001A] focus:ring-1 focus:ring-[#6D001A]/20 transition-all duration-300 resize-none" placeholder="How can we help?" />
              </div>
              <button type="submit" className="w-full py-3 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-xl transition-all duration-300">
                Send Message
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
