"use client"
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {PitchDetector} from "@/core/pitch-detector";
import {SpokeTension} from "@/core/spoke-tension";

const roundTo2Decimals = (value: number) => Math.round(value * 100) / 100

export default function Home() {
    const pitchDetectorRef = useRef(new PitchDetector())
    const [started, setStarted] = useState(false);
    const [spokeLengthString, setSpokeLengthString] = useState('298');
    const [spokeDensityString, setSpokeDensityString] = useState('0.048');
    const [lowerTensionBoundString, setLowerTensionBoundString] = useState('50');
    const [upperTensionBoundString, setUpperTensionBoundString] = useState('150');

    const maxDbRef = useRef(-Infinity)
    const [frequency, setFrequency] = useState(0);
    const [db, setDB] = useState(0);

    const spokeDensity = useMemo(() => +spokeDensityString, [spokeDensityString])
    const spokeLength = useMemo(() => +spokeLengthString / 1000, [spokeLengthString])
    const spokeMass = useMemo(() => spokeLength * spokeDensity, [spokeLength, spokeDensity])
    const lowerTensionBound = useMemo(() => +lowerTensionBoundString, [lowerTensionBoundString])
    const upperTensionBound = useMemo(() => +upperTensionBoundString, [upperTensionBoundString])
    const lowerFrequencyBound = useMemo(() => SpokeTension.fromKGS(lowerTensionBound).toFrequency(spokeMass, spokeLength), [lowerTensionBound, spokeMass, spokeLength])
    const upperFrequencyBound = useMemo(() => SpokeTension.fromKGS(upperTensionBound).toFrequency(spokeMass, spokeLength), [upperTensionBound, spokeMass, spokeLength])

    const tension = useMemo(() => {
        return SpokeTension.fromFrequency(frequency, spokeMass, spokeLength)
    }, [frequency, spokeLength, spokeMass])

    const startCallback = useCallback(async () => {
        setFrequency(0)
        setDB(0)
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

    useEffect(() => {
        pitchDetectorRef.current.addListener('pitch', ({frequency, db}) => {
            if (maxDbRef.current <= db) {
                maxDbRef.current = db
                setDB(db)
                setFrequency(Math.round(frequency))
            }
        })
    }, []);

    return (
        <main className={"flex flex-col items-center justify-start size-full bg-blue-950 text-white p-4"}>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-center text-white text-base"}>
                    Tension = {roundTo2Decimals(tension.newton)} N = {roundTo2Decimals(tension.kgf)} KGF
                </div>
                <div className={"font-sans text-center text-white text-base"}>
                    Frequency = {frequency} HZ
                </div>
                <div className={"font-sans text-center text-white text-base"}>
                    DB = {roundTo2Decimals(db)}
                </div>
                <div className={"font-sans text-center text-white text-base"}>
                    Frequency bound = [{roundTo2Decimals(lowerFrequencyBound)}, {roundTo2Decimals(upperFrequencyBound)}] KGF
                </div>
            </div>


            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Spoke length (mm)
                </div>
                <input className={"font-sans text-white text-base border-white border-1 border-solid p-2 rounded"}
                       type={"number"} value={spokeLengthString}
                       disabled={started}
                       onChange={it => setSpokeLengthString(it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Specific spoke density (kg/m)
                </div>
                <input className={"font-sans text-white text-base border-white border-1 border-solid p-2 rounded"}
                       type={"number"} value={spokeDensityString}
                       disabled={started}
                       onChange={it => setSpokeDensityString(it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Lower tension bound (kgf)
                </div>
                <input className={"font-sans text-white text-base border-white border-1 border-solid p-2 rounded"}
                       type={"number"} value={lowerTensionBoundString}
                       disabled={started}
                       onChange={it => setLowerTensionBoundString(it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Upper tension bound (kgf)
                </div>
                <input className={"font-sans text-white text-base border-white border-1 border-solid p-2 rounded"}
                       type={"number"} value={upperTensionBoundString}
                       disabled={started}
                       onChange={it => setUpperTensionBoundString(it.target.value)}/>
            </div>
            <div className={"flex flex-row items-center justify-start gap-4"}>
                {started && <button
                    onClick={stopCallback}
                    className={"border-1 border-solid border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 active:border-red-700 active:text-red-700 p-2 cursor-pointer rounded"}>
                    Stop
                </button>}

                {!started && <button
                    disabled={started}
                    onClick={startCallback}
                    className={"border-1 border-solid border-green-500 text-green-500 hover:border-green-600 hover:text-green-600 active:border-green-700 active:text-green-700 p-2 cursor-pointer rounded"}>Start
                </button>}
            </div>
        </main>
    );
}
