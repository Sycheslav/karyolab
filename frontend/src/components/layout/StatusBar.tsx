export default function StatusBar() {
  return (
    <footer className="border-t border-brand-line bg-white/70 px-6 py-2 text-[11px] text-brand-muted">
      <div className="flex items-center gap-5">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-accent" />
          Система онлайн
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand" />
          Локальная база: подключена
        </span>
        <span className="ml-auto inline-flex items-center gap-4">
          <span>CPU: 12%</span>
          <span>MEM: 1.2 ГБ</span>
        </span>
      </div>
    </footer>
  );
}
