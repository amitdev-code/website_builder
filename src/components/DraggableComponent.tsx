import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { useBuilder } from '../contexts/BuilderContext';

interface DraggableComponentProps {
  id: string;
  type: string;
  name: string;
  icon: string;
  children: React.ReactNode;
  isCanvasComponent?: boolean;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  id,
  type,
  name,
  icon,
  children,
  isCanvasComponent = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { selectComponent } = useBuilder();

  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { id, type, name, icon, isCanvasComponent },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(id);
  };

  drag(ref);

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        position: isCanvasComponent ? 'absolute' : 'relative',
        width: '100%',
        height: '100%',
      }}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}; 