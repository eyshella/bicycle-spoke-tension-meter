"use client"
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {PitchDetector} from "@/core/pitch-detector";

const G = 9.807

export default function Home() {
    const pitchDetectorRef = useRef(new PitchDetector())
    const [started, setStarted] = useState(false);
    const [spokeLengthString, setSpokeLengthString] = useState('');
    const [spokeDensityString, setSpokeDensityString] = useState('');
    const maxDbRef = useRef(-Infinity)
    const [frequency, setFrequency] = useState(0);

    const spokeDensity = +spokeDensityString
    const spokeLength = +spokeLengthString
    const tension = spokeDensity*(2*frequency*spokeLength/1000)**2

    const startCallback = useCallback(async () => {
        setFrequency(0)
        maxDbRef.current = -Infinity
        if (pitchDetectorRef.current.started) {
            await pitchDetectorRef.current.stop()
        }

        await pitchDetectorRef.current.start()
        setStarted(true);
    }, [])

    const stopCallback = useCallback(async () => {
        await pitchDetectorRef.current.stop()
        setStarted(false);
    }, [])

    useEffect(() => {
        pitchDetectorRef.current.addListener('pitch', ({frequency, db}) => {
            if(maxDbRef.current<=db){
                maxDbRef.current = db
                setFrequency(Math.round(frequency))
            }
        })
    }, []);

    return (
        <main className={"flex flex-col items-center justify-start size-full bg-blue-950 text-white p-4"}>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-center text-white text-base"}>
                    Tension = {Math.round(tension * 100) / 100} N = {Math.round(tension/G * 100) / 100} KGF
                </div>
                <div className={"font-sans text-center text-white text-base"}>
                    Frequency = {frequency} HZ
                </div>
            </div>


            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Spoke length (mm)
                </div>
                <input className={"font-sans text-white text-base border-white border-1 border-solid p-2 rounded"}
                       type={"number"} value={spokeLengthString}
                       onChange={it => setSpokeLengthString(it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Specific spoke density (kg/m)
                </div>
                <input className={"font-sans text-white text-base border-white border-1 border-solid p-2 rounded"}
                       type={"number"} value={spokeDensityString}
                       onChange={it => setSpokeDensityString(it.target.value)}/>
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
