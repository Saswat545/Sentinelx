import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { Reveal } from '../components/motion/Reveal';
import { CountUp } from '../components/motion/CountUp';
import { ScanDemo } from '../components/motion/ScanDemo';
import { TiltCard } from '../components/motion/TiltCard';
import Magnet from '../components/bits/Magnet';
import ScrollFloat from '../components/bits/ScrollFloat';
import GlareHover from '../components/bits/GlareHover';
import { useAuth } from '../lib/auth';

const incidentLedger = [
  { project: 'Squid Game Token', lost: '$3.4M', date: 'Nov 2021', pattern: 'Sell function disabled after launch' },
  { project: 'AnubisDAO', lost: '$60.0M', date: 'Oct 2021', pattern: 'Liquidity moved to deployer wallet in 24 hours' },
  { project: 'Meerkat Finance', lost: '$31.0M', date: 'Mar 2021', pattern: 'Vault drained hours after launch' },
  { project: 'Forsage', lost: '$340M', date: 'Aug 2022', pattern: 'Contract enforced a referral pyramid' },
  { project: 'DeFi100', lost: '$32.0M', date: 'May 2021', pattern: 'Treasury withdrawn, site replaced with a taunt' },
  { project: 'TurtleDex', lost: '$2.5M', date: 'Mar 2022', pattern: 'Pooled tokens swapped out within minutes' },
];

const checks = [
  { name: 'Honeypot logic', detail: 'Buy allowed, sell blocked', severity: 'Critical', tone: 'text-red-700 bg-red-50 border-red-200' },
  { name: 'Hidden mint', detail: 'Owner can mint supply later', severity: 'High', tone: 'text-orange-700 bg-orange-50 border-orange-200' },
  { name: 'Blacklist control', detail: 'Owner blocks wallets from selling', severity: 'High', tone: 'text-orange-700 bg-orange-50 border-orange-200' },
  { name: 'Mutable fees', detail: 'Transfer tax can be raised to 100%', severity: 'High', tone: 'text-orange-700 bg-orange-50 border-orange-200' },
  { name: 'Proxy upgrades', detail: 'Logic replaced without a timelock', severity: 'Medium', tone: 'text-amber-800 bg-amber-50 border-amber-200' },
  { name: 'Owner privilege', detail: 'Single key can pause or drain', severity: 'Medium', tone: 'text-amber-800 bg-amber-50 border-amber-200' },
];

const steps = [
  {
    title: 'Paste an address or source',
    detail: 'SentinelX pulls the verified Solidity from Etherscan, or reads the code you paste.',
  },
  {
    title: 'Features are extracted',
    detail: '53 signals come out of the contract: ownership, mint rights, fee switches, proxy patterns, assembly calls.',
  },
  {
    title: 'The model scores the risk',
    detail: 'An XGBoost classifier trained on 2,400 labelled contracts returns a score from 0 to 100.',
  },
  {
    title: 'You see what moved the score',
    detail: 'SHAP attribution lists the signals that pushed the result up or down, so the number is not a black box.',
  },
];

const faqs = [
  {
    q: 'Why does an unverified contract always score 90?',
    a: 'Without verified source code there are no features to extract, so the model cannot run. Every unverified address gets a fixed score of 90 from a policy rule and the result page says so. That is a warning about missing evidence, not a model prediction.',
  },
  {
    q: 'What does the risk score measure?',
    a: 'The score estimates how closely a contract resembles known rug pull patterns. The model uses an XGBoost classifier trained on 2,400 labelled contracts, and each result lists the signals that drove the number.',
  },
  {
    q: 'Can SentinelX analyse any Ethereum contract?',
    a: 'Any contract with verified source on Etherscan, or any Solidity source you paste. Contracts on other chains are not supported yet.',
  },
  {
    q: 'Does a low score mean the contract is safe?',
    a: 'No. A low score means the contract does not match the patterns the model was trained on. It cannot see off-chain promises, key custody, or liquidity that sits outside the contract.',
  },
  {
    q: 'Do I need an account?',
    a: 'No for a single scan. An account keeps your scan history, saves results, and unlocks the full list of signals instead of the first three.',
  },
];

const metrics = [
  { value: 96.15, decimals: 2, suffix: '%', label: 'Model accuracy' },
  { value: 53, decimals: 0, suffix: '', label: 'Signals per contract' },
  { value: 2400, decimals: 0, suffix: '', label: 'Labelled contracts' },
  { value: 3, decimals: 0, suffix: 's', label: 'Typical response' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { user, isConfigured } = useAuth();
  const signedIn = isConfigured && !!user;

  return (
    <div className="bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-200">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(1,73,253,0.06),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-32 pb-16 lg:pt-36 lg:pb-20">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.p
                variants={item}
                className="font-mono text-xs uppercase tracking-[0.18em] text-[#0149FD]"
              >
                Smart contract security
              </motion.p>
              <motion.h1
                variants={item}
                className="mt-5 max-w-[22ch] text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.03em] text-gray-900 sm:text-5xl lg:text-[48px]"
              >
                Know what a contract does before you sign it.
              </motion.h1>
              <motion.p
                variants={item}
                className="mt-6 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg"
              >
                SentinelX scores Ethereum contracts for rug pull risk and lists the signals behind
                each score: honeypot logic, hidden mint rights, mutable fees, proxy upgrades, and
                owner control.
              </motion.p>
              <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Magnet padding={70} magnetStrength={9} maxOffset={6} scale={1.015}>
                  <Link
                    to="/scan"
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0149FD] px-6 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#0033CC]"
                  >
                    Scan a contract
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </Magnet>
                <Link
                  to="/how-it-works"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-6 text-sm font-medium text-gray-700 transition-colors duration-300 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.985]"
                >
                  See how scoring works
                </Link>
              </motion.div>
              <motion.p variants={item} className="mt-8 font-mono text-xs text-gray-400">
                Ethereum mainnet · Read only, no wallet connection · Source via Etherscan
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <TiltCard className="rounded-[1.25rem] border border-gray-200 bg-[#F7F8FA] p-1.5 shadow-[0_1px_2px_rgba(15,18,22,0.04)]">
                <ScanDemo />
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <dl className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:divide-x sm:divide-gray-200">
            {metrics.map((metric) => (
              <div key={metric.label} className="sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-400">
                  {metric.label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  <CountUp to={metric.value} decimals={metric.decimals} />
                  {metric.suffix}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What the scanner checks */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <Reveal>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <ScrollFloat
                containerClassName="my-0"
                textClassName="!text-left !text-[26px] sm:!text-[30px] !font-semibold !leading-[1.3] !tracking-[-0.02em] text-gray-900"
                stagger={0.016}
                distance={70}
                animationDuration={0.8}
                scrollStart="center bottom+=35%"
                scrollEnd="bottom bottom-=25%"
              >
                What the scanner checks
              </ScrollFloat>
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-gray-400">
                Six of the 53 signals
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-3">
            {checks.map((check, index) => (
              <Reveal key={check.name} delay={index * 0.05} className="bg-white">
                <div className="group h-full p-6 transition-colors duration-300 hover:bg-[#FAFAFB]">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">{check.name}</h3>
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${check.tone}`}
                    >
                      {check.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{check.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Incident ledger */}
      <section className="border-b border-gray-200 bg-[#F7F8FA]">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <Reveal>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <ScrollFloat
                containerClassName="my-0"
                textClassName="!text-left !text-[26px] sm:!text-[30px] !font-semibold !leading-[1.3] !tracking-[-0.02em] text-gray-900"
                stagger={0.016}
                distance={70}
                animationDuration={0.8}
                scrollStart="center bottom+=35%"
                scrollEnd="bottom bottom-=25%"
              >
                Incidents the signals were built from
              </ScrollFloat>
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-gray-400">
                Public record
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="mt-8 overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Project', 'Lost', 'Date', 'Pattern'].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {incidentLedger.map((incident) => (
                  <tr
                    key={incident.project}
                    className="transition-colors duration-200 hover:bg-[#FAFAFB]"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-900">{incident.project}</td>
                    <td className="px-5 py-3.5 font-mono tabular-nums text-gray-900">
                      {incident.lost}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">{incident.date}</td>
                    <td className="px-5 py-3.5 text-gray-600">{incident.pattern}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                How a scan runs
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600">
                The model reads code. Every result names the signals that moved the score.
              </p>
              <Link
                to="/methodology"
                className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#0149FD] hover:underline"
              >
                Read the methodology
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>

            <ol className="divide-y divide-gray-200 border-t border-gray-200">
              {steps.map((step, index) => (
                <Reveal as="li" key={step.title} delay={index * 0.06} className="flex gap-5 py-5">
                  <span className="pt-1 font-mono text-xs text-gray-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.detail}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Limits */}
      <section className="border-b border-gray-200 bg-[#F7F8FA]">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              What the score cannot tell you
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'It needs verified source',
                body: 'Unverified contracts cannot be analysed, so they get a fixed policy score of 90 and the result says so.',
              },
              {
                title: 'It has not seen your trade',
                body: 'The model scores the contract only. Liquidity depth, holder distribution, and team history are outside it.',
              },
              {
                title: 'It is not advice',
                body: 'A result is a signal set for your own research. Read the findings, then decide.',
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 0.07}>
                <div className="h-full rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_2px_10px_rgba(15,18,22,0.04)]">
                  <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                Questions we get
              </h2>
            </Reveal>
            <div className="border-t border-gray-200">
              {faqs.map((faq, index) => {
                const open = openFaq === index;
                return (
                  <div key={faq.q} className="border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : index)}
                      aria-expanded={open}
                      className="flex w-full items-start justify-between gap-6 py-4 text-left"
                    >
                      <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                      {open ? (
                        <Minus className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                      ) : (
                        <Plus className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 pr-10 text-sm leading-relaxed text-gray-600">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <Reveal>
            <GlareHover
              width="100%"
              borderRadius="1rem"
              background="#111827"
              borderColor="transparent"
              glareColor="#8FB0FF"
              glareOpacity={0.32}
              glareAngle={-30}
              glareSize={26}
              variant="sheen"
              mode="follow"
              transitionDuration={900}
              style={{ display: 'block', justifyItems: 'normal' }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 z-[1] h-64 w-64 rounded-full bg-[#0149FD]/20 blur-3xl"
              />
              <div className="relative z-[1] flex flex-col items-start justify-between gap-6 px-8 py-10 sm:flex-row sm:items-center sm:px-10">
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">
                    Scan a contract before you connect a wallet
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-400">
                    Free for a single scan. No account needed.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/scan"
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0149FD] px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#2B62FF] active:scale-[0.985]"
                  >
                    Scan a contract
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                  <Link
                    to={signedIn ? '/dashboard' : '/signup'}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 px-6 text-sm font-medium text-white transition-colors duration-300 hover:border-white/40 hover:bg-white/5 active:scale-[0.985]"
                  >
                    {signedIn ? 'Open dashboard' : 'Create free account'}
                  </Link>
                </div>
              </div>
            </GlareHover>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
