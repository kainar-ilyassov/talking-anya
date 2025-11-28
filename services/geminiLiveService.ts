import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';

export type OnStatusCallback = (isConnected: boolean, error?: string) => void;
export type OnVolumeCallback = (userVolume: number, modelVolume: number) => void;

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private stream: MediaStream | null = null;
  private processor: AudioWorkletNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private session: any = null;
  private volumeInterval: number | null = null;
  private currentInputVolume = 0;
  
  // Callbacks
  public onStatus: OnStatusCallback = () => {};
  public onVolume: OnVolumeCallback = () => {};

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect() {
    try {
      this.onStatus(false);

      // Initialize Audio Contexts
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Setup Output Analyser for Avatar
      this.outputAnalyser = this.outputAudioContext.createAnalyser();
      this.outputAnalyser.fftSize = 256;
      this.outputAnalyser.smoothingTimeConstant = 0.1;
      this.outputAnalyser.connect(this.outputAudioContext.destination);

      // Get Microphone Access
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start volume polling loop
      this.startVolumePolling();

      const sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Session Opened');
            this.onStatus(true);
            this.startAudioInput(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            await this.handleServerMessage(message);
          },
          onerror: (e: ErrorEvent) => {
            console.error('Gemini Live Error', e);
            this.onStatus(false, "Connection error occurred.");
            this.disconnect();
          },
          onclose: (e: CloseEvent) => {
            console.log('Gemini Live Session Closed', e);
            this.onStatus(false);
            this.disconnect();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are a friendly, patient, and highly skilled Russian language tutor named "Anya". 
          Your goal is to help the user practice speaking Russian. 
          1. Speak naturally in Russian. 
          2. If the user speaks English, translate what they said into Russian and encourage them to repeat it.
          3. If the user makes a grammar or pronunciation mistake, gently correct them in Russian, then repeat the corrected phrase clearly.
          4. Keep the conversation engaging by asking simple questions suitable for a learner.
          5. Be supportive and encouraging.
          `,
        },
      });

      this.session = sessionPromise;
      
    } catch (error: any) {
      console.error("Failed to connect:", error);
      this.onStatus(false, error.message || "Failed to connect to microphone or API.");
    }
  }

  private startVolumePolling() {
    if (this.volumeInterval) clearInterval(this.volumeInterval);
    
    this.volumeInterval = window.setInterval(() => {
      let outputVol = 0;
      if (this.outputAnalyser) {
        const dataArray = new Uint8Array(this.outputAnalyser.frequencyBinCount);
        this.outputAnalyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        outputVol = sum / dataArray.length / 255; 
      }
      this.onVolume(this.currentInputVolume, outputVol);
    }, 50); // 20fps updates
  }

  private async startAudioInput(sessionPromise: Promise<any>) {
    if (!this.inputAudioContext || !this.stream) return;

    try {
      // Load AudioWorklet module
      await this.inputAudioContext.audioWorklet.addModule(
        new URL('../utils/audioProcessor.worklet.ts', import.meta.url).href
      );

      this.sourceNode = this.inputAudioContext.createMediaStreamSource(this.stream);
      this.processor = new AudioWorkletNode(this.inputAudioContext, 'audio-capture-processor');

      // Handle messages from AudioWorklet
      this.processor.port.onmessage = (event) => {
        const { audioData, volume } = event.data;
        
        // Update current input volume
        this.currentInputVolume = volume;

        const pcmBlob = createBlob(audioData);
        
        sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        }).catch(err => {
          console.error("Error sending audio input:", err);
        });
      };

      this.sourceNode.connect(this.processor);
      this.processor.connect(this.inputAudioContext.destination);
    } catch (error) {
      console.error("Error setting up AudioWorklet:", error);
    }
  }

  private async handleServerMessage(message: LiveServerMessage) {
    // Handle Audio Output
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext) {
      const outputNode = this.outputAudioContext.createGain();
      outputNode.gain.value = 1.0;

      this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);

      try {
        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          this.outputAudioContext,
          24000,
          1
        );
        
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Connect to Gain -> Analyser (which goes to Destination)
        source.connect(outputNode);
        if (this.outputAnalyser) {
            outputNode.connect(this.outputAnalyser);
        } else {
            outputNode.connect(this.outputAudioContext.destination);
        }

        source.addEventListener('ended', () => {
          this.sources.delete(source);
        });

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.sources.add(source);
      } catch (err) {
        console.error("Error decoding audio:", err);
      }
    }

    if (message.serverContent?.interrupted) {
      this.sources.forEach(source => {
        try { source.stop(); } catch (e) {}
      });
      this.sources.clear();
      this.nextStartTime = 0;
    }
  }

  disconnect() {
    if (this.volumeInterval) {
        clearInterval(this.volumeInterval);
        this.volumeInterval = null;
    }

    if (this.session) {
        this.session.then((s: any) => {
            try { s.close(); } catch(e) { console.warn("Session close error", e); }
        }).catch(() => {});
    }

    if (this.processor) {
      this.processor.port.onmessage = null;
      this.processor.disconnect();
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
    }
    
    this.sources.clear();
    this.session = null;
    this.stream = null;
    this.processor = null;
    this.sourceNode = null;
    this.inputAudioContext = null;
    this.outputAudioContext = null;
    this.outputAnalyser = null;
    this.nextStartTime = 0;
    this.currentInputVolume = 0;
  }
}