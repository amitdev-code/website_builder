import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

const FlowBuilder: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flow-builder">
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
      <main className="flow-builder-content">
        <h2>Flow Builder</h2>
        <p>This is the Flow Builder page. Here you can create and manage your website's user flows.</p>
      </main>
    </div>
  );
};

export default FlowBuilder; 