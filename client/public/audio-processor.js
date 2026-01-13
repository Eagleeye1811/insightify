class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 2048;
        this._buffer = new Float32Array(this.bufferSize);
        this._bytesWritten = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        if (!input || input.length === 0) return true;

        const channelData = input[0];

        // Downsample and convert to 16-bit PCM (simplified)
        // For now we assume the context will handle sample rate, but we can just send float32 and convert on backend 
        // OR we convert to PCM16 here. Gemini often likes PCM16 16kHz.
        // Let's just send the raw float32 for now to keep it simple, or convert to int16.
        // Converting to Int16 is safer for bandwidth and standard PCM expectations.

        const pcmData = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
            // Clamp and scale
            const s = Math.max(-1, Math.min(1, channelData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        this.port.postMessage(pcmData.buffer, [pcmData.buffer]);

        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor);
