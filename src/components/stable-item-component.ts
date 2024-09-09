import { createElement, useRef, memo } from "react";
import { StableComponent } from "./stable-component";
import { useConvertToLucyState } from "../convert-into-lucy-state";
import type { LucyState } from "../types";
import type { ReactNode } from "react";

function _StableItemComponent<T>({
  item,
  children,
}: {
  item: T;
  children: (itemState: LucyState<T>) => ReactNode;
}) {
  const itemState = useConvertToLucyState(item);

  const nodeRef = useRef<{ initialized: boolean; markup: ReactNode }>({
    initialized: false,
    markup: null,
  });

  if (nodeRef.current.initialized === false) {
    nodeRef.current = {
      initialized: true,
      markup: children(itemState),
    };
  }

  return createElement(StableComponent, {
    children: nodeRef.current.markup,
  });
}

// @ts-expect-error types are the same
export const StableItemComponent: typeof _StableItemComponent = memo(
  _StableItemComponent,
  (prevProps, newProps) => {
    // only item can change, we ignore the children callback
    return prevProps.item === newProps.item;
  }
);
