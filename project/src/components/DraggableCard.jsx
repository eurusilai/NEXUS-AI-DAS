import { useState } from 'react';
import { Rnd } from 'react-rnd';
import { cn } from '../lib/utils';

const DraggableCard = ({ 
  children, 
  defaultPosition = { x: 0, y: 0 }, 
  defaultSize = { width: 350, height: 300 } 
}) => {
  const [size, setSize] = useState({
    width: defaultSize.width,
    height: defaultSize.height,
  });

  const [position, setPosition] = useState({
    x: defaultPosition.x,
    y: defaultPosition.y,
  });

  return (
    <Rnd
      size={{ 
        width: typeof size.width === 'number' ? size.width : parseInt(size.width, 10),
        height: typeof size.height === 'number' ? size.height : parseInt(size.height, 10)
      }}
      position={{ x: position.x, y: position.y }}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: ref.style.width,
          height: ref.style.height,
        });
        setPosition(position);
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      className="z-10"
      style={{
        background: 'transparent',
        borderRadius: '0.75rem',
        overflow: 'visible',
      }}
      enableResizing={{
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: false,
      }}
      resizeHandleClasses={{
        right: 'w-2 h-full right-0 top-0',
        bottom: 'w-full h-2 bottom-0 left-0',
        bottomRight: 'w-4 h-4 bottom-0 right-0',
        bottomLeft: 'w-4 h-4 bottom-0 left-0',
        topRight: 'w-4 h-4 top-0 right-0',
      }}
      resizeHandleStyles={{
        right: { background: 'transparent' },
        bottom: { background: 'transparent' },
        bottomRight: { 
          background: 'rgba(99, 102, 241, 0.7)',
          borderRadius: '0.25rem 0 0.25rem 0',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        },
        bottomLeft: { background: 'transparent' },
        topRight: { background: 'transparent' },
      }}
      dragHandleClassName="handle"
    >
      <div className={cn(
        "w-full h-full flex flex-col bg-gray-900/80 backdrop-blur-md",
        "rounded-lg border border-gray-700/50 shadow-xl",
        "transition-all duration-200 hover:border-indigo-500/50"
      )}>
        <div className="handle w-full h-8 px-4 py-1.5 cursor-move flex items-center bg-gray-800/70 border-b border-gray-700/50">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 text-gray-200">
          {children}
        </div>
      </div>
    </Rnd>
  );
};

export default DraggableCard;
