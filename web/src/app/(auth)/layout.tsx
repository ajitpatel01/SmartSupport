import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-20%,oklch(0.35_0.08_158/0.32)_0%,transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_90%_10%,oklch(0.28_0.06_158/0.18)_0%,transparent_50%)]"
        aria-hidden
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="mb-8 text-center sm:mb-10">
          <Link
            href="/"
            className="text-foreground text-xl font-semibold tracking-tight transition-opacity hover:opacity-90"
          >
            AI-SmartSupport
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
