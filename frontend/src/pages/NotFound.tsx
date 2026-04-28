import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="card card-pad mx-auto max-w-xl text-center">
      <div className="text-[80px] font-extrabold text-brand">404</div>
      <div className="text-lg font-semibold text-brand-deep">
        Страница не найдена
      </div>
      <Link
        to="/журнал"
        className="mt-4 inline-block rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
      >
        В журнал
      </Link>
    </div>
  );
}
