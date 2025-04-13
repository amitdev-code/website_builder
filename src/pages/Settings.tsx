import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Settings: React.FC = () => {
  const location = useLocation();

  return (
    <div className="settings">
      <header className="builder-header">
        <div className="header-left">
          <h1 className="logo">Website Builder</h1>
          <nav className="header-nav">
            <Link to="/builder" className={`nav-item ${location.pathname === '/builder' ? 'active' : ''}`}>
              <Icon icon="mdi:pencil" width="20" height="20" />
              <span>Design</span>
            </Link>
            <Link to="/flow-builder" className={`nav-item ${location.pathname === '/flow-builder' ? 'active' : ''}`}>
              <Icon icon="mdi:flow" width="20" height="20" />
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
      <main className="settings-content">
        <h2>Settings</h2>
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="setting-item">
            <label>Website Title</label>
            <input type="text" placeholder="Enter website title" />
          </div>
          <div className="setting-item">
            <label>Website Description</label>
            <textarea placeholder="Enter website description"></textarea>
          </div>
        </div>
        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="setting-item">
            <label>Theme</label>
            <select>
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings; 