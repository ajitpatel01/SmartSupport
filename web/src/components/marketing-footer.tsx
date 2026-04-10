import Link from "next/link";

const links = {
  product: [
    { href: "/product", label: "Product" },
    { href: "/pricing", label: "Pricing" },
    { href: "/security", label: "Security" },
  ],
  app: [
    { href: "/login", label: "Log in" },
    { href: "/register", label: "Sign up" },
    { href: "/app", label: "Console" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-border/80 border-t py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-2">
            <p className="text-foreground text-base font-semibold tracking-tight">AI-SmartSupport</p>
            <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
              AI-native ticketing for teams that need routing, SLAs, and tenant isolation without the
              enterprise bloat.
            </p>
          </div>
          <div>
            <p className="text-foreground mb-3 text-xs font-semibold uppercase tracking-wider opacity-90">
              Product
            </p>
            <ul className="space-y-2.5">
              {links.product.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-foreground mb-3 text-xs font-semibold uppercase tracking-wider opacity-90">
              App
            </p>
            <ul className="space-y-2.5">
              {links.app.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-border/80 mt-10 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} AI-SmartSupport. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
