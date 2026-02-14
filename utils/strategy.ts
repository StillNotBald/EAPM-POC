import { AppValue, StrategyDisposition, StrategyResult } from '../types';

export const getStrategyDisposition = (value: AppValue, health: number): StrategyResult => {
  // TIME Model Logic
  // High Value + High Health = INVEST
  if ((value === AppValue.CRITICAL || value === AppValue.HIGH) && health >= 70) {
    return { disposition: StrategyDisposition.INVEST, color: 'text-green-700 bg-green-100' };
  }
  // High Value + Low Health = MIGRATE
  if ((value === AppValue.CRITICAL || value === AppValue.HIGH) && health < 70) {
    return { disposition: StrategyDisposition.MIGRATE, color: 'text-red-700 bg-red-100' };
  }
  // Low Value + High Health = TOLERATE
  if ((value === AppValue.STANDARD) && health >= 70) {
    return { disposition: StrategyDisposition.TOLERATE, color: 'text-blue-700 bg-blue-100' };
  }
  // Low Value + Low Health = ELIMINATE
  return { disposition: StrategyDisposition.ELIMINATE, color: 'text-gray-700 bg-gray-100' };
};