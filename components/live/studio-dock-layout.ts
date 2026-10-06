/** Reserve space so fixed studio dock is not covered by stage content. */
export const STUDIO_DOCK_SPACER_CLASS =
  "shrink-0 h-[calc(9.25rem+env(safe-area-inset-bottom))] md:h-[calc(5.25rem+env(safe-area-inset-bottom))]";

export const STUDIO_DOCK_FIXED_CLASS =
  "fixed inset-x-0 bottom-0 z-[100] border-t border-zinc-800 bg-zinc-900 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] pb-[max(0.35rem,env(safe-area-inset-bottom))]";
