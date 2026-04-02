import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t py-10 text-muted-foreground text-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} AI-SmartSupport. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/security" className="hover:text-foreground">
            Security
          </Link>
          <Link href="/login" className="hover:text-foreground">
            App
          </Link>
        </div>
      </div>
    </footer>
  );
}
