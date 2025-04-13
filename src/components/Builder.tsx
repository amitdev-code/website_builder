import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Icon } from '@iconify/react';
import { BuilderProvider } from '../contexts/BuilderContext';
import { DroppableCanvas } from './DroppableCanvas';
import { DraggableComponent } from './DraggableComponent';
import './Builder.css';
import { Link, useLocation } from 'react-router-dom';

const Builder: React.FC = () => {
  const location = useLocation();
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false);
  const [pages, setPages] = useState(['Home', 'About', 'Contact']);
  const [pageCount, setPageCount] = useState(4);
  const [activeTab, setActiveTab] = useState('elements');
  const [activeDevice, setActiveDevice] = useState('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState('Saving...');
  const [isSaving, setIsSaving] = useState(true);

  const elements = [
    { name: 'Text', icon: 'mdi:text', type: 'text' },
    { name: 'Image', icon: 'mdi:image', type: 'image' },
    { name: 'Button', icon: 'mdi:button', type: 'button' },
    { name: 'Input', icon: 'mdi:form-textbox', type: 'input' },
    { name: 'Card', icon: 'mdi:card', type: 'card' },
  ];

  const layouts = [
    { name: 'Header', icon: 'mdi:view-dashboard', type: 'header' },
    { name: 'Footer', icon: 'mdi:view-dashboard', type: 'footer' },
    { name: 'Section', icon: 'mdi:view-dashboard', type: 'section' },
    { name: 'Grid', icon: 'mdi:grid', type: 'grid' },
    { name: 'List', icon: 'mdi:list-box', type: 'list' },
  ];

  const togglePagesDropdown = () => {
    setIsPagesDropdownOpen(!isPagesDropdownOpen);
  };

  const addNewPage = () => {
    const newPage = `Page ${pageCount}`;
    setPages([...pages, newPage]);
    setPageCount(pageCount + 1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      setSaveStatus('Saved');
      setIsSaving(false);
    }, 5000);

    return () => clearTimeout(saveTimer);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <BuilderProvider>
        <div className="builder">
          <header className="builder-header">
            <div className="header-left">
              <div className="logo">
                <Icon icon="mdi:web" className="logo-icon" />
                <span>Website Builder</span>
              </div>
            </div>
            <nav className="header-nav">
              <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                <Icon icon="mdi:pencil" className="nav-icon" />
                <span>Design</span>
              </Link>
              <Link to="/flow-builder" className={`nav-item ${location.pathname === '/flow-builder' ? 'active' : ''}`}>
                <Icon icon="pajamas:merge" className="nav-icon" />
                <span>Flow Builder</span>
              </Link>
              <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
                <Icon icon="mdi:cog" className="nav-icon" />
                <span>Settings</span>
              </Link>
              <div className="pages-dropdown">
                <button 
                  className={`nav-item ${isPagesDropdownOpen ? 'active' : ''}`}
                  onClick={togglePagesDropdown}
                >
                  <Icon icon="mdi:file-document" className="nav-icon" />
                  <span>Pages</span>
                  <Icon 
                    icon={isPagesDropdownOpen ? "mdi:chevron-up" : "mdi:chevron-down"} 
                    className="chevron-icon"
                  />
                </button>
                {isPagesDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="header-title">
                        <Icon icon="mdi:file-document" className="header-icon" />
                        <span>Pages</span>
                      </div>
                      <button className="add-page-btn" onClick={addNewPage}>
                        <Icon icon="mdi:plus" />
                        <span>Add New Page</span>
                      </button>
                    </div>
                    <div className="pages-list">
                      {pages.map((page, index) => (
                        <div key={index} className="page-item">
                          <div className="page-info">
                            <Icon icon="mdi:file-document-outline" className="page-icon" />
                            <span>{page}</span>
                          </div>
                          <div className="page-actions">
                            <button className="page-action-btn" title="Edit Page">
                              <Icon icon="mdi:pencil" />
                            </button>
                            <button className="page-action-btn" title="Delete Page">
                              <Icon icon="mdi:delete" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
            <div className="header-right">
              <div className={`auto-save ${isSaving ? 'saving' : 'saved'}`}>
                <Icon icon="pajamas:check-circle-dashed" className={`save-icon ${isSaving ? 'saving' : 'saved'}`} />
                <span className={`save-text ${isSaving ? 'saving' : 'saved'}`}>{saveStatus}</span>
              </div>
              <button className="preview-btn">
                <Icon icon="mdi:eye" className="btn-icon" />
                <span>Preview</span>
              </button>
              <button className="publish-btn">
                <Icon icon="mdi:cloud-upload" className="btn-icon" />
                <span>Publish</span>
              </button>
            </div>
          </header>
          <div className="builder-content">
            <aside className="left-sidebar">
              <div className="sidebar-header">
                <h2>Components</h2>
                <div className="search-box">
                  <Icon 
                    icon={searchQuery ? "mdi:close" : "mdi:magnify"} 
                    width="20" 
                    height="20" 
                    className="search-icon"
                    onClick={clearSearch}
                  />
                  <input
                    type="text"
                    placeholder="Search components..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              <div className="component-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'elements' ? 'active' : ''}`}
                  onClick={() => setActiveTab('elements')}
                >
                  <Icon icon="mdi:shape" width="16" height="16" />
                  Elements
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'layouts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('layouts')}
                >
                  <Icon icon="mdi:view-grid" width="16" height="16" />
                  Layouts
                </button>
              </div>
              <div className="components-list">
                {activeTab === 'elements' ? (
                  <div className="component-grid">
                    {elements
                      .filter(element => 
                        element.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((element, index) => (
                        <DraggableComponent
                          key={index}
                          id={`element-${index}`}
                          type={element.type}
                          name={element.name}
                          icon={element.icon}
                        >
                          <div className="component-item">
                            <Icon icon={element.icon} width="20" height="20" />
                            <span>{element.name}</span>
                          </div>
                        </DraggableComponent>
                      ))}
                  </div>
                ) : (
                  <div className="component-grid">
                    {layouts
                      .filter(layout => 
                        layout.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((layout, index) => (
                        <DraggableComponent
                          key={index}
                          id={`layout-${index}`}
                          type={layout.type}
                          name={layout.name}
                          icon={layout.icon}
                        >
                          <div className="component-item">
                            <Icon icon={layout.icon} width="20" height="20" />
                            <span>{layout.name}</span>
                          </div>
                        </DraggableComponent>
                      ))}
                  </div>
                )}
              </div>
            </aside>
            
            <main className="builder-main">
              <div className="canvas-toolbar">
                <div className="toolbar-group">
                  <button className="toolbar-btn">
                    <Icon icon="mdi:undo" width="20" height="20" />
                    <span>Undo</span>
                  </button>
                  <button className="toolbar-btn">
                    <Icon icon="mdi:redo" width="20" height="20" />
                    <span>Redo</span>
                  </button>
                </div>
                <div className="toolbar-group">
                  <button className="toolbar-btn">
                    <Icon icon="mdi:magnify-plus" width="20" height="20" />
                    <span>Zoom In</span>
                  </button>
                  <button className="toolbar-btn">
                    <Icon icon="mdi:magnify-minus" width="20" height="20" />
                    <span>Zoom Out</span>
                  </button>
                </div>
                <div className="toolbar-group device-switcher">
                  <button 
                    className={`device-btn ${activeDevice === 'mobile' ? 'active' : ''}`}
                    onClick={() => setActiveDevice('mobile')}
                    title="Mobile View"
                  >
                    <Icon icon="mdi:cellphone" width="20" height="20" />
                  </button>
                  <button 
                    className={`device-btn ${activeDevice === 'tablet' ? 'active' : ''}`}
                    onClick={() => setActiveDevice('tablet')}
                    title="Tablet View"
                  >
                    <Icon icon="mdi:tablet" width="20" height="20" />
                  </button>
                  <button 
                    className={`device-btn ${activeDevice === 'desktop' ? 'active' : ''}`}
                    onClick={() => setActiveDevice('desktop')}
                    title="Desktop View"
                  >
                    <Icon icon="mdi:laptop" width="20" height="20" />
                  </button>
                </div>
              </div>
              <div className="canvas-container">
                <DroppableCanvas activeDevice={activeDevice} />
              </div>
            </main>
            
            <aside className="right-sidebar">
              <div className="sidebar-header">
                <h2>Properties</h2>
              </div>
              <div className="properties-panel">
                <div className="property-group">
                  <h3>Layout</h3>
                  <div className="property-item">
                    <label>Width</label>
                    <input type="text" placeholder="Width" />
                  </div>
                  <div className="property-item">
                    <label>Height</label>
                    <input type="text" placeholder="Height" />
                  </div>
                </div>
                <div className="property-group">
                  <h3>Appearance</h3>
                  <div className="property-item">
                    <label>Background Color</label>
                    <input type="color" />
                  </div>
                  <div className="property-item">
                    <label>Border Radius</label>
                    <input type="text" placeholder="Border Radius" />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </BuilderProvider>
    </DndProvider>
  );
};

export default Builder; 