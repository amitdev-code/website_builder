import React, { createContext, useContext, useState, useCallback } from 'react';

interface Component {
  id: string;
  type: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, any>;
}

interface BuilderContextType {
  components: Component[];
  selectedComponent: Component | null;
  addComponent: (component: Omit<Component, 'id'>) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  resizeComponent: (id: string, width: number, height: number) => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

  const addComponent = useCallback((component: Omit<Component, 'id'>) => {
    const newComponent = {
      ...component,
      id: `comp-${Date.now()}`,
    };
    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent);
  }, []);

  const updateComponent = useCallback((id: string, updates: Partial<Component>) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
    if (selectedComponent?.id === id) {
      setSelectedComponent(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedComponent]);

  const deleteComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  const selectComponent = useCallback((id: string | null) => {
    const component = id ? components.find(comp => comp.id === id) : null;
    setSelectedComponent(component || null);
  }, [components]);

  const moveComponent = useCallback((id: string, x: number, y: number) => {
    updateComponent(id, { x, y });
  }, [updateComponent]);

  const resizeComponent = useCallback((id: string, width: number, height: number) => {
    updateComponent(id, { width, height });
  }, [updateComponent]);

  return (
    <BuilderContext.Provider value={{
      components,
      selectedComponent,
      addComponent,
      updateComponent,
      deleteComponent,
      selectComponent,
      moveComponent,
      resizeComponent,
    }}>
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}; 