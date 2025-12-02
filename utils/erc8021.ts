/**
 * Implementation of ERC-8021 Suffix Generation
 * Based on the spec: {txData}{schemaData}{schemaId}{ercSuffix}
 */

// The magic suffix defined in ERC-8021: "8021" repeated 4 times (16 bytes)
const ERC_SUFFIX = "80218021802180218021802180218021";

/**
 * Encodes a string to Hex (ASCII)
 */
function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Generates the attribution suffix for Schema 0 (Canonical Registry)
 * Structure: {codesLength}{codes}{schemaId}{ercSuffix}
 */
export const generateAttributionSuffix = (appCode: string): string => {
  // 1. Encode the app code
  const codeHex = stringToHex(appCode);
  
  // 2. Calculate length of codes (in bytes)
  const lengthByte = (codeHex.length / 2).toString(16).padStart(2, '0');
  
  // 3. Schema ID 0
  const schemaId = "00";
  
  // 4. Combine
  return `${lengthByte}${codeHex}${schemaId}${ERC_SUFFIX}`;
};

export const WALLET_ADDRESS = "0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B";
