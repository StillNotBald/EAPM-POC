export type TestStatus = 'PASS' | 'FAIL';

export interface TestResult {
  suite: string;
  description: string;
  status: TestStatus;
  error?: string;
}

const results: TestResult[] = [];

export const describe = (suiteName: string, fn: () => void) => {
  try {
    fn();
  } catch (e) {
    console.error(`Suite ${suiteName} failed execution`, e);
  }
};

export const it = (testName: string, fn: () => void) => {
  const currentSuite = 'Unit Test'; // Simplified context
  try {
    fn();
    results.push({ suite: currentSuite, description: testName, status: 'PASS' });
  } catch (e: any) {
    results.push({ suite: currentSuite, description: testName, status: 'FAIL', error: e.message });
  }
};

export const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
  },
  toBeTruthy: () => {
    if (!actual) throw new Error(`Expected truthy but got ${actual}`);
  }
});

export const getResults = () => results;