/**
 * RxFlow PingEngine v3.0 (Forwarder)
 * PingEngine functionality is unified into AppStartEngine.
 * Re-exports AppStartEngine as PingEngine for 100% clean backwards compatibility.
 */

import { AppStartEngine, type AppHealthStatus } from './AppStartEngine';

export type PingStatus = AppHealthStatus;
export const PingEngine = AppStartEngine;
