export enum AppTier {
  CHANNEL = 'CHANNEL',
  INTEGRATION = 'INTEGRATION',
  CORE = 'CORE',
  INFRA = 'INFRA'
}

export enum AppValue {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  STANDARD = 'STANDARD',
  DEPRECATED = 'DEPRECATED'
}

export enum StrategyDisposition {
  INVEST = 'INVEST',
  TOLERATE = 'TOLERATE',
  MIGRATE = 'MIGRATE',
  ELIMINATE = 'ELIMINATE'
}

// PART 1: THE DRAGON1 ATTRIBUTES
export interface Application {
  id: string;
  name: string;
  code: string;
  tier: AppTier;
  description: string;
  owner: string; // "Data Stewardship"
  domain: string; // e.g. "Finance", "HR"
  capabilityId: string; // e.g. "Payroll"

  // Dragon1: Security & Compliance
  security: {
    gdprCompliant: boolean;
    piiRisk: 'NONE' | 'LOW' | 'HIGH';
    lastPenTest?: string;
  };

  // Dragon1: Architecture Quality
  technicalDebt: 'LOW' | 'MEDIUM' | 'HIGH';
  health: number;

  // Dragon1: Time-Based Lifecycle
  lifecycle: {
    status: 'ACTIVE' | 'PHASE_OUT' | 'EOL';
    validUntil?: string;
  };

  // Dragon1: Financials
  costs: {
    license: number;
    maintenance: number;
    total: number; // Computed property often used for sorting
  };

  value: AppValue;
  dataSensitivity: string;

  upstreamIds: string[];
  downstreamIds: string[];
}

export interface StrategyResult {
  disposition: StrategyDisposition;
  color: string;
}

export const CAPABILITIES = [
  'CAP-FINANCE',
  'CAP-HR',
  'CAP-SALES',
  'CAP-LOGISTICS',
  'CAP-IT',
  'CAP-MARKETING'
];