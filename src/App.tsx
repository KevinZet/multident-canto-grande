/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentView, setCurrentView] = useState<'web' | 'admin'>('web');
  
  // Realtime notification sync timestamp
  const [lastUpdatedTime, setLastUpdatedTime] = useState<number>(Date.now());

  const handleNewLeadRegistered = () => {
    setLastUpdatedTime(Date.now());
  };

  return (
    <div id="multident-main-app" className="min-h-screen bg-slate-100 selection:bg-sky-500 selection:text-white">
      {currentView === 'web' ? (
        <LandingPage 
          onAdminClick={() => setCurrentView('admin')} 
          onNewLeadRegistered={handleNewLeadRegistered}
        />
      ) : (
        <AdminPanel 
          onBackToWeb={() => setCurrentView('web')} 
          lastUpdatedTime={lastUpdatedTime}
        />
      )}
    </div>
  );
}
