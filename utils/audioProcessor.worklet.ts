// AudioWorklet processor for capturing microphone input
declare const AudioWorkletProcessor: any;
declare function registerProcessor(name: string, processorCtor: any): void;

class AudioCaptureProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: any) {
    const input = inputs[0];
    
    if (input && input.length > 0) {
      const inputData = input[0]; // First channel
      
      // Calculate volume (RMS)
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const volume = Math.sqrt(sum / inputData.length);
      
      // Send audio data and volume to main thread
      this.port.postMessage({
        audioData: inputData,
        volume: volume
      });
    }
    
    return true; // Keep processor alive
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
