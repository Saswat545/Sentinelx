import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Info, Minus, Plus } from 'lucide-react';
import { Reveal } from '../components/motion/Reveal';
import { CountUp } from '../components/motion/CountUp';
import { ScanDemo } from '../components/motion/ScanDemo';
import { TiltCard } from '../components/motion/TiltCard';
import { ScrollPath } from '../components/motion/ScrollPath';
import Magnet from '../components/bits/Magnet';
import ScrollFloat from '../components/bits/ScrollFloat';
import GlareHover from '../components/bits/GlareHover';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/Tooltip';
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
  {
    name: 'Honeypot logic',
    detail: 'Buy allowed, sell blocked',
    severity: 'Critical',
    tone: 'text-red-700 bg-red-50 border-red-200',
    hint: 'The contract lets wallets buy but reverts or blocks the sell path, so holders cannot exit.',
  },
  {
    name: 'Hidden mint',
    detail: 'Owner can mint supply later',
    severity: 'High',
    tone: 'text-orange-700 bg-orange-50 border-orange-200',
    hint: 'A privileged mint function can inflate supply at any time, diluting every holder.',
  },
  {
    name: 'Blacklist control',
    detail: 'Owner blocks wallets from selling',
    severity: 'High',
    tone: 'text-orange-700 bg-orange-50 border-orange-200',
    hint: 'An owner-managed blacklist can stop specific wallets from transferring tokens.',
  },
  {
    name: 'Mutable fees',
    detail: 'Transfer tax can be raised to 100%',
    severity: 'High',
    tone: 'text-orange-700 bg-orange-50 border-orange-200',
    hint: 'The fee is a variable the owner can raise, up to a level that makes selling pointless.',
  },
  {
    name: 'Proxy upgrades',
    detail: 'Logic replaced without a timelock',
    severity: 'Medium',
    tone: 'text-amber-800 bg-amber-50 border-amber-200',
    hint: 'The implementation behind the proxy can be swapped, so the code you read may not be the code that runs.',
  },
  {
    name: 'Owner privilege',
    detail: 'Single key can pause or drain',
    severity: 'Medium',
    tone: 'text-amber-800 bg-amber-50 border-amber-200',
    hint: 'One address holds powers that can freeze transfers or move funds.',
  },
];

const pipeline = [
  {
    label: 'Input',
    title: 'Paste an address or source',
    body: 'SentinelX pulls the verified Solidity from Etherscan, or reads the code you paste. No wallet connection, nothing to sign.',
  },
  {
    label: 'Extraction',
    title: '54 signals come out of the contract',
    body: 'Ownership, mint rights, fee switches, blacklist hooks, proxy patterns and assembly calls are read from the source and turned into features.',
  },
  {
    label: 'Scoring',
    title: 'Rules and model are fused into 0 to 100',
    body: 'Deterministic checks carry most of the score and the XGBoost model the rest, so a honeypot is caught by evidence rather than resemblance alone.',
  },
  {
    label: 'Explanation',
    title: 'You see what moved the score',
    body: 'SHAP attribution lists the signals that pushed the result up or down, so the number comes with its evidence instead of replacing it.',
  },
];

const faqs = [
  {
    q: 'What happens when the source is unverified?',
    a: 'SentinelX reads the deployed bytecode instead: proxies, mint entry points and ownership selectors are detectable without source. If the bytecode cannot be read either, the result is UNKNOWN rather than a made-up score.',
  },
  {
    q: 'What does the risk score measure?',
    a: 'It combines two engines: deterministic checks that name what the contract can do, and an XGBoost model trained on 2,400 labelled contracts. Each result lists the rules and the model contributions behind the number.',
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
  { value: 54, decimals: 0, suffix: '', label: 'Features per contract' },
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
          className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(1,73,253,0.06),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-32 lg:pb-24 lg:pt-40">
          <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.p
                variants={item}
                className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#0149FD]"
              >
                Smart contract security
              </motion.p>
              <motion.h1
                variants={item}
                className="mt-6 max-w-[20ch] text-balance text-[38px] font-semibold leading-[1.04] tracking-[-0.035em] text-gray-900 sm:text-[46px] lg:text-[54px]"
              >
                Know what a contract does before you sign it.
              </motion.h1>
              <motion.p
                variants={item}
                className="mt-6 max-w-xl text-[16px] leading-[1.65] text-gray-600"
              >
                SentinelX scores Ethereum contracts for rug pull risk and lists the signals behind
                each score: honeypot logic, hidden mint rights, mutable fees, proxy upgrades, and
                owner control.
              </motion.p>
              <motion.div variants={item} className="mt-9 flex flex-col gap-3 sm:flex-row">
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
              <motion.p variants={item} className="mt-9 font-mono text-[12px] text-gray-500">
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
        <div className="mx-auto max-w-6xl px-6 py-12">
          <dl className="grid grid-cols-2 gap-y-9 sm:grid-cols-4 sm:divide-x sm:divide-gray-200">
            {metrics.map((metric) => (
              <div key={metric.label} className="sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <dt className="font-mono text-[12px] uppercase tracking-[0.12em] text-gray-500">
                  {metric.label}
                </dt>
                <dd className="mt-1.5 text-[24px] font-semibold tabular-nums tracking-[-0.02em] text-gray-900">
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
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <Reveal>
            <div className="flex flex-col items-start gap-3">
              <ScrollFloat
                containerClassName="my-0"
                textClassName="!text-left !text-[28px] sm:!text-[34px] !font-semibold !leading-[1.2] !tracking-[-0.03em] text-gray-900"
                stagger={0.016}
                distance={70}
                animationDuration={0.8}
                scrollStart="top 90%"
                scrollEnd="top 55%"
              >
                What the scanner checks
              </ScrollFloat>
              <p className="order-first font-mono text-[12px] text-gray-500">Six of the 54 signals</p>
            </div>
          </Reveal>

          <div className="mt-10 grid auto-rows-fr gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-3">
            {checks.map((check, index) => (
              <Reveal key={check.name} delay={index * 0.05} className="h-full bg-white">
                <div className="group flex h-full flex-col p-7 transition-colors duration-300 hover:bg-[#FAFAFB]">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-gray-900">
                      {check.name}
                    </h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={`inline-flex w-[94px] shrink-0 items-center justify-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[12px] uppercase tracking-wide transition-colors duration-200 ${check.tone}`}
                        >
                          {check.severity}
                          <Info className="h-3 w-3 opacity-60" aria-hidden="true" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{check.hint}</TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="mt-2.5 text-[14px] leading-[1.65] text-gray-600">{check.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Incident ledger */}
      <section className="border-b border-gray-200 bg-[#F7F8FA]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <Reveal>
            <div className="flex flex-col items-start gap-3">
              <ScrollFloat
                containerClassName="my-0"
                textClassName="!text-left !text-[28px] sm:!text-[34px] !font-semibold !leading-[1.2] !tracking-[-0.03em] text-gray-900"
                stagger={0.016}
                distance={70}
                animationDuration={0.8}
                scrollStart="top 90%"
                scrollEnd="top 55%"
              >
                Incidents the signals were built from
              </ScrollFloat>
              <p className="order-first font-mono text-[12px] text-gray-500">Public record</p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="mt-10 overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Project', 'Lost', 'Date', 'Pattern'].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-gray-500"
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
                    <td className="px-5 py-4 font-medium text-gray-900">{incident.project}</td>
                    <td className="px-5 py-4 font-mono tabular-nums text-gray-900">
                      {incident.lost}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-500">{incident.date}</td>
                    <td className="px-5 py-4 text-gray-600">{incident.pattern}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* Scroll-drawn pipeline */}
      <ScrollPath
        eyebrow="How a scan runs"
        title="Four steps from address to explained score."
        intro="The model reads code. Every result names the signals that moved the score, so you can check the reasoning instead of trusting a number."
        steps={pipeline}
      />

      {/* Limits */}
      <section className="border-b border-gray-200 bg-[#F7F8FA]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <Reveal>
            <h2 className="max-w-2xl text-balance text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[34px]">
              What the score cannot tell you
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-[1.65] text-gray-600">
              A model that hides its limits is a liability. These are the three that matter most.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: 'Unverified code limits it',
                body: 'Without source, only bytecode checks run. When neither the source nor the bytecode can be read, the result is UNKNOWN, not a low score.',
              },
              {
                title: 'It has not seen your trade',
                body: 'The model scores the contract only. Liquidity depth, holder distribution, and team history are outside it.',
              },
              {
                title: 'It is not advice',
                body: 'A result is a signal set for your own research. Read the findings, then decide.',
              },
            ].map((limit, index) => (
              <Reveal key={limit.title} delay={index * 0.07}>
                <div className="h-full rounded-xl border border-gray-200 bg-white p-7 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_2px_10px_rgba(15,18,22,0.04)]">
                  <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-gray-900">
                    {limit.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-[1.65] text-gray-600">{limit.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)]">
            <Reveal>
              <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[34px]">
                Questions we get
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-gray-600">
                Answered the same way we would answer them in person.
              </p>
            </Reveal>
            <div className="border-t border-gray-200 lg:mt-2">
              {faqs.map((faq, index) => {
                const open = openFaq === index;
                return (
                  <div key={faq.q} className="border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : index)}
                      aria-expanded={open}
                      className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors duration-200 hover:text-[#0149FD]"
                    >
                      <span className="text-[16px] font-medium tracking-[-0.01em] text-gray-900">
                        {faq.q}
                      </span>
                      {open ? (
                        <Minus className="mt-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                      ) : (
                        <Plus className="mt-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
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
                          <p className="max-w-2xl pb-5 pr-10 text-[14px] leading-[1.7] text-gray-600">
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
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <Reveal>
            <GlareHover
              width="100%"
              borderRadius="1rem"
              background="#0A0C10"
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
                className="pointer-events-none absolute -right-16 -top-24 z-[1] h-64 w-64 rounded-full bg-[#0149FD]/20 blur-3xl"
              />
              <div className="relative z-[1] flex flex-col items-start justify-between gap-7 px-8 py-12 sm:flex-row sm:items-center sm:px-12">
                <div>
                  <h2 className="max-w-md text-balance text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
                    Scan a contract before you connect a wallet
                  </h2>
                  <p className="mt-2 text-[14px] text-white/50">
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
