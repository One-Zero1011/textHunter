import * as fs from 'fs';
import * as path from 'path';

/**
 * Utility to generate a standard 16-bit mono WAV file programmatically
 */
function create16BitMonoWav(
  outputPath: string,
  sampleRate: number,
  duration: number,
  genFn: (t: number) => number
) {
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2; // 16-bit is 2 bytes per sample
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
  buffer.writeUInt32LE(sampleRate * 1 * 2, 28); // ByteRate (sampleRate * channels * bytesPerSample)
  buffer.writeUInt16LE(2, 32); // BlockAlign (channels * bytes/sample)
  buffer.writeUInt16LE(16, 34); // BitsPerSample (16-bit)

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // sound generation
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = genFn(t);
    
    // Normalize & clamp to [-32768, 32767]
    let sampleVal = Math.floor(val * 32767);
    sampleVal = Math.max(-32768, Math.min(32767, sampleVal));
    buffer.writeInt16LE(sampleVal, 44 + i * 2);
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
  console.log('Starting programmatic 16-bit BGM and SFX asset synthesis...');

  const SOUND_DIR = path.resolve(process.cwd(), 'public', 'sounds');

  // 1. Click Sound (UI response) - 0.08s, sweep 1200Hz -> 300Hz with stateful phase
  {
    let phase = 0;
    create16BitMonoWav(
      path.join(SOUND_DIR, 'click.wav'),
      11025,
      0.08,
      (t) => {
        const f = 1200 * Math.exp(-50 * t) + 300;
        phase += (2 * Math.PI * f) / 11025;
        const env = Math.exp(-40 * t);
        return Math.sin(phase) * env * 0.45;
      }
    );
  }

  // 2. Level Up Fanfare - 1.2s, beautiful ascending arpeggio (E5 -> G#5 -> B5 -> E6)
  {
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    create16BitMonoWav(
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

        p1 += (2 * Math.PI * f1) / 11025;
        p2 += (2 * Math.PI * f2) / 11025;
        p3 += (2 * Math.PI * f3) / 11025;
        p4 += (2 * Math.PI * f4) / 11025;

        const wave = 
          Math.sin(p1) * amp1 * 0.3 +
          Math.sin(p2) * amp2 * 0.3 +
          Math.sin(p3) * amp3 * 0.3 +
          Math.sin(p4) * amp4 * 0.4;

        // Soft, non-harsh shimmer
        const sparkleWave = Math.sin(2 * Math.PI * 2200 * t) * 0.02 * Math.sin(2 * Math.PI * 15 * t);
        
        return (wave + sparkleWave) * (1.0 - t * t * 0.6);
      }
    );
  }

  // 3. Recovery Sparkle (Heal) - 0.8s, shimmering ascending frequency bubble sweep with stateful phase
  {
    let p1 = 0, p2 = 0, p3 = 0;
    create16BitMonoWav(
      path.join(SOUND_DIR, 'heal.wav'),
      11025,
      0.8,
      (t) => {
        // Continuous upward sweeps
        const f1 = 600 + 1000 * Math.pow(t, 1.2);
        const f2 = 900 + 1500 * Math.pow(t, 1.2);
        const f3 = 1200 + 2000 * Math.pow(t, 1.2);
        
        p1 += (2 * Math.PI * f1) / 11025;
        p2 += (2 * Math.PI * f2) / 11025;
        p3 += (2 * Math.PI * f3) / 11025;
        
        // Smooth bell curve envelope
        const env = Math.sin(Math.PI * t);
        // Beautiful organic vibrato/twinkle
        const twinkle = 0.75 + 0.25 * Math.sin(2 * Math.PI * 14 * t);
        
        const s1 = Math.sin(p1) * 0.35;
        const s2 = Math.sin(p2) * 0.25;
        const s3 = Math.sin(p3) * 0.15;
        
        return (s1 + s2 + s3) * env * twinkle * 0.85;
      }
    );
  }

  // 4. Hit Sound (Explosive Impact) - 0.35s, heavy distortion & fast pitch drop with cyber white noise
  {
    let pLow = 0, pMid = 0, pHigh = 0;
    create16BitMonoWav(
      path.join(SOUND_DIR, 'hit.wav'),
      11025,
      0.35,
      (t) => {
        // Fast low thump
        const fLow = 220 * Math.exp(-40 * t) + 45;
        pLow += (2 * Math.PI * fLow) / 11025;
        
        // Solid mid-impact
        const fMid = 550 * Math.exp(-30 * t) + 90;
        pMid += (2 * Math.PI * fMid) / 11025;

        // Cyber transient zap
        const fHigh = 1200 * Math.exp(-60 * t) + 200;
        pHigh += (2 * Math.PI * fHigh) / 11025;

        const envLow = Math.exp(-12 * t);
        const envMid = Math.exp(-18 * t);
        const envHigh = Math.exp(-35 * t);

        // Highly filtered soft snap transient (no ongoing hissing/crackle)
        const snap = (Math.random() * 2 - 1) * Math.exp(-85 * t) * 0.1;

        const lowWave = Math.sin(pLow) * 0.5 * envLow;
        const midWave = Math.sin(pMid) * 0.3 * envMid;
        const highWave = Math.sin(pHigh) * 0.15 * envHigh;

        return (lowWave + midWave + highWave + snap) * 0.85;
      }
    );
  }

  // 5. Dungeon Victory Fanfare - 1.8s, majestic minor-to-major triumph chords with stateful phase
  {
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    create16BitMonoWav(
      path.join(SOUND_DIR, 'victory.wav'),
      11025,
      1.8,
      (t) => {
        let n1 = t < 0.4 ? Math.exp(-10 * t) : 0;
        let n2 = t >= 0.3 && t < 0.7 ? Math.exp(-10 * (t - 0.3)) : 0;
        let n3 = t >= 0.6 ? (1.0 - (t - 0.6) / 1.2) : 0;

        const f_d4 = 293.66;
        const f_fs4 = 369.99;
        const f_a4 = 440.00;
        const f_d5 = 587.33;

        p1 += (2 * Math.PI * f_d4) / 11025;
        p2 += (2 * Math.PI * f_fs4) / 11025;
        p3 += (2 * Math.PI * f_a4) / 11025;
        p4 += (2 * Math.PI * f_d5 * 1.006) / 11025;

        let wave = 0;
        if (t < 0.3) {
          wave = Math.sin(p1) * n1 * 0.6;
        } else if (t < 0.6) {
          wave = Math.sin(p2) * n2 * 0.6;
        } else {
          // Beautiful chord with detuning
          const d_maj = 
            Math.sin(p1) * 0.35 +
            Math.sin(p2) * 0.3 +
            Math.sin(p3) * 0.25 +
            Math.sin(p4) * 0.15;
          
          const tremolo = 0.8 + 0.2 * Math.sin(2 * Math.PI * 6.5 * t);
          wave = d_maj * n3 * tremolo * 0.7;
        }
        return wave;
      }
    );
  }

  // 6. Dungeon Defeat - 2.0s, gloomy minor cluster sweep down with stateful phase
  {
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    create16BitMonoWav(
      path.join(SOUND_DIR, 'defeat.wav'),
      11025,
      2.0,
      (t) => {
        const env = (1.0 - t / 2.0);
        
        // Gloomy falling notes
        const f1 = 146.83 * Math.exp(-1.2 * t); // D3 falling
        const f2 = 174.61 * Math.exp(-1.1 * t); // F3 falling
        const f3 = 220.00 * Math.exp(-1.0 * t); // A3 falling
        const f4 = 293.66 * Math.exp(-0.9 * t); // D4 falling
        
        p1 += (2 * Math.PI * f1) / 11025;
        p2 += (2 * Math.PI * f2) / 11025;
        p3 += (2 * Math.PI * f3) / 11025;
        p4 += (2 * Math.PI * f4) / 11025;
        
        const w1 = Math.sin(p1) * 0.35;
        const w2 = Math.sin(p2) * 0.3;
        const w3 = Math.sin(p3) * 0.25;
        const w4 = Math.sin(p4) * 0.15;
        
        // Soft sad swell vibrato
        const vibrato = 0.85 + 0.15 * Math.sin(2 * Math.PI * 6.5 * t);
        
        return (w1 + w2 + w3 + w4) * env * vibrato * 0.6;
      }
    );
  }

  // 7. Loop-able Cyber Ambient BGM - 8.0 seconds at 22050Hz
  {
    let pBass = 0;
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    create16BitMonoWav(
      path.join(SOUND_DIR, 'bgm.wav'),
      22050,
      8.0,
      (t) => {
        let chord_idx = Math.floor(t / 2.0);
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

        pBass += (2 * Math.PI * (freqs[0] / 2.0)) / 22050;
        p1 += (2 * Math.PI * freqs[0]) / 22050;
        p2 += (2 * Math.PI * freqs[1]) / 22050;
        p3 += (2 * Math.PI * freqs[2]) / 22050;
        p4 += (2 * Math.PI * (freqs[3] * 1.003)) / 22050;

        let waveSum = 0;
        // Deep warm sub-bass
        waveSum += Math.sin(pBass) * 0.45;
        
        // Clean chord core voices
        waveSum += Math.sin(p1) * 0.25;
        waveSum += Math.sin(p2) * 0.25;
        waveSum += Math.sin(p3) * 0.25;
        
        // High melody ambient pulse
        const pulseT = Math.sin(2 * Math.PI * 0.25 * t);
        waveSum += Math.sin(p4) * 0.08 * (0.6 + 0.4 * pulseT);

        // LFO Sweep filter simulation
        const lfo = 0.55 + 0.4 * Math.sin(2 * Math.PI * 0.125 * t);
        
        // Subtle wave chorus detuning
        waveSum += Math.sin(p1 * 1.008) * 0.15;
        
        // Boundary loop-fade
        let loopFade = 1.0;
        if (t < 0.4) {
          loopFade = t / 0.4;
        } else if (t > 7.6) {
          loopFade = (8.0 - t) / 0.4;
        }

        return waveSum * lfo * loopFade * 0.35;
      }
    );
  }

  console.log('Audio asset synthesis successfully finalized!');
}

run();
