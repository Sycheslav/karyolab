import type { EventType } from "@/lib/types";

export const eventTypeLabel: Record<EventType, string> = {
  germination: "Проращивание",
  slide: "Создание препарата",
  wash: "Отмывка",
  hybridization: "Гибридизация",
  photographing: "Фотографирование",
  free: "Свободный ивент",
};

export const eventPillClasses: Record<EventType, string> = {
  germination:
    "bg-brand-accent text-brand-deep border-brand-accent/60 hover:bg-brand-accent/90",
  slide:
    "bg-brand-cream text-brand-dark border-brand-line hover:bg-brand-mint",
  wash:
    "bg-brand-accent/70 text-brand-deep border-brand-accent/50 hover:bg-brand-accent/85",
  hybridization:
    "bg-brand text-white border-brand-dark hover:bg-brand-dark",
  photographing:
    "bg-brand-dark text-brand-cream border-brand-deep hover:bg-brand-deep",
  free:
    "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200/80",
};

export const eventBarClasses: Record<EventType, string> = {
  germination: "bg-brand-accent",
  slide: "bg-brand-cream border border-brand-line",
  wash: "bg-brand-accent/70",
  hybridization: "bg-brand",
  photographing: "bg-brand-dark",
  free: "bg-amber-200",
};

export const eventLeftBar: Record<EventType, string> = {
  germination: "bg-brand-accent",
  slide: "bg-brand",
  wash: "bg-brand",
  hybridization: "bg-brand-dark",
  photographing: "bg-brand-deep",
  free: "bg-amber-400",
};
