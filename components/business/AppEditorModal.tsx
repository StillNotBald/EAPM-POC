import React, { useState, useEffect } from 'react';
import { Application, AppTier, AppValue } from '../../types';

interface AppEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: Application) => void;
  onDelete: (id: string) => void;
  initialData: Application | null;
  allApps: Application[]; // For dependency selection
  domains: string[]; // Dynamic
  capabilities: string[]; // Dynamic
}

const EMPTY_APP: Application = {
  id: '',
  name: '',
  code: '',
  tier: AppTier.CORE,
  health: 50,
  value: AppValue.STANDARD,
  capabilityId: '', // Set in useEffect
  owner: '',
  description: '',
  upstreamIds: [],
  downstreamIds: [],
  dataSensitivity: 'INTERNAL',
  domain: '', // Set in useEffect
  security: {
    gdprCompliant: false,
    piiRisk: 'NONE'
  },
  technicalDebt: 'MEDIUM',
  lifecycle: {
    status: 'ACTIVE'
  },
  costs: {
    license: 0,
    maintenance: 0,
    total: 0
  }
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'app-' + Math.random().toString(36).substr(2, 9);
};

export const AppEditorModal: React.FC<AppEditorModalProps> = ({ 
  isOpen, onClose, onSave, onDelete, initialData, allApps, domains, capabilities
}) => {
  const [formData, setFormData] = useState<Application>(EMPTY_APP);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({ 
          ...EMPTY_APP, 
          id: generateId(),
          domain: domains[0] || 'Unassigned',
          capabilityId: capabilities[0] || 'Unassigned'
        });
      }
    }
  }, [isOpen, initialData, domains, capabilities]);

  if (!isOpen) return null;

  const handleChange = (field: keyof Application, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCostChange = (amount: number) => {
      setFormData(prev => ({
          ...prev,
          costs: { ...prev.costs, total: amount }
      }));
  };

  const handleSecurityChange = (isHighRisk: boolean) => {
      setFormData(prev => ({
          ...prev,
          security: { ...prev.security, piiRisk: isHighRisk ? 'HIGH' : 'NONE' }
      }));
  };

  const handleDependencyChange = (id: string, type: 'upstreamIds' | 'downstreamIds') => {
    setFormData(prev => {
      const current = prev[type];
      const exists = current.includes(id);
      return {
        ...prev,
        [type]: exists ? current.filter(x => x !== id) : [...current, id]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
      
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? 'Edit Application' : 'New Application'}
          </h2>
          <p className="text-sm text-gray-500">
            {initialData ? `Updating ${initialData.code}` : 'Onboard a new system to the registry'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {initialData && (
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete this application?')) {
                  onDelete(formData.id);
                  onClose();
                }
              }}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              Delete
            </button>
          )}
          <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => {
              if(!formData.name || !formData.code) return alert("Name and Code are required");
              onSave(formData);
              onClose();
            }}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Content - Three Column Layout */}
      <div className="flex-1 overflow-auto bg-[#FAFCFF]">
        <div className="max-w-[1600px] mx-auto p-8 grid grid-cols-10 gap-12">
          
          {/* LEFT COLUMN (40%): Identity & Health */}
          <div className="col-span-4 space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Core Identity</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Application Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full bg-[#F0F4F9] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="e.g. Sales Portal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">App Code</label>
                  <input 
                    type="text" 
                    value={formData.code}
                    onChange={e => handleChange('code', e.target.value)}
                    className="w-full bg-[#F0F4F9] border-none rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-blue-200"
                    placeholder="APP-000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Owner</label>
                  <input 
                    type="text" 
                    value={formData.owner}
                    onChange={e => handleChange('owner', e.target.value)}
                    className="w-full bg-[#F0F4F9] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-200"
                    placeholder="Product Owner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  className="w-full bg-[#F0F4F9] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-200 resize-none h-24"
                  placeholder="What does this system do?"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-gray-700">Health Score</label>
                  <span className={`text-sm font-bold ${formData.health < 50 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {formData.health}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={formData.health}
                  onChange={e => handleChange('health', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                  <span>Critical Risk</span>
                  <span>Stable</span>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN (30%): Strategy */}
          <div className="col-span-3 space-y-6 border-l border-gray-100 pl-12">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Strategic Fit</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Business Domain</label>
                <select 
                  value={formData.domain}
                  onChange={e => handleChange('domain', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-200"
                >
                  {domains.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Business Capability</label>
                <select 
                  value={formData.capabilityId}
                  onChange={e => handleChange('capabilityId', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-200"
                >
                  {capabilities.map(cap => (
                    <option key={cap} value={cap}>{cap}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Business Value</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(AppValue).map(val => (
                    <button
                      key={val}
                      onClick={() => handleChange('value', val)}
                      className={`text-left px-4 py-3 rounded-xl text-xs font-medium transition-all border ${
                        formData.value === val 
                          ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                          : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Technical Tier</label>
                <select 
                  value={formData.tier}
                  onChange={e => handleChange('tier', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-200"
                >
                  {Object.values(AppTier).map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Annual Cost ($)</label>
                <input 
                  type="number" 
                  value={formData.costs?.total || 0}
                  onChange={e => handleCostChange(parseInt(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (30%): Risk & Topology */}
          <div className="col-span-3 space-y-6 border-l border-gray-100 pl-12">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Risk & Topology</h3>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">Contains PII</span>
                  <div 
                    onClick={() => handleSecurityChange(formData.security.piiRisk !== 'HIGH')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${formData.security.piiRisk === 'HIGH' ? 'bg-red-500' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.security.piiRisk === 'HIGH' ? 'translate-x-5' : ''}`} />
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Data Sensitivity</label>
                <select 
                  value={formData.dataSensitivity}
                  onChange={e => handleChange('dataSensitivity', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="INTERNAL">Internal</option>
                  <option value="CONFIDENTIAL">Confidential</option>
                  <option value="RESTRICTED">Restricted</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-700 mb-2">Upstream Dependencies (Feeds from)</label>
                <div className="h-48 overflow-y-auto border border-gray-100 rounded-xl bg-white p-2 space-y-1">
                  {allApps.filter(a => a.id !== formData.id).map(app => (
                    <div 
                      key={app.id} 
                      onClick={() => handleDependencyChange(app.id, 'upstreamIds')}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs ${
                        formData.upstreamIds.includes(app.id) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                       <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                         formData.upstreamIds.includes(app.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                       }`}>
                         {formData.upstreamIds.includes(app.id) && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                       </div>
                       <span className="truncate">{app.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};