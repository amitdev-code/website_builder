import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

interface Page {
  id: number;
  title: string;
  sections: Section[];
  position: { x: number; y: number };
}

interface Section {
  id: number;
  title: string;
  layoutId: number;
}

interface Layout {
  id: number;
  title: string;
}

const FlowBuilder: React.FC = () => {
  const location = useLocation();

  const [pages, setPages] = useState<Page[]>([
    { id: 1, title: 'Home Page', sections: [], position: { x: 300, y: 200 } }
  ]);

  // State for modal and canvas
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<number>(1);
  const [showLayoutOptions, setShowLayoutOptions] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [activeDragPage, setActiveDragPage] = useState<number | null>(null);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isEditingPage, setIsEditingPage] = useState<number | null>(null);
  const [editedPageTitle, setEditedPageTitle] = useState('');

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);

  // Available sections
  const availableSections: Section[] = [
    { id: 1, title: 'Header', layoutId: 0 },
    { id: 2, title: 'Content', layoutId: 0 },
    { id: 3, title: 'Footer', layoutId: 0 },
    { id: 4, title: 'Sidebar', layoutId: 0 }
  ];

  // Available layouts
  const availableLayouts: Layout[] = [
    { id: 1, title: 'Full Width' },
    { id: 2, title: 'Two Column' },
    { id: 3, title: 'Three Column' }
  ];

  // Calculate distance between two touch points
  const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  };

  // Handle touch start for pinch zoom
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches[0], e.touches[1]));
    }
  };

  // Handle touch move for pinch zoom
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touchDistance = getTouchDistance(e.touches[0], e.touches[1]);
      if (lastTouchDistance !== null) {
        const scale = touchDistance / lastTouchDistance;
        const newZoom = Math.min(Math.max(zoom * scale, 0.1), 3);
        setZoom(newZoom);
      }
      setLastTouchDistance(touchDistance);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setLastTouchDistance(null);
  };

  // Canvas mouse down handler for panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return;
    if (e.target === canvasRef.current) {
      setIsDraggingCanvas(true);
      setDragStartPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Canvas mouse move handler for panning
  const handleCanvasMouseMove = (e: MouseEvent) => {
    if (isDraggingCanvas) {
      const dx = e.clientX - dragStartPosition.x;
      const dy = e.clientY - dragStartPosition.y;

      setCanvasOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));

      setDragStartPosition({ x: e.clientX, y: e.clientY });
    } else if (activeDragPage !== null && !isEditingPage) {
      // Only allow page dragging if not in edit mode
      const pageIndex = pages.findIndex(p => p.id === activeDragPage);
      if (pageIndex !== -1) {
        const updatedPages = [...pages];
        updatedPages[pageIndex].position.x += (e.clientX - dragStartPosition.x) / zoom;
        updatedPages[pageIndex].position.y += (e.clientY - dragStartPosition.y) / zoom;
        setPages(updatedPages);
        setDragStartPosition({ x: e.clientX, y: e.clientY });
      }
    }
  };

  // Canvas mouse up handler for ending panning
  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    setActiveDragPage(null);
  };

  // Page drag handlers
  const handlePageDragStart = (e: React.MouseEvent, pageId: number) => {
    if (isLocked || isEditingPage) return; // Prevent drag if editing
    e.stopPropagation();
    setActiveDragPage(pageId);
    setDragStartPosition({ x: e.clientX, y: e.clientY });
  };

  // Add a new page
  const addPage = (position: 'left' | 'right', sourcePageId: number) => {
    const newPageId = pages.length + 1;
    const sourcePageIndex = pages.findIndex(page => page.id === sourcePageId);
    const sourcePage = pages[sourcePageIndex];

    // Calculate position offset based on the direction
    const offsetX = position === 'right' ? 300 : -300;

    const newPage: Page = {
      id: newPageId,
      title: `Page ${newPageId}`,
      sections: [],
      position: {
        x: sourcePage.position.x + offsetX,
        y: sourcePage.position.y
      }
    };

    setPages(prev => [...prev, newPage]);
    setCurrentPageId(newPageId);
  };

  // Open section modal
  const openSectionModal = (pageId: number) => {
    setCurrentPageId(pageId);
    setModalOpen(true);
    setShowLayoutOptions(false);
  };

  // Select section
  const selectSection = (section: Section) => {
    setSelectedSection(section);
    setShowLayoutOptions(true);
  };

  // Add section with layout
  const addSectionWithLayout = (layoutId: number) => {
    if (!selectedSection) return;

    setPages(prevPages =>
      prevPages.map(page => {
        if (page.id === currentPageId) {
          return {
            ...page,
            sections: [
              ...page.sections,
              {
                id: page.sections.length + 1,
                title: selectedSection.title,
                layoutId: layoutId
              }
            ]
          };
        }
        return page;
      })
    );

    // Close modal
    setModalOpen(false);
    setShowLayoutOptions(false);
    setSelectedSection(null);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setShowLayoutOptions(false);
    setSelectedSection(null);
  };

  // Handle page title edit
  const handlePageTitleEdit = (pageId: number, title: string) => {
    if (!title.trim()) return; // Don't save empty titles
    
    const updatedTitle = title.trim();
    const updatedPages = pages.map(page =>
      page.id === pageId ? { ...page, title: updatedTitle } : page
    );
    
    // Update the pages state
    setPages(updatedPages);
    
    // Reset editing state
    setIsEditingPage(null);
    setEditedPageTitle('');
  };

  // Start editing page title
  const startEditingPage = (e: React.MouseEvent, pageId: number, currentTitle: string) => {
    e.stopPropagation();
    e.preventDefault();
    setEditedPageTitle(currentTitle);
    setIsEditingPage(pageId);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedPageTitle('');
    setIsEditingPage(null);
  };

  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      document.addEventListener('mousemove', handleCanvasMouseMove);

      return () => {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
        document.removeEventListener('mousemove', handleCanvasMouseMove);
      };
    }
  }, [isDraggingCanvas, dragStartPosition, lastTouchDistance, zoom]);

  return (
    <div className="flow-builder h-screen overflow-hidden">
      <header className="builder-header">
        <div className="header-left">
          <h1 className="logo">Website Builder</h1>
          <nav className="header-nav">
            <Link to="/builder" className={`nav-item ${location.pathname === '/builder' ? 'active' : ''}`}>
              <Icon icon="mdi:pencil" width="20" height="20" />
              <span>Design</span>
            </Link>
            <Link to="/flow-builder" className={`nav-item ${location.pathname === '/flow-builder' ? 'active' : ''}`}>
              <Icon icon="pajamas:merge" className="nav-icon" />
              <span>Flow Builder</span>
            </Link>
            <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
              <Icon icon="mdi:cog" width="20" height="20" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
        <div className="header-right">
          <button className="preview-btn">
            <Icon icon="mdi:eye" width="20" height="20" />
            Preview
          </button>
          <button className="publish-btn">
            <Icon icon="mdi:cloud-upload" width="20" height="20" />
            Publish
          </button>
        </div>
      </header>
      <main className="flow-builder-content h-[calc(100vh-64px)] relative">
        {/* Toolbar */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-white shadow-lg rounded-lg p-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setZoom(Math.max(zoom - 0.1, 0.1))}
                title="Zoom Out"
                disabled={isLocked}
              >
                <Icon icon="mdi:zoom-out" width="18" height="18" className="text-gray-600" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setZoom(Math.min(zoom + 0.1, 3))}
                title="Zoom In"
                disabled={isLocked}
              >
                <Icon icon="mdi:zoom-in" width="18" height="18" className="text-gray-600" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsLocked(!isLocked)}
                title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
              >
                <Icon 
                  icon={isLocked ? "mdi:lock" : "mdi:lock-open"} 
                  width="18" 
                  height="18" 
                  className={isLocked ? "text-red-500" : "text-gray-600"} 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className={`h-full bg-white overflow-hidden relative ${isLocked ? 'cursor-not-allowed' : 'cursor-move'}`}
          onMouseDown={handleCanvasMouseDown}
          style={{
            backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`
          }}
        >
          <div
            className="absolute"
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {pages.map((page) => (
              <div
                key={page.id}
                className={`absolute flex flex-col items-center bg-white rounded-lg shadow-md p-4 w-64 ${page.id === currentPageId ? 'border-2 border-blue-500' : ''
                  }`}
                style={{
                  left: page.position.x,
                  top: page.position.y,
                  cursor: activeDragPage === page.id ? 'grabbing' : 'grab'
                }}
                onClick={() => setCurrentPageId(page.id)}
              >
                {/* Page header with drag handle */}
                <div
                  className="font-bold text-lg mb-4 w-full text-center bg-gray-100 py-2 rounded flex items-center justify-between px-3 group"
                  onMouseDown={(e) => {
                    if (!isEditingPage) {
                      handlePageDragStart(e, page.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon 
                      icon="mdi:drag" 
                      width="16" 
                      height="16" 
                      className={`cursor-grab text-gray-500 flex-shrink-0 ${isEditingPage ? 'opacity-50' : ''}`} 
                    />
                    {isEditingPage === page.id ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input
                          type="text"
                          value={editedPageTitle}
                          onChange={(e) => {
                            e.preventDefault();
                            setEditedPageTitle(e.target.value);
                          }}
                          onBlur={(e) => {
                            e.preventDefault();
                            if (editedPageTitle.trim()) {
                              handlePageTitleEdit(page.id, editedPageTitle);
                            } else {
                              cancelEditing();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (editedPageTitle.trim()) {
                                handlePageTitleEdit(page.id, editedPageTitle);
                              }
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelEditing();
                            }
                          }}
                          className="text-center bg-white px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all duration-200"
                          autoFocus
                        />
                        <div className="flex-shrink-0 flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (editedPageTitle.trim()) {
                                handlePageTitleEdit(page.id, editedPageTitle);
                              }
                            }}
                            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                            title="Save changes"
                          >
                            <Icon icon="mdi:check" width="16" height="16" className="text-green-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              cancelEditing();
                            }}
                            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                            title="Cancel"
                          >
                            <Icon icon="mdi:close" width="16" height="16" className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-800 truncate flex-1">{page.title}</span>
                    )}
                  </div>
                  {!isEditingPage && (
                    <button
                      onClick={(e) => startEditingPage(e, page.id, page.title)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded-full transition-all duration-200 flex-shrink-0"
                      title="Edit page name"
                    >
                      <Icon icon="mdi:pencil" width="16" height="16" className="text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Left plus button */}
                <button
                  className="absolute -left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-blue-500 hover:bg-blue-600 p-1 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPage('left', page.id);
                  }}
                >
                  <Icon icon="mdi:plus" width="16" height="16" className="text-white" />
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200 before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-gray-800">
                    Add Page
                  </span>
                </button>

                {/* Right plus button */}
                <button
                  className="absolute -right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-blue-500 hover:bg-blue-600 p-1 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPage('right', page.id);
                  }}
                >
                  <Icon icon="mdi:plus" width="16" height="16" className="text-white" />
                  <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200 before:absolute before:left-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-l-gray-800">
                    Add Page
                  </span>
                </button>

                {/* Sections */}
                <div className="w-full space-y-2 mb-4">
                  {page.sections.map((section) => (
                    <div key={section.id} className="bg-gray-100 p-2 rounded">
                      <div className="font-medium">{section.title}</div>
                      <div className="text-sm text-gray-500">
                        Layout: {availableLayouts.find(l => l.id === section.layoutId)?.title}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom plus button */}
                <button
                  className="absolute -bottom-4 transform translate-x-1/2 right-1/2 rounded-full bg-green-500 hover:bg-green-600 p-1 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSectionModal(page.id);
                  }}
                >
                  <Icon icon="mdi:plus" width="16" height="16" className="text-white" />
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200 before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-gray-800">
                    Add Section
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Off-canvas Sidebar */}
        <div 
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${modalOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ top: '64px' }}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {showLayoutOptions
                  ? `Select Layout for ${selectedSection?.title}`
                  : "Select Section"}
              </h2>
              <button 
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Icon icon="mdi:close" width="24" height="24" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!showLayoutOptions ? (
                <div className="grid grid-cols-1 gap-2">
                  {availableSections.map((section) => (
                    <button
                      key={section.id}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-between transition-colors"
                      onClick={() => selectSection(section)}
                    >
                      <span>{section.title}</span>
                      <Icon icon="mdi:chevron-right" width="20" height="20" className="text-gray-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {availableLayouts.map((layout) => (
                    <button
                      key={layout.id}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-between transition-colors"
                      onClick={() => addSectionWithLayout(layout.id)}
                    >
                      <span>{layout.title}</span>
                      <Icon icon="mdi:check" width="20" height="20" className="text-green-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlowBuilder; 