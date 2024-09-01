import { createElement, useRef } from "react";
import { StableComponent } from "./stable-component";
import { useConvertToLucyState } from "../convert-into-lucy-state";
import type { LucyState } from "../types";
import type { ReactNode } from "react";

export function StableIteratorComponent<T>({
  item,
  index,
  children,
}: {
  item: T;
  index: number;
  children: (
    itemState: LucyState<T>,
    indexState: LucyState<number>
  ) => ReactNode;
}) {
  const itemState = useConvertToLucyState(item);
  const indexState = useConvertToLucyState(index);

  const nodeRef = useRef<{ initialized: boolean; markup: ReactNode }>({
    initialized: false,
    markup: null,
  });

  if (nodeRef.current.initialized === false) {
    nodeRef.current = {
      initialized: true,
      markup: children(itemState, indexState),
    };
  }

  return createElement(StableComponent, {
    children: nodeRef.current.markup,
  });
}
