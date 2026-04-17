import { ReactNode } from 'react';

type SectionShellProps = {
  title: string;
  description: string;
  children?: ReactNode;
  action?: ReactNode;
};

export function SectionShell({ title, description, children, action }: SectionShellProps) {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-glow">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">WNBA Card Collector</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-slate-300">{description}</p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
