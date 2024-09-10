import { createElement, useRef, memo } from "react";
import { StableComponent } from "./stable-component";
import { useConvertToLucyState } from "../convert-into-lucy-state";
import type { LucyState } from "../types";
import type { ReactNode } from "react";

function _StableIteratorComponent<T>({
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
  const item$ = useConvertToLucyState(item);
  const index$ = useConvertToLucyState(index);

  const nodeRef = useRef<{ initialized: boolean; markup: ReactNode }>({
    initialized: false,
    markup: null,
  });

  if (nodeRef.current.initialized === false) {
    nodeRef.current = {
      initialized: true,
      markup: children(item$, index$),
    };
  }

  return createElement(StableComponent, {
    children: nodeRef.current.markup,
  });
}

// @ts-expect-error types are the same
export const StableIteratorComponent: typeof _StableIteratorComponent = memo(
  _StableIteratorComponent,
  (prevProps, newProps) => {
    return (
      prevProps.item === newProps.item && prevProps.index === newProps.item
    );
  }
);
