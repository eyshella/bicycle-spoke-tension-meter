"use client"
import {memo, useCallback, useEffect, useRef} from "react";
import {sortBy, round} from "lodash";

type Props = {
    spokeLength_MM: number
    onSpokeLength_MM_Change: (value: number) => void
    spokeDensity_KG_M3: number
    onSpokeDensity_KG_M3_Change: (value: number) => void
    lowerTensionBound_KGF: number,
    onLowerTensionBound_KGF_Change: (value: number) => void
    upperTensionBound_KGF: number,
    onUpperTensionBound_KGF_Change: (value: number) => void
    averagingPeriod_MS: number
    onAveragingPeriod_MS_Change: (value: number) => void
    spectre_HZ_DB: Array<[number, number]>
    frequency_HZ: number
    tension_KGS: number
    tension_N: number
    lowerFrequencyBound_HZ: number,
    upperFrequencyBound_HZ: number,
    started: boolean
    onStart: () => void
    onStop: () => void
}

export const HomePageView = memo((props: Props) => {
    const {
        spokeLength_MM,
        onSpokeLength_MM_Change,
        spokeDensity_KG_M3,
        onSpokeDensity_KG_M3_Change,
        lowerTensionBound_KGF,
        onLowerTensionBound_KGF_Change,
        upperTensionBound_KGF,
        onUpperTensionBound_KGF_Change,
        averagingPeriod_MS,
        onAveragingPeriod_MS_Change,
        spectre_HZ_DB,
        frequency_HZ,
        tension_KGS,
        tension_N,
        lowerFrequencyBound_HZ,
        upperFrequencyBound_HZ,
        started,
        onStart,
        onStop
    } = props

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawSpectre = useCallback(() => {
        const sortedSpectre = sortBy(spectre_HZ_DB, it => it[0])
        const canvas = canvasRef.current

        if (!canvas) {
            return
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return
        }


        const barOffset = 1
        const cw = canvas.width;
        const ch = canvas.height;

        const barWidth = (cw / sortedSpectre.length - barOffset);
        const minDb = -150

        ctx.clearRect(0, 0, cw, ch)
        for (let i = 0; i < sortedSpectre.length; i++) {
            const [, db] = sortedSpectre[i]
            const barHeight = ch * (1 - db / minDb)
            const x = i * (barWidth + barOffset)
            const y = ch - barHeight
            ctx.fillStyle = "rgb(34 197 94)";
            ctx.fillRect(x, y, barWidth, barHeight);
        }

    }, [spectre_HZ_DB]);

    useEffect(() => {
        drawSpectre()
    }, [spectre_HZ_DB, drawSpectre]);

    return (
        <main className={"flex flex-col items-center justify-start size-full bg-blue-950 text-white p-4"}>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Tension = {round(tension_KGS, 2)} N = {round(tension_N, 2)} KGF
                </div>
                <div className={"font-sans text-white text-base"}>
                    Frequency = {round(frequency_HZ, 2)} HZ
                </div>
                <div className={"font-sans text-white text-base"}>
                    Frequency Bound = [{round(lowerFrequencyBound_HZ, 2)}, {round(upperFrequencyBound_HZ, 2)}]
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
                       type={"number"} value={spokeLength_MM}
                       disabled={started}
                       onChange={it => onSpokeLength_MM_Change(+it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Specific spoke density (kg/m)
                </div>
                <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}
                       type={"number"} value={spokeDensity_KG_M3}
                       disabled={started}
                       onChange={it => onSpokeDensity_KG_M3_Change(+it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Lower tension bound (kgf)
                </div>
                <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}
                       type={"number"} value={lowerTensionBound_KGF}
                       disabled={started}
                       onChange={it => onLowerTensionBound_KGF_Change(+it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Upper tension bound (kgf)
                </div>
                <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}
                       type={"number"} value={upperTensionBound_KGF}
                       disabled={started}
                       onChange={it => onUpperTensionBound_KGF_Change(+it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div className={"font-sans text-white text-base"}>
                    Averaging period (ms)
                </div>
                <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}
                       type={"number"} value={averagingPeriod_MS}
                       disabled={started}
                       onChange={it => onAveragingPeriod_MS_Change(+it.target.value)}/>
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
                {started && (
                    <button
                        className={"border-2 border-solid border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 active:border-red-700 active:text-red-700 p-2 cursor-pointer rounded"}
                        disabled={!started}
                        onClick={onStop}
                    >
                        Stop
                    </button>
                )}

                {!started && (
                    <button
                        className={"border-2 border-solid border-green-500 text-green-500 hover:border-green-600 hover:text-green-600 active:border-green-700 active:text-green-700 p-2 cursor-pointer rounded"}
                        disabled={started}
                        onClick={onStart}
                    >
                        Start
                    </button>
                )}
            </div>
        </main>
    );
})
