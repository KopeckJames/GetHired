import { Link } from "@remix-run/react";
import Navigation from "./Navigation";
import LoginButton from "./LoginButton";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold text-slate-900">
                GetHired!
              </Link>
            </div>
            <div>
              <LoginButton />
            </div>
          </div>
        </div>
        <Navigation />
      </header>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} GetHired! All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
