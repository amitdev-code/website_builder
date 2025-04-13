import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Builder from './components/Builder';
import FlowBuilder from './pages/FlowBuilder';
import Settings from './pages/Settings';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Builder />} />
        <Route path="/flow-builder" element={<FlowBuilder />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
