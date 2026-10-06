/** Shared control bar sizing — mic/video stay labeled; others icon-first on narrow screens. */
export const studioDockBtn =
  "flex flex-col items-center justify-center min-w-[3rem] sm:min-w-[4rem] h-12 sm:h-14 rounded-2xl transition-all shrink-0";

export const studioDockLabel = "text-[9px] sm:text-[10px] font-medium tracking-tight mt-0.5 leading-none";

export const studioDockLabelAlways = studioDockLabel;

export const studioDockLabelDesktopOnly = `hidden sm:block ${studioDockLabel}`;
