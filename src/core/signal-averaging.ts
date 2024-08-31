import {fill, last, sortBy} from "lodash";

type Sample = {
    signal: Array<[number, number]>
    timestamp: number
}

// It works only in case x coordinate of points doesn't change for simplicity
export class SignalAveraging {
    private readonly period: number
    private buffer: Array<Sample>
    private average: Array<[number, number]>

    public get output(): Array<[number, number]> {
        return [...this.average]
    }

    constructor(period: number) {
        this.period = period
        this.buffer = []
        this.average = []
    }

    addInput(signal: Array<[number, number]>, timestamp: number): void {
        this.buffer.push({
            signal,
            timestamp,
        })

        this.buffer = sortBy(this.buffer, 'timestamp')

        const lastSample: Sample | undefined = last(this.buffer)
        if (!lastSample) {
            return
        }
        const timestampBound = lastSample.timestamp - this.period

        this.buffer = this.buffer.filter(it => it.timestamp >= timestampBound)
        const average: Array<[number, number]> = []
        this.buffer.forEach((sample, sampleIndex) => {
            sample.signal.forEach(([x, y], index) => {
                if (sampleIndex === 0) {
                    average.push([x, y / this.buffer.length])
                } else {
                    const [avgX, avgY] = average[index]
                    average[index] = [avgX, avgY + y / this.buffer.length]
                }
            })
        })

        this.average = average
    }
}
