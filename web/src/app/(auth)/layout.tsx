import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          AI-SmartSupport
        </Link>
      </div>
      {children}
    </div>
  );
}
