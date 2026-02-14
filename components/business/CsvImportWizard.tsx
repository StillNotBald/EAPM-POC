import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Application, AppTier, AppValue, CAPABILITIES } from '../../types';

interface CsvImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (apps: Application[]) => void;
  existingCodes: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  hasWarning: boolean;
}

interface StagedRow {
  raw: any;
  app: Application | null;
  validation: ValidationResult;
  id: string;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'app-' + Math.random().toString(36).substr(2, 9);
};

export const CsvImportWizard: React.FC<CsvImportWizardProps> = ({ isOpen, onClose, onImport, existingCodes }) => {
  const [step, setStep] = useState<'upload' | 'staging'>('upload');
  const [stagedRows, setStagedRows] = useState<StagedRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateRow = (row: any): { app: Application | null; validation: ValidationResult } => {
    const errors: string[] = [];
    let hasWarning = false;

    // Validate Required Fields
    if (!row.Name) errors.push('Name is required');
    if (!row.Code) errors.push('Code is required');

    // Validate Enums
    const tier = Object.values(AppTier).find(t => t === row.Tier?.toUpperCase());
    if (!tier && row.Tier) errors.push(`Invalid Tier. Must be: ${Object.values(AppTier).join(', ')}`);

    const value = Object.values(AppValue).find(v => v === row.Value?.toUpperCase());
    if (!value && row.Value) errors.push(`Invalid Value. Must be: ${Object.values(AppValue).join(', ')}`);

    // Duplicate Check
    if (existingCodes.includes(row.Code)) {
      hasWarning = true;
      errors.push('Duplicate Code (will duplicate)');
    }

    if (errors.length > 0 && !hasWarning) {
      return {
        app: null,
        validation: { isValid: false, errors, hasWarning: false }
      };
    }

    const piiRisk = (row.PII?.toLowerCase() === 'yes' || row.PII === 'true') ? 'HIGH' : 'NONE';
    const cost = parseInt(row.Cost || row.AnnualCost) || 0;

    // Construct App
    const app: Application = {
      id: generateId(), // Temp ID
      name: row.Name,
      code: row.Code,
      tier: tier || AppTier.CORE,
      health: parseInt(row.Health) || 50,
      value: value || AppValue.STANDARD,
      capabilityId: CAPABILITIES.includes(row.Capability) ? row.Capability : CAPABILITIES[0],
      owner: row.Owner || 'Unknown',
      description: row.Description || '',
      upstreamIds: [],
      downstreamIds: [],
      domain: row.Domain || 'General',
      dataSensitivity: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'].includes(row.Sensitivity) ? row.Sensitivity : 'INTERNAL',
      security: {
        gdprCompliant: true,
        piiRisk: piiRisk,
      },
      costs: {
        license: 0,
        maintenance: 0,
        total: cost
      },
      technicalDebt: 'MEDIUM',
      lifecycle: {
        status: 'ACTIVE'
      }
    };

    return {
      app,
      validation: { isValid: true, errors, hasWarning }
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.map((row: any) => {
          const { app, validation } = validateRow(row);
          return {
            raw: row,
            app,
            validation,
            id: generateId()
          };
        });
        setStagedRows(rows);
        setStep('staging');
      }
    });
  };

  const validCount = stagedRows.filter(r => r.validation.isValid).length;

  const handleCommit = () => {
    const validApps = stagedRows
      .filter(r => r.validation.isValid && r.app)
      .map(r => r.app!);
    
    onImport(validApps);
    onClose();
    setStep('upload');
    setStagedRows([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Import Applications</h2>
            <p className="text-sm text-gray-500">Bulk upload via CSV</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-8 bg-[#FAFCFF]">
          {step === 'upload' ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv"
                onChange={handleFileUpload}
              />
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700">Click to Upload CSV</h3>
              <p className="text-sm text-gray-500 mt-2">Expected columns: Name, Code, Tier, Value, Health, Capability, Owner, PII</p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Found <span className="font-bold">{stagedRows.length}</span> rows. 
                  <span className="text-green-600 ml-2">{validCount} Valid</span>
                  <span className="text-red-600 ml-2">{stagedRows.length - validCount} Invalid</span>
                </div>
              </div>

              {/* Staging Table (Industrial Table style) */}
              <div className="flex-1 overflow-auto border border-gray-200 rounded-xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-medium sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 border-b border-gray-200">Status</th>
                      <th className="px-4 py-3 border-b border-gray-200">Name</th>
                      <th className="px-4 py-3 border-b border-gray-200">Code</th>
                      <th className="px-4 py-3 border-b border-gray-200">Tier</th>
                      <th className="px-4 py-3 border-b border-gray-200">Value</th>
                      <th className="px-4 py-3 border-b border-gray-200">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {stagedRows.map((row) => (
                      <tr key={row.id} className={
                        !row.validation.isValid 
                          ? 'bg-red-50 hover:bg-red-100' 
                          : row.validation.hasWarning 
                            ? 'bg-amber-50 hover:bg-amber-100' 
                            : 'hover:bg-gray-50'
                      }>
                        <td className="px-4 py-3">
                          {!row.validation.isValid ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Error</span>
                          ) : row.validation.hasWarning ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Warning</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Ready</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{row.raw.Name || '-'}</td>
                        <td className="px-4 py-3 font-mono text-gray-500">{row.raw.Code || '-'}</td>
                        <td className="px-4 py-3">{row.raw.Tier || '-'}</td>
                        <td className="px-4 py-3">{row.raw.Value || '-'}</td>
                        <td className="px-4 py-3 text-red-600 text-xs">
                          {row.validation.errors.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setStep('upload'); setStagedRows([]); }}
                  className="px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCommit}
                  disabled={validCount === 0}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {validCount} Valid Records
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};