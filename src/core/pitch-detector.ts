import EventEmitter from "events";

const SAMPLE_RATE = 48000
const FFT_SIZE = 32768

export type PitchDetectedEvent = {
    frequency: number;
    db: number
}
export type PitchDetectionErrorEvent = {
    error: Error;
}
export type PitchDetectorEventName = 'pitch' | 'error'
export type PitchDetectorEventsMap = {
    pitch: PitchDetectedEvent,
    error: PitchDetectionErrorEvent
}
type EventMap = Record<PitchDetectorEventName, any>;
type PitchDetectorState = {
    audioContext: AudioContext
    mediaStreamSource: MediaStreamAudioSourceNode
    analyser: AnalyserNode
    buffer: Float32Array
    bufferLength: number
    animationFrameRequestId?: number
}

export class PitchDetector {
    private state: PitchDetectorState | undefined
    private eventEmitter = new EventEmitter<any>()

    public get started(): boolean{
        return !!this.state
    }

    public async start(): Promise<void> {
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
                bufferLength
            }
            this.updatePitchLoop();
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

    public addListener<T extends PitchDetectorEventName>(event: T, listener: (event: PitchDetectorEventsMap[T]) => void): void {
        this.eventEmitter.addListener(event, listener)
    }

    public removeListener<T extends PitchDetectorEventName>(event: T, listener: (event: PitchDetectorEventsMap[T]) => void): void {
        this.eventEmitter.removeListener(event, listener)
    }

    private updatePitchLoop() {
        try {
            if (!this.state) {
                return
            }

            this.state.analyser.getFloatFrequencyData(this.state.buffer);
            let frequencyIndex = -1
            let maxDb = -Infinity
            this.state.buffer.forEach((db, index) => {
                if(db > maxDb){
                    maxDb = db
                    frequencyIndex = index
                }
            })

            const frequency = frequencyIndex*SAMPLE_RATE/(2* this.state.analyser.frequencyBinCount)
            if (frequencyIndex !== -1) {
                this.eventEmitter.emit('pitch', {frequency, db: maxDb})
            }

            this.state.animationFrameRequestId = requestAnimationFrame(this.updatePitchLoop.bind(this));
        } catch (e) {
            this.eventEmitter.emit('error', {error: e});
        }
    }
}
