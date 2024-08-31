"use client"
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {AudioSpectrometer} from "@/core/audio-spectrometer";
import {SpokeTension} from "@/core/spoke-tension";
import {maxBy, sortBy} from "lodash";
import {SignalAveraging} from "@/core/signal-averaging";

const DEFAULT_AVERAGING_PERIOD = 1000
const roundTo2Decimals = (value: number) => Math.round(value * 100) / 100

export default function Home() {
    const pitchDetectorRef = useRef(new AudioSpectrometer())
    const signalAveragingRef = useRef(new SignalAveraging(DEFAULT_AVERAGING_PERIOD))
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [started, setStarted] = useState(false);
    const [spokeLengthString, setSpokeLengthString] = useState('298');
    const [spokeDensityString, setSpokeDensityString] = useState('0.048');
    const [lowerTensionBoundString, setLowerTensionBoundString] = useState('50');
    const [upperTensionBoundString, setUpperTensionBoundString] = useState('150');
    const [averagingPeriod, setAveragingPeriod] = useState(`${DEFAULT_AVERAGING_PERIOD}`);

    const [spectre, setSpectre] = useState<Array<[number, number]>>([]);

    const frequency = useMemo(() => maxBy(spectre, it => it[1])?.[0] ?? 0, [spectre])
    const spokeDensity = useMemo(() => +spokeDensityString, [spokeDensityString])
    const spokeLength = useMemo(() => +spokeLengthString / 1000, [spokeLengthString])
    const spokeMass = useMemo(() => spokeLength * spokeDensity, [spokeLength, spokeDensity])
    const lowerTensionBound = useMemo(() => +lowerTensionBoundString, [lowerTensionBoundString])
    const upperTensionBound = useMemo(() => +upperTensionBoundString, [upperTensionBoundString])
    const lowerFrequencyBound = useMemo(() => SpokeTension.fromKGS(lowerTensionBound).toFrequency(spokeMass, spokeLength), [lowerTensionBound, spokeMass, spokeLength])
    const upperFrequencyBound = useMemo(() => SpokeTension.fromKGS(upperTensionBound).toFrequency(spokeMass, spokeLength), [upperTensionBound, spokeMass, spokeLength])

    const maxDbTension = useMemo(
        () => SpokeTension.fromFrequency(frequency, spokeMass, spokeLength),
        [frequency, spokeLength, spokeMass]
    )

    const startCallback = useCallback(async () => {
        setSpectre([])
        if (pitchDetectorRef.current.started) {
            await pitchDetectorRef.current.stop()
        }

        await pitchDetectorRef.current.start({
            bounds: [lowerFrequencyBound, upperFrequencyBound],
        })
        setStarted(true);
    }, [lowerFrequencyBound, upperFrequencyBound])

    const stopCallback = useCallback(async () => {
        await pitchDetectorRef.current.stop()
        setStarted(false);
    }, [])

    const drawSpectre = useCallback((spectre: Array<[number, number]>) => {
        const sortedSpectre = sortBy(spectre, it => it[0])
        const canvas = canvasRef.current

        if (!canvas) {
            return
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return
        }

        const cw = canvas.width;
        const ch = canvas.height;

        ctx.clearRect(0, 0, cw, ch)

        const barWidth = (cw / sortedSpectre.length);
        const minDb = -150

        for (let i = 0; i < sortedSpectre.length; i++) {
            const [frequency, db] = sortedSpectre[i]
            const barHeight = ch * (1 - db / minDb)
            const x = i * (barWidth + 1)
            const y = ch - barHeight
            ctx.fillStyle = "rgb(34 197 94)";
            ctx.fillRect(x, y, barWidth, barHeight);
            console.log('A!')
        }

    }, []);

    useEffect(() => {
        signalAveragingRef.current = new SignalAveraging(+averagingPeriod)
    }, [averagingPeriod]);

    useEffect(() => {
        pitchDetectorRef.current.addListener('spectre', ({spectre, timestamp}) => {
            signalAveragingRef.current.addInput(spectre, timestamp)
            const averaged = signalAveragingRef.current.output

            setSpectre(averaged)
            drawSpectre(averaged)
        })
    }, []);

    return (
        <main className={"flex flex-col items-center justify-start size-full bg-blue-950 text-white p-4"}>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Tension = {roundTo2Decimals(maxDbTension.newton)} N = {roundTo2Decimals(maxDbTension.kgf)} KGF
                </div>
                <div className={"font-sans text-white text-base"}>
                    Frequency = {roundTo2Decimals(frequency)} HZ
                </div>
                <div className={"font-sans text-white text-base"}>
                    Frequency Bound = [{roundTo2Decimals(lowerFrequencyBound)}, {roundTo2Decimals(upperFrequencyBound)}]
                    HZ
                </div>
            </div>

            <div className={"flex flex-col items-center justify-center w-96 h-96 mb-12"}>
                <canvas className={"size-full border-solid border-2 border-green-500"} ref={canvasRef}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Spoke length (mm)
                </div>
                <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}
                       type={"number"} value={spokeLengthString}
                       disabled={started}
                       onChange={it => setSpokeLengthString(it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Specific spoke density (kg/m)
                </div>
                <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}
                       type={"number"} value={spokeDensityString}
                       disabled={started}
                       onChange={it => setSpokeDensityString(it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Lower tension bound (kgf)
                </div>
                <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}
                       type={"number"} value={lowerTensionBoundString}
                       disabled={started}
                       onChange={it => setLowerTensionBoundString(it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Upper tension bound (kgf)
                </div>
                <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}
                       type={"number"} value={upperTensionBoundString}
                       disabled={started}
                       onChange={it => setUpperTensionBoundString(it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Averaging period (ms)
                </div>
                <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}
                       type={"number"} value={averagingPeriod}
                       disabled={started}
                       onChange={it => setAveragingPeriod(it.target.value)}/>
            </div>

            {/*<div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>*/}
            {/*    <div className={"font-sans text-white text-base"}>*/}
            {/*        DB bound*/}
            {/*    </div>*/}
            {/*    <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}*/}
            {/*           type={"number"} value={dbBoundString}*/}
            {/*           disabled={started}*/}
            {/*           onChange={it => setDbBoundString(it.target.value)}/>*/}
            {/*</div>*/}
            <div className={"flex flex-row items-center justify-start gap-4"}>
                {started && <button
                    onClick={stopCallback}
                    className={"border-2 border-solid border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 active:border-red-700 active:text-red-700 p-2 cursor-pointer rounded"}>
                    Stop
                </button>}

                {!started && <button
                    disabled={started}
                    onClick={startCallback}
                    className={"border-2 border-solid border-green-500 text-green-500 hover:border-green-600 hover:text-green-600 active:border-green-700 active:text-green-700 p-2 cursor-pointer rounded"}>Start
                </button>}
            </div>
        </main>
    );
}
