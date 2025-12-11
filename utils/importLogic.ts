
import { v4 as uuidv4 } from 'uuid';
import { EnsembleInfo, ServiceInfo, GlobalSettings, AudioType, ProtectionLevel } from '../types';

// Helper to extract content within a balanced brace block
const extractBlockContent = (text: string, blockName: string): string | null => {
  const startIndex = text.indexOf(`${blockName} {`);
  if (startIndex === -1) return null;

  let openBraces = 0;
  let contentStart = -1;
  let endIndex = -1;

  for (let i = startIndex; i < text.length; i++) {
    if (text[i] === '{') {
      if (openBraces === 0) contentStart = i + 1;
      openBraces++;
    } else if (text[i] === '}') {
      openBraces--;
      if (openBraces === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (contentStart !== -1 && endIndex !== -1) {
    return text.substring(contentStart, endIndex);
  }
  return null;
};

// Helper to extract a value by key (e.g., "label")
const extractValue = (text: string, key: string): string => {
  const regex = new RegExp(`${key}\\s+["']?([^"'\n}]+)["']?`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
};

const extractHexValue = (text: string, key: string): string => {
  let val = extractValue(text, key);
  if (!val) return '';
  
  // Ensure no surrounding whitespace interferes
  val = val.trim();

  // 1. If it starts with 0x, treat as explicit Hex
  if (val.toLowerCase().startsWith('0x')) {
    return val.replace(/^0x/i, '').toUpperCase().padStart(2, '0');
  }

  // 2. If it contains hex characters (a-f), it MUST be Hex
  // (e.g. "E1" or "1f")
  if (/[a-fA-F]/.test(val)) {
    return val.toUpperCase().padStart(2, '0');
  }

  // 3. If it is purely numeric digits (and hasn't been caught by 0x or a-f),
  // treat as DECIMAL and convert to Hex.
  // Example: Input "21" (decimal) -> Output "15" (hex)
  if (/^\d+$/.test(val)) {
    const dec = parseInt(val, 10);
    return dec.toString(16).toUpperCase().padStart(2, '0');
  }

  // Fallback: Return as is (upper case)
  return val.toUpperCase();
};

export const parseConfigFile = (fileContent: string): { 
  ensemble: EnsembleInfo, 
  services: ServiceInfo[], 
  settings: GlobalSettings 
} => {
  // 1. Clean content (remove comments starting with ; or #)
  const cleanContent = fileContent.replace(/([;#].*)/g, '');

  // 2. Parse Global Settings
  const generalBlock = extractBlockContent(cleanContent, 'general') || '';
  const remoteBlock = extractBlockContent(cleanContent, 'remotecontrol') || '';
  const outputsBlock = extractBlockContent(cleanContent, 'outputs');
  
  // Deep dive for output port
  let ediPort = 9201;
  if (outputsBlock) {
     const ediBlock = extractBlockContent(outputsBlock, 'edi');
     if (ediBlock) {
        const destBlock = extractBlockContent(ediBlock, 'destinations');
        if (destBlock) {
            const tcpBlock = extractBlockContent(destBlock, 'edi_tcp');
            if (tcpBlock) {
                const p = extractValue(tcpBlock, 'listenport');
                if (p) ediPort = parseInt(p, 10);
            }
        }
     }
  }

  // TIST Parsing logic
  const tistVal = extractValue(generalBlock, 'tist');
  const isTistEnabled = tistVal.toLowerCase() !== 'false';
  let tistOffset = 0;
  if (isTistEnabled) {
     const parsed = parseFloat(tistVal);
     if (!isNaN(parsed)) tistOffset = parsed;
  }

  const settings: GlobalSettings = {
    managementPort: parseInt(extractValue(generalBlock, 'managementport'), 10) || 12720,
    telnetPort: parseInt(extractValue(remoteBlock, 'telnetport'), 10) || 12721,
    zmqEndpoint: extractValue(remoteBlock, 'zmqendpoint') || 'tcp://lo:12722',
    ediPort: ediPort,
    // Advanced defaults or parsed values
    dabMode: parseInt(extractValue(generalBlock, 'dabmode'), 10) || 1,
    nbFrames: parseInt(extractValue(generalBlock, 'nbframes'), 10) || 0,
    syslog: extractValue(generalBlock, 'syslog').toLowerCase() === 'true',
    tist: isTistEnabled,
    tistOffset: tistOffset
  };

  // 3. Parse Ensemble
  const ensembleBlock = extractBlockContent(cleanContent, 'ensemble') || '';
  const ensembleEcc = extractHexValue(ensembleBlock, 'ecc');
  
  const ensemble: EnsembleInfo = {
    eid: extractHexValue(ensembleBlock, 'id') || '',
    country: ensembleEcc || 'None / Undefined', // Use hex directly.
    label: extractValue(ensembleBlock, 'label'),
    shortLabel: extractValue(ensembleBlock, 'shortlabel'),
    // Advanced defaults or parsed
    localTimeOffset: extractValue(ensembleBlock, 'local-time-offset') || 'auto',
    internationalTable: parseInt(extractValue(ensembleBlock, 'international-table'), 10) || 1,
    reconfigCounter: extractValue(ensembleBlock, 'reconfig-counter') || 'hash'
  };

  // 4. Parse Sub-blocks for Service Construction
  const servicesBlock = extractBlockContent(cleanContent, 'services') || '';
  const subchannelsBlock = extractBlockContent(cleanContent, 'subchannels') || '';
  const componentsBlock = extractBlockContent(cleanContent, 'components') || '';

  // Parse Raw Service Definitions
  const rawServices: Record<string, any> = {};
  const srvRegex = /(srv-[a-zA-Z0-9_-]+)\s*\{/g;
  let match;
  while ((match = srvRegex.exec(servicesBlock)) !== null) {
    const srvName = match[1];
    const block = extractBlockContent(servicesBlock, srvName);
    if (block) {
      rawServices[srvName] = {
        sid: extractHexValue(block, 'id'),
        label: extractValue(block, 'label'),
        shortLabel: extractValue(block, 'shortlabel'),
        pty: extractValue(block, 'pty'),
        ecc: extractHexValue(block, 'ecc'),
        language: extractHexValue(block, 'language'),
        // Advanced
        ptySd: extractValue(block, 'pty-sd') === 'dynamic' ? 'dynamic' : 'static'
      };
    }
  }

  // Parse Raw Subchannel Definitions
  const rawSubchannels: Record<string, any> = {};
  const subRegex = /(sub-[a-zA-Z0-9_-]+)\s*\{/g;
  while ((match = subRegex.exec(subchannelsBlock)) !== null) {
    const subName = match[1];
    const block = extractBlockContent(subchannelsBlock, subName);
    if (block) {
      const inputUri = extractValue(block, 'inputuri'); // "tcp://127.0.0.1:9001"
      const portMatch = inputUri.match(/:(\d+)"?$/);
      
      const protVal = parseInt(extractValue(block, 'protection'), 10);
      const protProfile = extractValue(block, 'protection-profile');
      
      let protection = ProtectionLevel.EEP_3A;

      if (protProfile === 'EEP_B') {
        if (protVal === 1) protection = ProtectionLevel.EEP_1B;
        if (protVal === 2) protection = ProtectionLevel.EEP_2B;
        if (protVal === 3) protection = ProtectionLevel.EEP_3B;
        if (protVal === 4) protection = ProtectionLevel.EEP_4B;
      } else if (protProfile === 'UEP') {
        if (protVal === 1) protection = ProtectionLevel.UEP_1;
        if (protVal === 2) protection = ProtectionLevel.UEP_2;
        if (protVal === 3) protection = ProtectionLevel.UEP_3;
        if (protVal === 4) protection = ProtectionLevel.UEP_4;
        if (protVal === 5) protection = ProtectionLevel.UEP_5;
      } else {
        // EEP-A or Implicit Fallback
        if (protVal === 1) protection = ProtectionLevel.EEP_1A;
        if (protVal === 2) protection = ProtectionLevel.EEP_2A;
        if (protVal === 3) protection = ProtectionLevel.EEP_3A;
        if (protVal === 4) protection = ProtectionLevel.EEP_4A;
        
        // Implicit UEP detection: EEP only goes up to 4, so 5 must be UEP
        if (protVal === 5) protection = ProtectionLevel.UEP_5;
      }

      rawSubchannels[subName] = {
        type: extractValue(block, 'type') as AudioType,
        bitrate: parseInt(extractValue(block, 'bitrate'), 10) || 96,
        protection: protection,
        port: portMatch ? parseInt(portMatch[1], 10) : 9001,
        // Advanced
        bufferManagement: extractValue(block, 'buffer-management') === 'timestamped' ? 'timestamped' : 'prebuffering',
        bufferSize: parseInt(extractValue(block, 'buffer'), 10) || 40,
        prebufferingSize: parseInt(extractValue(block, 'prebuffering'), 10) || 20
      };
    }
  }

  // Link via Components
  const finalServices: ServiceInfo[] = [];
  const compRegex = /(comp-[a-zA-Z0-9_-]+)\s*\{/g;
  
  while ((match = compRegex.exec(componentsBlock)) !== null) {
    const compName = match[1];
    const block = extractBlockContent(componentsBlock, compName);
    if (block) {
      const srvRef = extractValue(block, 'service');
      const subRef = extractValue(block, 'subchannel');

      if (rawServices[srvRef] && rawSubchannels[subRef]) {
        const sData = rawServices[srvRef];
        const subData = rawSubchannels[subRef];

        finalServices.push({
          id: uuidv4(),
          sid: sData.sid,
          label: sData.label,
          shortLabel: sData.shortLabel,
          pty: sData.pty || '0',
          type: subData.type === 'dabplus' ? AudioType.DAB_PLUS : AudioType.DAB_MP2, // Handle loose match
          bitrate: subData.bitrate,
          protection: subData.protection,
          country: sData.ecc || 'None / Undefined', // Use hex directly
          language: sData.language || 'None / Undefined', // Use hex directly
          port: subData.port,
          isPortCustom: true, // Imported configs should keep their ports
          // Advanced
          ptySd: sData.ptySd,
          bufferManagement: subData.bufferManagement,
          bufferSize: subData.bufferSize,
          prebufferingSize: subData.prebufferingSize
        });
      }
    }
  }

  return { ensemble, services: finalServices, settings };
};
