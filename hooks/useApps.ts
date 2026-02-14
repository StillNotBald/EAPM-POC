import { useState, useMemo } from 'react';
import { Application, AppValue, CAPABILITIES } from '../types';
import { INITIAL_APPS } from '../constants';
import { getStrategyDisposition } from '../utils/strategy';

export const useApps = () => {
  const [apps, setApps] = useState<Application[]>(INITIAL_APPS);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Manage LOVs (List of Values)
  const [capabilities, setCapabilities] = useState<string[]>(CAPABILITIES);
  const [domains, setDomains] = useState<string[]>(() => {
    // Derive initial domains from existing apps + defaults
    const appDomains = new Set(INITIAL_APPS.map(a => a.domain));
    return Array.from(new Set([...Array.from(appDomains), 'General', 'IT', 'Commercial', 'Finance', 'HR', 'Supply Chain'])).sort();
  });

  const enrichedApps = useMemo(() => {
    return apps.map(app => ({
      ...app,
      strategy: getStrategyDisposition(app.value, app.health)
    }));
  }, [apps]);

  const updateApp = (updatedApp: Application) => {
    setApps(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
  };

  const addApp = (newApp: Application) => {
    setApps(prev => [...prev, newApp]);
  };

  const bulkAddApps = (newApps: Application[]) => {
    setApps(prev => [...prev, ...newApps]);
  };

  const deleteApp = (appId: string) => {
    setApps(prev => prev.filter(a => a.id !== appId));
  };

  // LOV CRUD Operations
  const addCapability = (cap: string) => {
    if (!capabilities.includes(cap)) setCapabilities(prev => [...prev, cap].sort());
  };

  const removeCapability = (cap: string) => {
    setCapabilities(prev => prev.filter(c => c !== cap));
  };

  const addDomain = (dom: string) => {
    if (!domains.includes(dom)) setDomains(prev => [...prev, dom].sort());
  };

  const removeDomain = (dom: string) => {
    setDomains(prev => prev.filter(d => d !== dom));
  };

  return {
    apps: enrichedApps,
    updateApp,
    addApp,
    bulkAddApps,
    deleteApp,
    selectedAppId,
    setSelectedAppId,
    getStrategyDisposition,
    // LOVs
    capabilities,
    domains,
    addCapability,
    removeCapability,
    addDomain,
    removeDomain
  };
};