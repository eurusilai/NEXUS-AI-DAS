import { ReactNode } from 'react';

declare const DraggableCard: (props: {
  children: ReactNode;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number | string; height: number | string };
}) => JSX.Element;

export default DraggableCard;
