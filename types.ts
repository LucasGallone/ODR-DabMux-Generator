
export enum ProtectionLevel {
  EEP_1A = 'EEP-1A',
  EEP_2A = 'EEP-2A',
  EEP_3A = 'EEP-3A',
  EEP_4A = 'EEP-4A',
  EEP_1B = 'EEP-1B',
  EEP_2B = 'EEP-2B',
  EEP_3B = 'EEP-3B',
  EEP_4B = 'EEP-4B',
  UEP_1 = 'UEP-1',
  UEP_2 = 'UEP-2',
  UEP_3 = 'UEP-3',
  UEP_4 = 'UEP-4',
  UEP_5 = 'UEP-5',
}

export enum AudioType {
  DAB_PLUS = 'dabplus',
  DAB_MP2 = 'dab',
}

export type OutputFormat = 'info' | 'mux';

export interface GlobalSettings {
  // Network Ports
  managementPort: number;
  telnetPort: number;
  zmqEndpoint: string;
  ediPort: number;
  
  // Advanced General Settings
  dabMode: number;
  nbFrames: number;
  syslog: boolean;
  tist: boolean;
  tistOffset: number; // Offset in seconds
}

export interface EnsembleInfo {
  eid: string;
  country: string; // Stores the Country Name (unique key)
  label: string;
  shortLabel: string;

  // Advanced Ensemble Settings
  localTimeOffset: string; // "auto" or number
  internationalTable: number;
  reconfigCounter: string; // "hash" or number
}

export interface ServiceInfo {
  id: string; // UUID for internal React list key
  sid: string;
  label: string;
  shortLabel: string;
  pty: string;
  type: AudioType;
  bitrate: number;
  protection: ProtectionLevel;
  country: string; // Stores the Country Name (unique key)
  language: string;
  port: number;
  isPortCustom: boolean; // Tracks if the user has manually set the port

  // Advanced Service Settings
  ptySd: 'static' | 'dynamic';
  bufferManagement: 'prebuffering' | 'timestamped';
  bufferSize: number;
  prebufferingSize: number;
}

export interface PTYDefinition {
  value: number;
  label: string;
}
