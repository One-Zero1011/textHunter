import * as fs from 'fs';
import * as path from 'path';

/**
 * Utility to generate a standard 8-bit mono WAV file programmatically
 */
function create8BitMonoWav(
  outputPath: string,
  sampleRate: number,
  duration: number,
  genFn: (t: number) => number
) {
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples;
  const totalFileSize = 36 + dataSize; 

  const buffer = Buffer.alloc(totalFileSize + 8);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(totalFileSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(1, 22); // NumChannels (1 = Mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 1 * 1, 28); // ByteRate (sampleRate * channels * bytesPerSample)
  buffer.writeUInt16LE(1, 32); // BlockAlign (channels * bytes/sample)
  buffer.writeUInt16LE(8, 34); // BitsPerSample (8-bit)

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // sound generation
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = genFn(t);
    
    // Normalize & clamp to [0, 255]
    let byteVal = Math.floor((val + 1.0) * 127.5);
    byteVal = Math.max(0, Math.min(255, byteVal));
    buffer.writeUInt8(byteVal, 44 + i);
  }

  // Make sure directories exist
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`[SoundGen] Saved: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

function run() {
  console.log('Starting programmatic BGM and SFX asset synthesis...');

  const SOUND_DIR = path.resolve(process.cwd(), 'public', 'sounds');

  // 1. Click Sound (UI response) - 0.08s, sweep 1500Hz -> 600Hz
  create8BitMonoWav(
    path.join(SOUND_DIR, 'click.wav'),
    11025,
    0.08,
    (t) => {
      const f = 1500 * Math.exp(-45 * t) + 400;
      const wave = Math.sin(2 * Math.PI * f * t);
      const env = Math.exp(-35 * t);
      return wave * env * 0.7;
    }
  );

  // 2. Level Up Fanfare - 1.2s, beautiful ascending arpeggio (E5 -> G#5 -> B5 -> E6)
  create8BitMonoWav(
    path.join(SOUND_DIR, 'levelup.wav'),
    11025,
    1.2,
    (t) => {
      let amp1 = t < 0.8 ? Math.exp(-12 * t) : 0;
      let amp2 = t > 0.12 && t < 0.9 ? Math.exp(-12 * (t - 0.12)) : 0;
      let amp3 = t > 0.24 && t < 1.0 ? Math.exp(-12 * (t - 0.24)) : 0;
      let amp4 = t > 0.36 ? Math.exp(-8 * (t - 0.36)) : 0;

      const f1 = 659.25; // E5
      const f2 = 830.61; // G#5
      const f3 = 987.77; // B5
      const f4 = 1318.51; // E6

      const wave = 
        Math.sin(2 * Math.PI * f1 * t) * amp1 * 0.3 +
        Math.sin(2 * Math.PI * f2 * t) * amp2 * 0.3 +
        Math.sin(2 * Math.PI * f3 * t) * amp3 * 0.3 +
        Math.sin(2 * Math.PI * f4 * t) * amp4 * 0.4;

      // Add a subtle metallic sparkle modulation effect
      const sparkle = Math.sin(2 * Math.PI * 2500 * t) * 0.05 * Math.sin(2 * Math.PI * 18 * t);
      
      return (wave + sparkle) * (1.0 - t * t * 0.6);
    }
  );

  // 3. Recovery Sparkle (Heal) - 0.8s, shimmering ascending frequency bubble sweep
  create8BitMonoWav(
    path.join(SOUND_DIR, 'heal.wav'),
    11025,
    0.8,
    (t) => {
      const upwardSweep = 450 + 950 * Math.pow(t, 1.5);
      const wave = Math.sin(2 * Math.PI * upwardSweep * t);
      const ringMod = Math.sin(2 * Math.PI * (1200 + 400 * Math.sin(35 * t)) * t) * 0.35;
      const env = Math.sin(Math.PI * t); // smooth bell curve envelope
      return (wave * 0.5 + ringMod * 0.3) * env * 0.8;
    }
  );

  // 4. Hit Sound (Explosive Impact) - 0.35s, heavy distortion & fast pitch drop with cyber white noise
  create8BitMonoWav(
    path.join(SOUND_DIR, 'hit.wav'),
    11025,
    0.35,
    (t) => {
      // White noise stream
      const noiseVal = Math.random() * 2.0 - 1.0;
      
      // Low rumble sweep
      const bassSweep = 300 * Math.exp(-18 * t) + 40;
      let bassWave = Math.sin(2 * Math.PI * bassSweep * t);
      // Soft saturation clip distortion
      if (bassWave > 0.6) bassWave = 0.6;
      if (bassWave < -0.6) bassWave = -0.6;

      const env = Math.exp(-14 * t);
      const noiseEnv = Math.exp(-22 * t);
      
      return (bassWave * 0.6 * env) + (noiseVal * 0.3 * noiseEnv);
    }
  );

  // 5. Dungeon Victory Fanfare - 1.8s, majestic minor-to-major triumph chords
  create8BitMonoWav(
    path.join(SOUND_DIR, 'victory.wav'),
    11025,
    1.8,
    (t) => {
      // 0.0 - 0.3: note 1 (D4)
      // 0.3 - 0.6: note 2 (F#4)
      // 0.6 - 1.8: sustained triad (D4, A4, D5)
      let n1 = t < 0.4 ? Math.exp(-10 * t) : 0;
      let n2 = t >= 0.3 && t < 0.7 ? Math.exp(-10 * (t - 0.3)) : 0;
      let n3 = t >= 0.6 ? (1.0 - (t - 0.6) / 1.2) : 0;

      const f_d4 = 293.66;
      const f_fs4 = 369.99;
      const f_a4 = 440.00;
      const f_d5 = 587.33;

      let wave = 0;
      if (t < 0.3) {
        wave = Math.sin(2 * Math.PI * f_d4 * t) * n1 * 0.6;
      } else if (t < 0.6) {
        wave = Math.sin(2 * Math.PI * f_fs4 * t) * n2 * 0.6;
      } else {
        // Sustained D Major chord with beautiful detune/chorus
        const d_maj = 
          Math.sin(2 * Math.PI * f_d4 * t) * 0.35 +
          Math.sin(2 * Math.PI * f_fs4 * t) * 0.3 +
          Math.sin(2 * Math.PI * f_a4 * t) * 0.25 +
          Math.sin(2 * Math.PI * f_d5 * t * 1.006) * 0.15; // detune
        
        // Tremolo vibrato
        const tremolo = 0.8 + 0.2 * Math.sin(2 * Math.PI * 6.5 * t);
        wave = d_maj * n3 * tremolo * 0.7;
      }
      return wave;
    }
  );

  // 6. Dungeon Defeat - 2.0s, gloomy minor cluster sweep down
  create8BitMonoWav(
    path.join(SOUND_DIR, 'defeat.wav'),
    11025,
    2.0,
    (t) => {
      const env = (1.0 - t / 2.0);
      
      // Gloomy low disharmonic notes
      const f1 = 110.00 * Math.exp(-1.5 * t); // A2 falling
      const f2 = 138.59 * Math.exp(-1.2 * t); // C#3 falling
      const f3 = 164.81 * Math.exp(-1.0 * t); // E3 falling

      const wave1 = Math.sin(2 * Math.PI * f1 * t) * 0.4;
      const wave2 = Math.sin(2 * Math.PI * f2 * t) * 0.35;
      const wave3 = Math.sin(2 * Math.PI * f3 * t) * 0.25;

      const noise = (Math.random() * 2 - 1) * 0.05 * Math.exp(-2 * t);

      return (wave1 + wave2 + wave3 + noise) * env;
    }
  );

  // 7. Loop-able Cyber Ambient BGM - 8.0 seconds at a clean 22050Hz for full atmospheric richness!
  // Uses deep retro synth chords with soft LFO resonant sweep
  create8BitMonoWav(
    path.join(SOUND_DIR, 'bgm.wav'),
    22050,
    8.0,
    (t) => {
      // 4-step dark synth chord progression (2 seconds each step)
      // 0s-2s: D minor (D3=146.83, F3=174.61, A3=220.0, D5=587.33)
      // 2s-4s: Bb Major (Bb2=116.54, D3=146.83, F3=174.61, F5=698.46)
      // 4s-6s: C Major (C3=130.81, E3=164.81, G3=196.0, G5=783.99)
      // 6s-8s: A minor (A2=110.0, C3=130.81, E3=164.81, E5=659.25)
      
      let chord_idx = Math.floor(t / 2.0);
      let t_rel = t % 2.0;

      // Base frequencies for each chord index
      let freqs: number[] = [];
      if (chord_idx === 0) {
        freqs = [146.83, 174.61, 220.0, 587.33]; // Dm
      } else if (chord_idx === 1) {
        freqs = [116.54, 146.83, 174.61, 698.46]; // Bb
      } else if (chord_idx === 2) {
        freqs = [130.81, 164.81, 196.0, 783.99];  // C
      } else {
        freqs = [110.0, 130.81, 164.81, 659.25];   // Am
      }

      // Mix oscillators
      // Oscar 1: Sawtooth-ish (approximated as combined sine harmonics)
      // Oscar 2: Triangle-ish (soft high harmonic)
      // Oscar 3: Sine drone
      // Oscar 4: Light sub-bass
      
      let waveSum = 0;
      
      // Sub-bass
      waveSum += Math.sin(2 * Math.PI * (freqs[0] / 2.0) * t) * 0.45;
      
      // Chord core voices
      waveSum += Math.sin(2 * Math.PI * freqs[0] * t) * 0.25;
      waveSum += Math.sin(2 * Math.PI * freqs[1] * t) * 0.25;
      waveSum += Math.sin(2 * Math.PI * freqs[2] * t) * 0.25;
      
      // High-register melody notes (Shifting sweet ambient pulse)
      const pulseT = Math.sin(2 * Math.PI * 0.25 * t); // slow pulse
      waveSum += Math.sin(2 * Math.PI * freqs[3] * t * 1.003) * 0.08 * (0.6 + 0.4 * pulseT);

      // Low frequency spectral filter sweeps (LFO)
      const lfo = 0.55 + 0.4 * Math.sin(2 * Math.PI * 0.125 * t); // Sweeps slowly over 8 seconds
      
      // Add a subtle wave chorus
      waveSum += Math.sin(2 * Math.PI * freqs[0] * 1.008 * t) * 0.15;
      
      // Master amplitude fade-in / fade-out at loop boundaries so it loops perfectly
      let loopFade = 1.0;
      if (t < 0.4) {
        loopFade = t / 0.4;
      } else if (t > 7.6) {
        loopFade = (8.0 - t) / 0.4;
      }

      return waveSum * lfo * loopFade * 0.35;
    }
  );

  console.log('Audio asset synthesis successfully finalized!');
}

run();
