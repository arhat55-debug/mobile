import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Gamepad2, ShieldCheck } from "lucide-react";
import { cn } from "../utils/cn";

const NAV = [
  { to: "/", label: "Нүүр" },
  { to: "/browse?category=sale", label: "Аккаунтууд", match: "sale" },
  { to: "/browse?category=rental", label: "Түрээс", match: "rental" },
  { to: "/sell", label: "Бидэнд Зарах" },
];

function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  const isActive = (item: (typeof NAV)[number]) => {
    if (item.match) return loc.search.includes(item.match);
    return loc.pathname === item.to && !loc.search;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white/[0.04] transition group-hover:bg-white group-hover:text-black">
            <Gamepad2 className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            NEXUS<span className="text-white/40">MLBB</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "relative rounded-lg px-4 py-2 text-sm transition",
                isActive(item) ? "text-white" : "text-white/50 hover:text-white",
              )}
            >
              {isActive(item) && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-lg border border-line bg-white/[0.05]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="hidden items-center gap-1.5 rounded-xl border border-line bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white md:flex"
          >
            <ShieldCheck className="h-4 w-4" /> Admin
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {[...NAV, { to: "/admin", label: "Admin" }].map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            <span className="font-display text-base font-bold">NEXUS MLBB</span>
          </div>
          <p className="text-sm text-white/40">
            Баталгаажсан Mobile Legends аккаунт, түрээс болон худалдан авалтын тэргүүлэх зах зээл.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Зах зээл
          </h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/browse?category=sale" className="hover:text-white">Зарагдаж буй аккаунтууд</Link></li>
            <li><Link to="/browse?category=rental" className="hover:text-white">Аккаунт түрээслэх</Link></li>
            <li><Link to="/sell" className="hover:text-white">Бид аккаунт худалдаж авна</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Компани
          </h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/browse" className="hover:text-white">Бүгдийг үзэх</Link></li>
            <li><Link to="/admin" className="hover:text-white">Admin Portal</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Аюулгүй байдал
          </h4>
          <p className="text-sm text-white/40">
            Төлбөр хийхийн өмнө аккаунтыг үргэлж шалгаж, найдвартай зуучлагчийн үйлчилгээг ашиглаарай.
          </p>
        </div>
      </div>
      <div className="border-t border-line py-6 text-center text-xs text-white/30">
        © {new Date().getFullYear()} NEXUS MLBB. Moonton болон Mobile Legends-тэй хамааралгүй.
      </div>
    </footer>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
