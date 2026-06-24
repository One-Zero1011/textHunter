/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAssetPath } from '../utils';

// Sound names and corresponding paths under public/sounds/
export type SfxType = 'click' | 'levelup' | 'heal' | 'hit' | 'victory' | 'defeat';

class SoundManager {
  private bgm: HTMLAudioElement | null = null;
  private isMuted: boolean = false; // Start unmuted; user gesture will start it cleanly
  private sfxCache: Record<string, HTMLAudioElement> = {};
  private hasInteracted: boolean = false;
  private volume: number = 0.5; // Default master volume: 50%

  constructor() {
    // Only compile on client side
    if (typeof window !== 'undefined') {
      this.initBgm();
      this.preloadSfx();
      
      // Hook up interaction listener to bypass browser autoplay restrictions
      const handleGesture = () => {
        if (!this.hasInteracted) {
          this.hasInteracted = true;
          // Clean up listeners
          window.removeEventListener('click', handleGesture);
          window.removeEventListener('keydown', handleGesture);
          window.removeEventListener('touchstart', handleGesture);
          
          // Try playing BGM if not muted
          if (!this.isMuted) {
            this.playBgm();
          }
        }
      };

      window.addEventListener('click', handleGesture);
      window.addEventListener('keydown', handleGesture);
      window.addEventListener('touchstart', handleGesture);
    }
  }

  private initBgm() {
    // Background music disabled per user request to keep the app silent except for SFX
    this.bgm = null;
  }

  private preloadSfx() {
    const sfxList: SfxType[] = ['click', 'levelup', 'heal', 'hit', 'victory', 'defeat'];
    sfxList.forEach((sfx) => {
      try {
        const sfxPath = getAssetPath(`sounds/${sfx}.wav?v=3`);
        const audio = new Audio(sfxPath);
        this.sfxCache[sfx] = audio;
        this.updateSfxVolume(sfx);
      } catch (e) {
        console.warn(`[SoundManager] Could not preload SFX: ${sfx}`, e);
      }
    });
  }

  private updateBgmVolume() {
    if (this.bgm) {
      // Significantly increase BGM weight (from 0.35 to 0.75) so it's fully and clearly audible at 50% master volume
      this.bgm.volume = 0.75 * this.volume;
      console.log('[SoundManager] Updated BGM volume to:', this.bgm.volume, '(master:', this.volume, ')');
    }
  }

  private updateSfxVolume(sfx?: SfxType) {
    const applyVolume = (type: SfxType, audio: HTMLAudioElement) => {
      const baseWeight = type === 'click' ? 0.45 : type === 'hit' ? 0.7 : type === 'heal' ? 0.8 : 0.9;
      audio.volume = baseWeight * this.volume;
    };

    if (sfx) {
      const audio = this.sfxCache[sfx];
      if (audio) applyVolume(sfx, audio);
    } else {
      Object.keys(this.sfxCache).forEach((key) => {
        const audio = this.sfxCache[key];
        if (audio) applyVolume(key as SfxType, audio);
      });
    }
  }

  /**
   * Set isMuted state and adjust sound outputs immediately
   */
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    console.log(`[SoundManager] Mute state toggled: ${muted}`);

    if (this.bgm) {
      if (muted) {
        this.bgm.pause();
      } else {
        this.playBgm();
      }
    }
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.updateBgmVolume();
    this.updateSfxVolume();

    // If master volume is positive and they are unmuted, trigger playback
    if (this.volume > 0 && !this.isMuted && this.bgm && this.bgm.paused) {
      this.playBgm();
    }
  }

  /**
   * Get current volume level (0.0 - 1.0)
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Get current mute state
   */
  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play background ambient loop safely (BGM disabled per user request)
   */
  public playBgm() {
    // Background music disabled per user request
  }

  /**
   * Ensure BGM is playing (BGM disabled per user request)
   */
  public ensureBgmPlaying() {
    // Background music disabled per user request
  }

  /**
   * Pause background ambient loop (BGM disabled per user request)
   */
  public pauseBgm() {
    // Background music disabled per user request
  }

  /**
   * Play a specific sound effect instantly
   */
  public playSfx(type: SfxType) {
    if (this.isMuted || this.volume <= 0) return;

    try {
      const cached = this.sfxCache[type];
      if (cached) {
        // Reset to beginning to allow rapid overlapping triggers
        cached.currentTime = 0;
        cached.play().catch((err) => {
          console.warn(`[SoundManager] Play SFX blocked (${type}):`, err);
        });
      } else {
        // Fallback load with cache busting
        const sfxPath = getAssetPath(`sounds/${type}.wav?v=3`);
        const audio = new Audio(sfxPath);
        const baseWeight = type === 'click' ? 0.45 : type === 'hit' ? 0.7 : type === 'heal' ? 0.8 : 0.9;
        audio.volume = baseWeight * this.volume;
        audio.play().catch(() => {});
      }
    } catch (e) {
      console.error(`[SoundManager] Fail playing SFX ${type}:`, e);
    }
  }
}

// Export a single global instance for consistent state everywhere
export const soundManager = new SoundManager();
