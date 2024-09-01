import { memo } from "react";
import type { ReactNode } from "react";

function _StableComponent({ children }: { children: ReactNode }) {
  return children;
}

export const StableComponent = memo(_StableComponent, () => true);
