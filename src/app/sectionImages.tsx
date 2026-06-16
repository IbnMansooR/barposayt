import { createContext, useContext } from "react";

/**
 * Admin "Bo'lim rasmlari" (section-images) dan kelgan rasm versiyalari: key -> version.
 * App.tsx Provider orqali beradi, FloorSection useFloorImage bilan oladi.
 */
export const SectionImagesContext = createContext<Record<string, number>>({});

/** Floor (qavat) uchun admin-boshqariladigan rasm URL. Yuklanmagan bo'lsa undefined. */
export function useFloorImage(floorNumber: number): string | undefined {
  const map = useContext(SectionImagesContext);
  const key = `floor-${floorNumber}`;
  return map && map[key] ? `/api/section-image?key=${key}&v=${map[key]}` : undefined;
}
