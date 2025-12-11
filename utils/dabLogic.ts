
import { AudioType, ProtectionLevel, ServiceInfo, EnsembleInfo, GlobalSettings, OutputFormat } from '../types';
import { COUNTRIES, LANGUAGES } from '../constants';

// Table mapping Bitrate to CU size for UEP Levels 1-5 (DAB MP2)
// Index 0 corresponds to UEP-1, Index 4 to UEP-5.
// 0 values indicate invalid combinations (though rarely checked strictly here, we return 0)
const UEP_CU_TABLE: Record<number, number[]> = {
  32:  [27, 24, 21, 18, 16],
  48:  [42, 36, 32, 27, 24],
  56:  [48, 42, 39, 32, 27],
  64:  [54, 48, 42, 36, 32],
  80:  [70, 60, 54, 45, 40],
  96:  [84, 72, 64, 54, 48],
  112: [96, 84, 75, 63, 56],
  128: [112, 96, 84, 72, 64],
  160: [140, 120, 108, 90, 80],
  192: [168, 144, 128, 108, 96],
  224: [198, 168, 150, 126, 112],
  256: [224, 192, 168, 144, 128],
  320: [280, 240, 216, 180, 160],
  384: [336, 288, 256, 216, 192]
};

export const isProtectionB = (p: ProtectionLevel): boolean => {
  return [
    ProtectionLevel.EEP_1B,
    ProtectionLevel.EEP_2B,
    ProtectionLevel.EEP_3B,
    ProtectionLevel.EEP_4B
  ].includes(p);
};

export const isUEP = (p: ProtectionLevel): boolean => {
  return [
    ProtectionLevel.UEP_1,
    ProtectionLevel.UEP_2,
    ProtectionLevel.UEP_3,
    ProtectionLevel.UEP_4,
    ProtectionLevel.UEP_5
  ].includes(p);
};

/**
 * Approximates the CU usage for a given bitrate and protection level.
 * 
 * EEP-A follows standard tables.
 * EEP-B follows specific formulas based on 32kbps chunks.
 * UEP follows specific lookup tables.
 */
export const calculateCU = (bitrate: number, protection: ProtectionLevel, type: AudioType): number => {
  
  // Handle UEP Profiles
  if (isUEP(protection)) {
    const tableValues = UEP_CU_TABLE[bitrate];
    if (tableValues) {
      // Map enum to index: UEP_1 -> 0, ..., UEP_5 -> 4
      let index = 0;
      switch (protection) {
        case ProtectionLevel.UEP_1: index = 0; break;
        case ProtectionLevel.UEP_2: index = 1; break;
        case ProtectionLevel.UEP_3: index = 2; break;
        case ProtectionLevel.UEP_4: index = 3; break;
        case ProtectionLevel.UEP_5: index = 4; break;
      }
      return tableValues[index] || 0;
    }
    // Fallback if bitrate not in UEP table (though validation should catch this)
    return 0; 
  }

  // Handle EEP-B Profiles first (Specific formulas)
  if (isProtectionB(protection)) {
    // Formula only valid for multiples of 32. 
    // If not multiple, we calculate pro-rata but the UI will show error.
    const multiple = bitrate / 32;
    
    switch (protection) {
      case ProtectionLevel.EEP_1B: return Math.ceil(multiple * 27);
      case ProtectionLevel.EEP_2B: return Math.ceil(multiple * 21);
      case ProtectionLevel.EEP_3B: return Math.ceil(multiple * 18);
      case ProtectionLevel.EEP_4B: return Math.ceil(multiple * 15);
    }
  }

  // Handle DAB+ (AAC) EEP-A
  if (type === AudioType.DAB_PLUS) {
    const table: Record<string, Record<number, number>> = {
      [ProtectionLevel.EEP_1A]: { 
        32: 48, 48: 72, 64: 96, 72: 108, 88: 132, 96: 144, 128: 192 
      },
      [ProtectionLevel.EEP_2A]: { 
        32: 32, 48: 48, 64: 64, 72: 72, 88: 88, 96: 96, 128: 128 
      },
      [ProtectionLevel.EEP_3A]: { 
        32: 24, 40: 30, 48: 36, 56: 42, 64: 48, 72: 54, 80: 60, 88: 66, 96: 72, 112: 84, 128: 96, 160: 120, 192: 144 
      },
      [ProtectionLevel.EEP_4A]: { 
        32: 16, 48: 24, 64: 32, 72: 36, 88: 44, 96: 48, 128: 64 
      }
    };

    if (table[protection] && table[protection][bitrate]) {
      return table[protection][bitrate];
    }
  }

  // Fallback formula calculation for EEP-A standard rates if not in lookup
  let rate = 0.5;
  switch (protection) {
    case ProtectionLevel.EEP_1A: rate = 0.25; break;
    case ProtectionLevel.EEP_2A: rate = 0.375; break; // 3/8
    case ProtectionLevel.EEP_3A: rate = 0.5; break;
    case ProtectionLevel.EEP_4A: rate = 0.75; break; // 3/4
  }

  const bitsPerFrame = bitrate * 24;
  const grossBits = bitsPerFrame / rate;
  let cu = Math.ceil(grossBits / 64);
  
  return cu;
};

export const validateEtsiCompliance = (type: AudioType, protection: ProtectionLevel, bitrate: number): boolean => {
  // Lower bound is always 8kbps base check
  if (bitrate < 8) return false;

  // UEP Validation
  if (isUEP(protection)) {
    // UEP is strictly for DAB (MP2)
    if (type !== AudioType.DAB_MP2) return false;
    // Check if bitrate exists in our table
    return UEP_CU_TABLE.hasOwnProperty(bitrate);
  }

  // Specific Logic for EEP-B Profiles
  if (isProtectionB(protection)) {
    // Requirements: Minimum 32 Kbps for all B profiles
    if (bitrate < 32) return false;

    if (type === AudioType.DAB_PLUS) {
      // DAB+ (AAC) Limits
      switch (protection) {
        case ProtectionLevel.EEP_1B: return bitrate <= 160;
        case ProtectionLevel.EEP_2B: return bitrate <= 192;
        case ProtectionLevel.EEP_3B: return bitrate <= 256;
        case ProtectionLevel.EEP_4B: return bitrate <= 288;
        default: return false;
      }
    } else {
      // DAB (MP2) Limits
      switch (protection) {
        case ProtectionLevel.EEP_1B: return bitrate <= 224;
        case ProtectionLevel.EEP_2B: return bitrate <= 288;
        case ProtectionLevel.EEP_3B: return bitrate <= 352;
        case ProtectionLevel.EEP_4B: return bitrate <= 384;
        default: return false;
      }
    }
  }

  // Logic for EEP-A Profiles (Existing logic preserved)
  let limit = 0;

  if (type === AudioType.DAB_MP2) {
    switch (protection) {
      case ProtectionLevel.EEP_1A: limit = 136; break;
      case ProtectionLevel.EEP_2A: limit = 208; break;
      case ProtectionLevel.EEP_3A: limit = 272; break;
      case ProtectionLevel.EEP_4A: limit = 384; break;
      default: return false;
    }
  } else {
    // DAB+ (AAC)
    switch (protection) {
      case ProtectionLevel.EEP_1A: limit = 96; break;
      case ProtectionLevel.EEP_2A: limit = 144; break;
      case ProtectionLevel.EEP_3A: limit = 192; break;
      case ProtectionLevel.EEP_4A: limit = 288; break;
      default: return false;
    }
  }
  
  return bitrate <= limit;
};

// Helper to find the code based on the unique country name
const getEccCode = (name: string): string => {
  const country = COUNTRIES.find(c => c.name === name);
  return country ? country.code : (name || '00');
};

// Helper to find the code based on the unique language name
const getLanguageCode = (name: string): string => {
  const lang = LANGUAGES.find(l => l.name === name);
  return lang ? lang.code : (name || '00');
};

const pad = (num: number): string => num.toString().padStart(2, '0');

export const generateConfigFile = (ensemble: EnsembleInfo, services: ServiceInfo[], settings: GlobalSettings, format: OutputFormat): string => {
  const lines: string[] = [];

  // General Section
  lines.push('general {');
  lines.push(`    dabmode ${settings.dabMode}`);
  lines.push(`    nbframes ${settings.nbFrames}`);
  lines.push(`    syslog ${settings.syslog}`);
  
  // TIST logic: if enabled, print offset, else false
  if (settings.tist) {
    lines.push(`    tist ${settings.tistOffset}`);
  } else {
    lines.push(`    tist false`);
  }
  
  lines.push(`    managementport ${settings.managementPort}`);
  lines.push('}');
  lines.push('');

  // Remote Control
  lines.push('remotecontrol {');
  lines.push(`    telnetport ${settings.telnetPort}`);
  lines.push(`    zmqendpoint ${settings.zmqEndpoint}`);
  lines.push('}');
  lines.push('');

  // Ensemble Section
  lines.push('ensemble {');
  lines.push(`    id 0x${ensemble.eid.toLowerCase()}`);
  lines.push(`    ecc 0x${getEccCode(ensemble.country).toLowerCase()}`);
  lines.push(`    local-time-offset ${ensemble.localTimeOffset}`);
  lines.push(`    international-table ${ensemble.internationalTable}`);
  lines.push(`    reconfig-counter ${ensemble.reconfigCounter}`);
  lines.push(`    label "${ensemble.label}"`);
  lines.push(`    shortlabel "${ensemble.shortLabel}"`);
  lines.push('}');
  lines.push('');

  // Services Section
  lines.push('services {');
  services.forEach((srv, index) => {
    const srvName = `srv-${pad(index + 1)}`;
    lines.push(`    ${srvName} {`);
    lines.push(`        id 0x${srv.sid.toLowerCase()}`);
    lines.push(`        ecc 0x${getEccCode(srv.country).toLowerCase()}`);
    lines.push(`        label "${srv.label}"`);
    lines.push(`        shortlabel "${srv.shortLabel}"`);
    lines.push(`        pty ${srv.pty}`);
    lines.push(`        pty-sd ${srv.ptySd}`);
    lines.push(`        language 0x${getLanguageCode(srv.language).toLowerCase()}`);
    lines.push(`    }`);
  });
  lines.push('}');
  lines.push('');

  // Subchannels Section
  lines.push('subchannels {');
  services.forEach((srv, index) => {
    const subName = `sub-${pad(index + 1)}`;
    
    // Map Protection Level to ID and Profile
    let protectionId = 3;
    let profile = '';

    // A Profiles
    if (srv.protection === ProtectionLevel.EEP_1A) protectionId = 1;
    if (srv.protection === ProtectionLevel.EEP_2A) protectionId = 2;
    if (srv.protection === ProtectionLevel.EEP_3A) protectionId = 3;
    if (srv.protection === ProtectionLevel.EEP_4A) protectionId = 4;
    
    // B Profiles
    if (srv.protection === ProtectionLevel.EEP_1B) { protectionId = 1; profile = 'EEP_B'; }
    if (srv.protection === ProtectionLevel.EEP_2B) { protectionId = 2; profile = 'EEP_B'; }
    if (srv.protection === ProtectionLevel.EEP_3B) { protectionId = 3; profile = 'EEP_B'; }
    if (srv.protection === ProtectionLevel.EEP_4B) { protectionId = 4; profile = 'EEP_B'; }

    // UEP Profiles
    if (srv.protection === ProtectionLevel.UEP_1) { protectionId = 1; profile = 'UEP'; }
    if (srv.protection === ProtectionLevel.UEP_2) { protectionId = 2; profile = 'UEP'; }
    if (srv.protection === ProtectionLevel.UEP_3) { protectionId = 3; profile = 'UEP'; }
    if (srv.protection === ProtectionLevel.UEP_4) { protectionId = 4; profile = 'UEP'; }
    if (srv.protection === ProtectionLevel.UEP_5) { protectionId = 5; profile = 'UEP'; }

    lines.push(`    ${subName} {`);
    lines.push(`        type ${srv.type}`);
    lines.push(`        bitrate ${srv.bitrate}`);
    lines.push(`        id ${index + 1}`); 
    
    // Explicitly write profile if B or UEP
    if (profile) {
      lines.push(`        protection-profile ${profile}`);
    }

    lines.push(`        protection ${protectionId}`);

    lines.push(`        inputproto edi`);
    lines.push(`        inputuri "tcp://127.0.0.1:${srv.port}"`);
    lines.push(`        buffer-management ${srv.bufferManagement}`);
    lines.push(`        buffer ${srv.bufferSize}`);
    lines.push(`        prebuffering ${srv.prebufferingSize}`);
    lines.push(`    }`);
  });
  lines.push('}');
  lines.push('');

  // Components Section
  lines.push('components {');
  services.forEach((_, index) => {
    const compName = `comp-${pad(index + 1)}`;
    const srvName = `srv-${pad(index + 1)}`;
    const subName = `sub-${pad(index + 1)}`;

    lines.push(`    ${compName} {`);
    lines.push(`        service ${srvName}`);
    lines.push(`        subchannel ${subName}`);
    lines.push(`        user-applications {`);
    lines.push(`            userapp "slideshow"`);
    lines.push(`        }`);
    lines.push(`    }`);
  });
  lines.push('}');
  lines.push('');

  // Outputs Section
  lines.push('outputs {');
  lines.push('    edi {');
  lines.push('        destinations {');
  lines.push('            edi_tcp {');
  lines.push('                protocol tcp');
  lines.push(`                listenport ${settings.ediPort}`);
  lines.push('            }');
  lines.push('        }');
  lines.push('    }');
  lines.push('');
  lines.push('    ; Throttle output to real-time (one ETI frame every 24ms)');
  
  if (format === 'mux') {
    lines.push('    zmq "zmq+tcp://*:18081"');
  }
  
  lines.push('    throttle "simul://"');
  lines.push('}');

  return lines.join('\n');
};
