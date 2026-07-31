import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { authFadeUp } from './auth-motion';

interface AuthPageShellProps {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  formTitle: ReactNode;
  children: ReactNode;
}

export const AuthPageShell = ({
  eyebrow,
  heroTitle,
  heroDescription,
  formTitle,
  children,
}: AuthPageShellProps) => (
  <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
    <div className="pointer-events-none fixed inset-0">
      <div className="absolute inset-0 bg-neutral-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.16),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_75%,rgba(6,182,212,0.08),transparent_38%)]" />
    </div>

    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:gap-16">
      <motion.header
        initial="hidden"
        animate="visible"
        variants={authFadeUp}
        className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left"
      >
        <span className="text-xs uppercase tracking-[0.4em] text-cyan-300">{eyebrow}</span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
          {heroTitle}
        </h1>
        <p className="mt-4 max-w-lg text-neutral-300">{heroDescription}</p>
      </motion.header>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={authFadeUp}
        aria-labelledby="auth-form-title"
        className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900/80 p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur md:p-10"
      >
        <motion.h2
          id="auth-form-title"
          variants={authFadeUp}
          className="mb-8 text-center text-2xl font-extrabold tracking-tight md:text-3xl"
        >
          {formTitle}
        </motion.h2>
        {children}
      </motion.section>
    </div>
  </main>
);
