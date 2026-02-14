import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Application, AppTier, AppValue, CAPABILITIES } from '../../types';

// PART 2: THE IMPORT WIZARD

interface DataImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (apps: Application[]) => void;
  existingCodes: string[];
}

interface ValidationRecord {
  raw: any;
  app: Application | null;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const DataImportWizard: React.FC<DataImportWizardProps> = ({ isOpen, onClose, onImport, existingCodes }) => {
  const [step, setStep] = useState<'upload' | 'staging'>('upload');
  const [records, setRecords] = useState<ValidationRecord[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validate = (row: any): ValidationRecord => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Dragon1 Critical Checks
    if (!row.Name) errors.push('Missing Name');
    if (!row.Code) errors.push('Missing Code');
    
    // Lifecycle Validation
    const status = row.Status?.toUpperCase();
    if (!['ACTIVE', 'PHASE_OUT', 'EOL'].includes(status)) {
      errors.push('Invalid Lifecycle Status');
    }

    // Ownership Warning (Amber)
    if (!row.Owner) {
      warnings.push('Missing Data Steward (Owner)');
    }

    // Duplicate Warning
    if (existingCodes.includes(row.Code)) {
      warnings.push('Duplicate Code (Will Overwrite)');
    }

    let app: Application | null = null;
    if (errors.length === 0) {
      app = {
        id: crypto.randomUUID(),
        name: row.Name,
        code: row.Code,
        tier: (Object.values(AppTier).includes(row.Tier) ? row.Tier : AppTier.CORE) as AppTier,
        description: row.Description || '',
        owner: row.Owner || 'Unassigned',
        domain: row.Domain || 'General',
        capabilityId: CAPABILITIES.includes(row.Capability) ? row.Capability : CAPABILITIES[0],
        health: parseInt(row.Health) || 50,
        value: (Object.values(AppValue).includes(row.Value) ? row.Value : AppValue.STANDARD) as AppValue,
        dataSensitivity: row.DataSensitivity || 'INTERNAL',
        security: {
          gdprCompliant: row.GDPR === 'true' || row.GDPR === 'YES',
          piiRisk: ['HIGH', 'LOW', 'NONE'].includes(row.PII) ? row.PII : 'NONE',
        },
        technicalDebt: ['HIGH', 'MEDIUM', 'LOW'].includes(row.Debt) ? row.Debt : 'MEDIUM',
        lifecycle: {
          status: status as any,
        },
        costs: {
          license: parseFloat(row.License) || 0,
          maintenance: parseFloat(row.Maintenance) || 0,
          total: (parseFloat(row.License) || 0) + (parseFloat(row.Maintenance) || 0)
        },
        upstreamIds: [],
        downstreamIds: []
      };
    }

    return { raw: row, app, isValid: errors.length === 0, errors, warnings };
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validated = results.data.map((row: any) => validate(row));
        setRecords(validated);
        setStep('staging');
      }
    });
  };

  const validCount = records.filter(r => r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Repository Import</h2>
            <p className="text-slate-500 text-sm">Bulk ingestion wizard for Dragon1 Repository</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">✕</button>
        </div>

        <div className="flex-1 overflow-hidden p-8 bg-[#F8FAFC]">
          {step === 'upload' ? (
            <div 
              onClick={() => fileRef.current?.click()}
              className="h-full border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group"
            >
              <input type="file" ref={fileRef} className="hidden" accept=".csv" onChange={handleFile} />
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-700">Upload Data Source</h3>
              <p className="text-slate-500 mt-2">Supports .CSV (Excel compatible)</p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-auto border border-slate-200 rounded-xl bg-white shadow-sm mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 sticky top-0 z-10 font-semibold text-slate-600">
                    <tr>
                      <th className="p-3 border-b">Status</th>
                      <th className="p-3 border-b">Name</th>
                      <th className="p-3 border-b">Code</th>
                      <th className="p-3 border-b">Lifecycle</th>
                      <th className="p-3 border-b">Owner</th>
                      <th className="p-3 border-b">Validation Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((rec, idx) => (
                      <tr key={idx} className={!rec.isValid ? 'bg-red-50' : rec.warnings.length ? 'bg-amber-50' : ''}>
                        <td className="p-3">
                          {!rec.isValid ? <span className="text-red-600 font-bold">FAIL</span> : 
                           rec.warnings.length ? <span className="text-amber-600 font-bold">WARN</span> : 
                           <span className="text-green-600 font-bold">OK</span>}
                        </td>
                        <td className="p-3 font-medium">{rec.raw.Name}</td>
                        <td className="p-3 font-mono text-slate-500">{rec.raw.Code}</td>
                        <td className="p-3">{rec.raw.Status}</td>
                        <td className="p-3">{rec.raw.Owner}</td>
                        <td className="p-3 text-xs">
                          {rec.errors.map(e => <span className="text-red-600 block">● {e}</span>)}
                          {rec.warnings.map(w => <span className="text-amber-600 block">● {w}</span>)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-4">
                <button onClick={() => { setStep('upload'); setRecords([]); }} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-full font-medium">Cancel</button>
                <button 
                  onClick={() => {
                    onImport(records.filter(r => r.isValid).map(r => r.app!));
                    onClose();
                  }}
                  disabled={validCount === 0}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg disabled:opacity-50 transition-all"
                >
                  Ingest {validCount} Records
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};