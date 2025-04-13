import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { useBuilder } from '../contexts/BuilderContext';
import { DraggableComponent } from './DraggableComponent';

interface DroppableCanvasProps {
  activeDevice: string;
}

interface Component {
  id: string;
  type: string;
  name: string;
  icon: string;
  content?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, unknown>;
}

interface NewComponent extends Omit<Component, 'id'> {
  content: string;
}

interface UpdateComponent extends Partial<Component> {
  content?: string;
}

export const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ activeDevice }) => {
  const { components, addComponent, updateComponent } = useBuilder();
  const [editingComponent, setEditingComponent] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: { type: string; name: string; icon: string; isCanvasComponent?: boolean; id?: string }, monitor) => {
      const dropResult = monitor.getClientOffset();
      const canvasElement = document.querySelector('.canvas-content') as HTMLElement;
      const canvasRect = canvasElement.getBoundingClientRect();
      
      const x = dropResult ? dropResult.x - canvasRect.left : 0;
      const y = dropResult ? dropResult.y - canvasRect.top : 0;

      if (item.isCanvasComponent && item.id) {
        // Update existing component position
        const update: UpdateComponent = { x, y };
        updateComponent(item.id, update);
        return;
      }
      
      // Create new component
      const { type, name, icon } = item;
      const defaultContent = {
        text: 'Double click to edit this text...',
        image: 'https://via.placeholder.com/200x100',
        button: 'Click me',
        input: 'Enter text here...',
        card: 'Card content',
        header: 'Header Content',
        footer: 'Footer Content',
        section: 'Section Content',
        grid: 'Grid Content',
        list: 'List Content'
      };
      
      const newComponent: NewComponent = {
        type,
        name,
        icon,
        content: defaultContent[type as keyof typeof defaultContent] || '',
        x,
        y,
        width: type === 'image' ? 200 : 150,
        height: type === 'image' ? 100 : 50,
        properties: {},
      };
      
      addComponent(newComponent);
    },
    hover: (item: { id?: string; isCanvasComponent?: boolean }, monitor) => {
      if (!item.isCanvasComponent || !item.id) return;

      const dropResult = monitor.getClientOffset();
      const canvasElement = document.querySelector('.canvas-content') as HTMLElement;
      const canvasRect = canvasElement.getBoundingClientRect();
      
      const x = dropResult ? dropResult.x - canvasRect.left : 0;
      const y = dropResult ? dropResult.y - canvasRect.top : 0;

      const update: UpdateComponent = { x, y };
      updateComponent(item.id, update);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleDoubleClick = (componentId: string) => {
    setEditingComponent(componentId);
  };

  const handleBlur = (componentId: string, newContent: string) => {
    const update: UpdateComponent = { content: newContent };
    updateComponent(componentId, update);
    setEditingComponent(null);
  };

  const renderComponent = (component: Component) => {
    const { type, content, id } = component;

    if (editingComponent === id) {
      return (
        <input
          type="text"
          defaultValue={content}
          autoFocus
          onBlur={(e) => handleBlur(id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleBlur(id, e.currentTarget.value);
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            padding: 0,
            fontSize: '1rem',
          }}
        />
      );
    }

    switch (type) {
      case 'text':
        return (
          <p
            onDoubleClick={() => handleDoubleClick(id)}
            style={{ margin: 0, padding: 0 }}
          >
            {content}
          </p>
        );
      case 'image':
        return (
          <img
            src={content}
            alt="Dropped image"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        );
      case 'button':
        return (
          <button
            onDoubleClick={() => handleDoubleClick(id)}
            style={{
              width: '100%',
              height: '100%',
              padding: 0,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            {content}
          </button>
        );
      case 'input':
        return (
          <input
            type="text"
            placeholder={content}
            style={{
              width: '100%',
              height: '100%',
              padding: 0,
              border: 'none',
            }}
          />
        );
      case 'card':
        return (
          <div
            onDoubleClick={() => handleDoubleClick(id)}
            style={{
              width: '100%',
              height: '100%',
              padding: 0,
            }}
          >
            {content}
          </div>
        );
      case 'header':
      case 'footer':
      case 'section':
      case 'grid':
      case 'list':
        return (
          <div
            onDoubleClick={() => handleDoubleClick(id)}
            style={{
              width: '100%',
              height: '100%',
              padding: 0,
            }}
          >
            {content}
          </div>
        );
      default:
        return null;
    }
  };

  const getCanvasSize = () => {
    switch (activeDevice) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
        return { width: '100%', height: '100%' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const canvasSize = getCanvasSize();

  return (
    <div
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
      className="canvas-content"
      style={{
        backgroundColor: isOver ? 'rgba(139, 92, 246, 0.1)' : 'white',
        transition: 'background-color 0.2s',
        width: canvasSize.width,
        height: canvasSize.height,
        margin: '0 auto',
        position: 'relative',
        overflow: 'auto',
      }}
    >
      {components.length === 0 ? (
        <div className="drop-zone">
          Drag and drop components here
        </div>
      ) : (
        components.map((component) => (
          <DraggableComponent
            key={component.id}
            id={component.id}
            type={component.type}
            name={component.name}
            icon={component.icon}
            isCanvasComponent={true}
          >
            <div
              style={{
                left: component.x,
                top: component.y,
                width: component.width,
                height: component.height,
              }}
            >
              {renderComponent(component)}
            </div>
          </DraggableComponent>
        ))
      )}
    </div>
  );
}; 