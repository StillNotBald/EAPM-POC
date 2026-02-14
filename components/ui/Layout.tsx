import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: 'registry' | 'topology' | 'landscape';
  setView: (view: 'registry' | 'topology' | 'landscape') => void;
  onOpenAI: () => void;
  onNewApp: () => void;
  onImport: () => void;
  onExport: () => void;
  
  // Settings & Scope
  onSettings: () => void;
  mapScope: string;
  setMapScope: (scope: string) => void;
  domains: string[];
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, activeView, setView, onOpenAI, 
  onNewApp, onImport, onExport,
  onSettings, mapScope, setMapScope, domains
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'registry': return 'Application Registry';
      case 'topology': return 'Portfolio Topology';
      case 'landscape': return 'Landscape Blueprint';
      default: return 'Portfolio';
    }
  };

  const NavItem = ({ view, label, icon }: { view: 'registry' | 'topology' | 'landscape', label: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => setView(view)}
      title={isCollapsed ? label : undefined}
      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'} px-4 py-3 rounded-full text-sm font-medium transition-all ${
        activeView === view 
          ? 'bg-[#D3E3FD] text-[#001d35]' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-[#F0F4F9] overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${isCollapsed ? 'w-20' : 'w-64'} flex flex-col border-r border-gray-200 bg-white/50 backdrop-blur-sm p-4 transition-all duration-300 ease-in-out`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'} mb-8 px-2`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">E</div>
            {!isCollapsed && <span className="font-semibold text-lg text-gray-800 whitespace-nowrap">EAPM</span>}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6 px-1">
          <button 
            onClick={onNewApp}
            title="New Application"
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black transition-all shadow-sm mb-3`}
          >
            <span className="text-xl leading-none font-light">+</span>
            {!isCollapsed && <span>New App</span>}
          </button>
          
          <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} gap-2`}>
            <button 
              onClick={onImport}
              title="Import CSV"
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-white hover:border-gray-300 transition-all`}
            >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
               </svg>
               {!isCollapsed && <span>Import</span>}
            </button>

            <button 
              onClick={onExport}
              title="Export CSV"
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-white hover:border-gray-300 transition-all`}
            >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
               </svg>
               {!isCollapsed && <span>Export</span>}
            </button>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavItem 
            view="registry" 
            label="App Registry" 
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            } 
          />
          <NavItem 
            view="landscape" 
            label="Landscape Blueprint" 
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            } 
          />
          <NavItem 
            view="topology" 
            label="Topology Map" 
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            } 
          />
        </nav>

        {/* Dynamic Sidebar Content: Map Scope */}
        {(activeView === 'topology' || activeView === 'landscape') && (
           <div className={`mt-6 mb-6 ${isCollapsed ? 'hidden' : 'block'} animate-in fade-in slide-in-from-left-4`}>
             <div className="px-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               Scope & Filtering
             </div>
             <div className="px-2">
               <select 
                 value={mapScope} 
                 onChange={(e) => setMapScope(e.target.value)}
                 className="w-full bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
               >
                 <option value="ALL">Entire Enterprise</option>
                 <optgroup label="By Domain">
                   {domains.map(d => (
                     <option key={d} value={d}>{d}</option>
                   ))}
                 </optgroup>
               </select>
             </div>
           </div>
        )}

        <div className="mt-auto space-y-2">
           <button 
            onClick={onSettings}
            title="Settings"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'} px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors`}
          >
             <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
             {!isCollapsed && <span>Settings</span>}
          </button>
          
          <button 
            onClick={onOpenAI}
            title={isCollapsed ? "Ask AI" : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all`}
          >
             <span className="text-lg">✨</span>
             {!isCollapsed && <span>Ask Portfolio AI</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 bg-white/30 backdrop-blur-md border-b border-white/50 shrink-0">
          <h1 className="text-xl font-medium text-gray-800">
            {getHeaderTitle()}
          </h1>
          <div className="flex items-center gap-4">
            {activeView === 'topology' && mapScope !== 'ALL' && (
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-md">
                Scope: {mapScope}
              </span>
            )}
            <span className="text-sm text-gray-500 hidden md:block">Enterprise View</span>
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-white"></div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden p-0 relative">
          {children}
        </div>
      </main>
    </div>
  );
};