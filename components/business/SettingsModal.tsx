import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  capabilities: string[];
  domains: string[];
  onAddCapability: (c: string) => void;
  onRemoveCapability: (c: string) => void;
  onAddDomain: (d: string) => void;
  onRemoveDomain: (d: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, capabilities, domains, 
  onAddCapability, onRemoveCapability, onAddDomain, onRemoveDomain
}) => {
  const [activeTab, setActiveTab] = useState<'domains' | 'capabilities'>('domains');
  const [newItem, setNewItem] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newItem.trim()) return;
    if (activeTab === 'domains') onAddDomain(newItem.trim());
    else onAddCapability(newItem.trim());
    setNewItem('');
  };

  const list = activeTab === 'domains' ? domains : capabilities;
  const onRemove = activeTab === 'domains' ? onRemoveDomain : onRemoveCapability;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
            <p className="text-slate-500 text-sm">Manage configuration and list of values</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('domains')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'domains' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Business Domains
          </button>
          <button 
            onClick={() => setActiveTab('capabilities')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'capabilities' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Capabilities
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 bg-[#FAFCFF]">
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder={`Add new ${activeTab === 'domains' ? 'Domain' : 'Capability'}...`}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none shadow-sm"
            />
            <button 
              onClick={handleAdd}
              disabled={!newItem.trim()}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {list.map((item) => (
              <div key={item} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm group hover:border-blue-200 transition-colors">
                <span className="text-slate-700 font-medium text-sm">{item}</span>
                <button 
                  onClick={() => onRemove(item)}
                  className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {list.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">
                No items found. Add one above.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
           <p className="text-xs text-slate-400">
             Note: Deleting a value currently in use by applications may result in "Unassigned" fields.
           </p>
        </div>
      </div>
    </div>
  );
};