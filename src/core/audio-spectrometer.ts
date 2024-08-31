import EventEmitter from "events";

const SAMPLE_RATE = 8000
const FFT_SIZE = 8192

export type AudioSpectrometerStartOptions = {
    bounds?: [number, number]
}
export type SpectreReadyEvent = {
    spectre: Array<[number, number]>; //[frequency, amplitude]
    timestamp: number;
}
export type SpectreReadErrorEvent = {
    error: Error;
}
export type AudioSpectrometerEventName = 'spectre' | 'error'
export type AudioSpectrometerEventsMap = {
    spectre: SpectreReadyEvent,
    error: SpectreReadErrorEvent
}
type EventMap = Record<AudioSpectrometerEventName, any>;
type AudioSpectrometerState = {
    audioContext: AudioContext
    mediaStreamSource: MediaStreamAudioSourceNode
    analyser: AnalyserNode
    buffer: Float32Array
    bufferLength: number
    animationFrameRequestId?: number
    bounds?: [number, number]
}

export class AudioSpectrometer {
    private state: AudioSpectrometerState | undefined
    private eventEmitter = new EventEmitter<any>()

    public get started(): boolean {
        return !!this.state
    }

    public async start(options?: AudioSpectrometerStartOptions): Promise<void> {
        try {
            const audioContext = new AudioContext({sampleRate: SAMPLE_RATE});
            const stream = await navigator.mediaDevices.getUserMedia(
                {
                    "audio": {
                        "mandatory": {
                            "googEchoCancellation": "false",
                            "googAutoGainControl": "false",
                            "googNoiseSuppression": "false",
                            "googHighpassFilter": "false"
                        },
                        "optional": []
                    } as any,
                }
            )

            const mediaStreamSource = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();

            analyser.fftSize = FFT_SIZE;
            const bufferLength = analyser.frequencyBinCount
            mediaStreamSource.connect(analyser);
            this.state = {
                audioContext,
                analyser,
                mediaStreamSource,
                buffer: new Float32Array(bufferLength),
                bufferLength,
                bounds: options?.bounds
            }
            this.updateSpectreLoop(0);
        } catch (e) {
            this.eventEmitter.emit('error', {error: e});
        }
    }

    public async stop(): Promise<void> {
        try {
            if (!this.state) {
                return
            }

            if (this.state.animationFrameRequestId) {
                cancelAnimationFrame(this.state.animationFrameRequestId)
            }

            this.state.analyser.disconnect()
            this.state.mediaStreamSource.disconnect()
            await this.state.audioContext.close()

            this.state = undefined
        } catch (e) {
            this.eventEmitter.emit('error', {error: e});
        }
    }

    public addListener<T extends AudioSpectrometerEventName>(event: T, listener: (event: AudioSpectrometerEventsMap[T]) => void): void {
        this.eventEmitter.addListener(event, listener)
    }

    public removeListener<T extends AudioSpectrometerEventName>(event: T, listener: (event: AudioSpectrometerEventsMap[T]) => void): void {
        this.eventEmitter.removeListener(event, listener)
    }

    private updateSpectreLoop(timestamp: number) {
        try {
            if (!this.state) {
                return
            }

            this.state.analyser.getFloatFrequencyData(this.state.buffer);
            const spectre: Array<[number, number]> = []
            this.state.buffer.forEach((db, index) => {
                const frequencyBinCount = this.state?.analyser.frequencyBinCount ?? 0
                const [leftBound, rightBound] = this.state?.bounds ?? [0, Infinity]
                const frequency = index * SAMPLE_RATE / (2 * frequencyBinCount)
                if (frequency > rightBound || frequency < leftBound) {
                    return
                }

                spectre.push([frequency, db])
            })

            this.eventEmitter.emit('spectre', {spectre, timestamp})

            this.state.animationFrameRequestId = requestAnimationFrame(this.updateSpectreLoop.bind(this));
        } catch (e) {
            this.eventEmitter.emit('error', {error: e});
        }
    }
}
