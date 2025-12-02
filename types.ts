export enum GameStage {
  ENTRY_VAULT = 1,
  GRAVITY_WELLS = 2,
  CRYSTAL_HALLS = 3,
  MACHINE_CORE = 4,
  APEX_CHAMBER = 5,
}

export enum ViewState {
  MENU = 'MENU',
  GAME = 'GAME',
  LORE = 'LORE',
  ATTRIBUTION = 'ATTRIBUTION',
}

export interface SystemStatus {
  integrity: number;
  energy: number;
  resonance: number;
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  unlockedAt: GameStage;
}

export interface ERC8021Payload {
  targetAddress: string;
  appCode: string;
  schemaId: number;
  suffix: string;
}
