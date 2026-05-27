/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StatBonuses {
  strength?: number;
  agility?: number;
  mana?: number;
  intellect?: number;
}

export interface CharacterStats {
  strength: number;    // 근력
  agility: number;     // 민첩
  mana: number;        // 마력
  intellect: number;   // 지력
}

export interface BodyPartsHP {
  head: number;        // 머리 (0 이면 즉사)
  torso: number;       // 몸통 (0 이면 즉사)
  leftArm: number;     // 왼팔
  rightArm: number;    // 오른팔
  leftLeg: number;     // 왼다리
  rightLeg: number;    // 오른다리
}

export type BodyPartName = keyof BodyPartsHP;

export interface Equipment {
  id: string;
  name: string;
  description: string;
  price: number;
  slot: 'weapon' | 'armor' | 'accessory' | 'shield';
  bonuses: StatBonuses;
  hpModifier?: Partial<BodyPartsHP>;
  purchased: boolean;
  equipped: boolean;
}

export interface Npc {
  id: string;
  name: string;
  age: number;
  gender: string;
  rank: string;
  specialty: string;
  catchphrase: string;
  avatarUrl: string;
  illustUrl: string;
  rapport: number;     // 호감도 (0 - 100)
  unlocked: boolean;   // 만났는지 여부
  isAlly: boolean;     // 동료 참전 가능 여부 (호감도 높은 경우)
  colorClass: string;  // 폰트 및 테두리 색상 테마
  description: string;
  likes: string[];
  dislikes: string[];
  fear: string;
  features: string[];
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  options?: {
    text: string;
    nextId?: string;
    rapportChange?: { npcId: string; amount: number };
    statChange?: Partial<CharacterStats>;
    goldChange?: number;
    actions?: string[];
  }[];
}

export interface GridRoom {
  id: string;
  name: string;
  type: 'start' | 'empty' | 'combat' | 'chest' | 'event' | 'boss';
  explored: boolean;
  clear: boolean;
  npcPresent?: string; // id of NPC
  connections: string[];
  depth: number;
  row: number;
  threatLevel: 'low' | 'medium' | 'high' | 'dead_end' | 'secure' | 'boss';
  description: string;
  lootQuality?: 'none' | 'normal' | 'rare' | 'legendary';
}

export interface Dungeon {
  id: string;
  name: string;
  rank: string;
  recommendedPower: number;
  entryChance: number; // 입장 확률 (자신보다 높은 등급일 경우 보정)
  fatigueCost: number;
  rewards: {
    gold: number;
    items: string[];
  };
  gridSize: number; // 4x4 or 5x5
  daysLeft?: number; // 남은 유지 기간 (일 단위)
}

export interface CombatLog {
  id: string;
  text: string;
  type: 'player' | 'ally' | 'enemy' | 'system' | 'heal' | 'death' | 'evade' | 'skill';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  type: 'loop' | 'stat' | 'rapport' | 'gold' | 'combat';
}

export interface ChatMessage {
  sender: 'player' | 'npc';
  text: string;
  timestamp: string;
}

export interface ChatHistory {
  [npcId: string]: ChatMessage[];
}

