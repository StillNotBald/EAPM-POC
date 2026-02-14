import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, getResults, TestResult } from './simpleTest';
import { getStrategyDisposition } from '../utils/strategy';
import { AppValue, StrategyDisposition } from '../types';
import { App } from '../App';

// --- UNIT TESTS ---
const runUnitTests = () => {
  describe('Strategy Engine (TIME Model)', () => {
    
    it('should recommend INVEST for Critical apps with high health', () => {
      const result = getStrategyDisposition(AppValue.CRITICAL, 90);
      expect(result.disposition).toBe(StrategyDisposition.INVEST);
    });

    it('should recommend MIGRATE for Critical apps with low health', () => {
      const result = getStrategyDisposition(AppValue.CRITICAL, 40);
      expect(result.disposition).toBe(StrategyDisposition.MIGRATE);
    });

    it('should recommend TOLERATE for Standard apps with high health', () => {
      const result = getStrategyDisposition(AppValue.STANDARD, 85);
      expect(result.disposition).toBe(StrategyDisposition.TOLERATE);
    });

    it('should recommend ELIMINATE for Standard apps with low health', () => {
      const result = getStrategyDisposition(AppValue.STANDARD, 30);
      expect(result.disposition).toBe(StrategyDisposition.ELIMINATE);
    });
    
    it('should handle boundary condition (Health = 70)', () => {
      // 70 is the cutoff for High Health
      const result = getStrategyDisposition(AppValue.CRITICAL, 70);
      expect(result.disposition).toBe(StrategyDisposition.INVEST);
    });
  });
};

// --- COMPONENT FOR SMOKE TEST ---
const SmokeTestContainer = ({ onResult }: { onResult: (success: boolean, err?: string) => void }) => {
  useEffect(() => {
    try {
      // If we mount successfully, we pass
      onResult(true);
    } catch (e: any) {
      onResult(false, e.message);
    }
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <App />
    </div>
  );
};

// --- DASHBOARD UI ---
const TestDashboard = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [smokeTestStatus, setSmokeTestStatus] = useState<'PENDING' | 'PASS' | 'FAIL'>('PENDING');

  useEffect(() => {
    // Run Unit Tests
    runUnitTests();
    setResults([...getResults()]);
  }, []);

  const handleSmokeResult = (success: boolean, err?: string) => {
    setSmokeTestStatus(success ? 'PASS' : 'FAIL');
    const smokeResult: TestResult = {
      suite: 'Smoke Test',
      description: 'App component renders without crashing',
      status: success ? 'PASS' : 'FAIL',
      error: err
    };
    setResults(prev => [...prev, smokeResult]);
  };

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
             <h1 className="text-3xl font-bold text-slate-800">Test Runner</h1>
             <p className="text-slate-500">Nexus EAPM CI/CD Check</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">
               PASS: {passCount}
             </div>
             {failCount > 0 && (
               <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold">
                 FAIL: {failCount}
               </div>
             )}
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
           <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <h3 className="font-semibold text-slate-700">Test Results</h3>
             <span className="text-xs text-slate-400 font-mono">browser-runtime</span>
           </div>
           <div className="divide-y divide-slate-100">
             {results.map((res, idx) => (
               <div key={idx} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                 <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                   res.status === 'PASS' ? 'bg-green-500' : 'bg-red-500'
                 }`}>
                   {res.status === 'PASS' ? '✓' : '✕'}
                 </div>
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {res.suite}
                      </span>
                      <h4 className="font-medium text-slate-800">{res.description}</h4>
                   </div>
                   {res.error && (
                     <pre className="mt-2 bg-red-50 text-red-700 p-3 rounded-lg text-xs font-mono overflow-auto">
                       {res.error}
                     </pre>
                   )}
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Hidden Smoke Test Mount */}
        <SmokeTestContainer onResult={handleSmokeResult} />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<TestDashboard />);