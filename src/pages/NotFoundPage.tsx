import { Link } from "react-router-dom";
import { PageTransition } from "../components/Layout";

export function NotFoundPage() {
  return (
    <PageTransition>
      <div className="grid-noise flex min-h-[70vh] flex-col items-center justify-center gap-4 px-5 text-center">
        <span className="font-display text-8xl font-bold text-white/10">404</span>
        <h1 className="font-display text-2xl font-bold">Хуудас олдсонгүй</h1>
        <p className="max-w-sm text-sm text-white/50">
          Таны хайж буй хуудас өөр газар дахин төрсөн бололтой.
        </p>
        <Link
          to="/"
          className="mt-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Нүүр хуудас руу буцах
        </Link>
      </div>
    </PageTransition>
  );
}
