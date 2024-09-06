"use client"
import {memo, useEffect, useMemo, useRef} from "react";
import {ceil, floor, forOwn, groupBy, mean, round} from "lodash";
import Chart from 'chart.js/auto';
import Button from '@mui/material/Button';
import {blueGrey, deepOrange, green, grey, lightGreen, teal} from "@mui/material/colors";
import {Card, CardContent, CardHeader, createTheme, TextField, ThemeProvider, Typography} from "@mui/material";

const MIN_DB = -150
const CHART_X_TICKS_AMOUNT = 10

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
    spectre_KGF_DB: Array<[number, number]>
    amplitudeDeviation: number
    frequency_HZ: number
    tension_KGF: number
    lowerFrequencyBound_HZ: number,
    upperFrequencyBound_HZ: number,
    started: boolean
    onStart: () => void
    onStop: () => void
    amplitudeDeviationReliable: boolean
}

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: grey,
        error: deepOrange,
        background: {
            paper: blueGrey[900],
        }
    }
})

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
        spectre_KGF_DB,
        tension_KGF,
        started,
        onStart,
        onStop,
        amplitudeDeviationReliable
    } = props

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chart = useRef<Chart>();

    useEffect(() => {
        chart.current = new Chart(
            canvasRef.current!,
            {
                type: "bar",
                data: {
                    datasets: []
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                        colors: {
                            enabled: true
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            min: 0,
                            max: -MIN_DB,
                            display: false,
                            grid: {
                                display: false
                            },
                        },
                        x: {
                            type: 'linear',
                            min: lowerTensionBound_KGF,
                            max: upperTensionBound_KGF,
                            display: true,
                            grid: {
                                display: false
                            },
                            ticks: {
                                stepSize: round((upperTensionBound_KGF - lowerTensionBound_KGF) / CHART_X_TICKS_AMOUNT)
                            }
                        }
                    },
                }
            }
        )

        return () => {
            chart.current?.destroy()
        }
    }, [lowerTensionBound_KGF, upperTensionBound_KGF])

    const bars = useMemo(() => {
        const result: Array<[number, number]> = []

        const grouped = groupBy(spectre_KGF_DB, ([tension]) => round(tension))
        forOwn(grouped, (group, tension) => {
            const amplitudes = group.map(([, amplitude]) => amplitude)
            result.push([+tension, mean(amplitudes)])
        })

        return result
    }, [spectre_KGF_DB])

    const barColors = useMemo(
        () => bars.map(([tension]) => amplitudeDeviationReliable
            ? ceil(tension) === ceil(tension_KGF) || floor(tension) === floor(tension_KGF)
                ? green['400']
                : blueGrey[200]
            : blueGrey[200]
        ),
        [bars, tension_KGF, amplitudeDeviationReliable]
    )

    useEffect(() => {
        if (!chart.current) {
            return
        }

        chart.current.data = {
            labels: bars.map(([frequency]) => frequency),
            datasets: [
                {
                    data: bars.map(([, amplitude]) => amplitude - MIN_DB),
                    backgroundColor: barColors,
                    barThickness: 'flex'
                },
            ]
        }
        chart.current.update('none')
    }, [bars, barColors]);

    return (
        <ThemeProvider theme={darkTheme}>
            <main className={"flex flex-col items-center justify-start w-full p-4"}>
                <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-6"}>
                    <TextField
                        label="Spoke length (mm)"
                        variant="outlined"
                        color={"primary"}
                        value={spokeLength_MM}
                        onChange={it => onSpokeLength_MM_Change(+it.target.value)}
                        disabled={started}
                    />
                </div>
                <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-6"}>
                    <TextField
                        label="Specific spoke density (kg/m)"
                        variant="outlined"
                        color={"primary"}
                        value={spokeDensity_KG_M3}
                        onChange={it => onSpokeDensity_KG_M3_Change(+it.target.value)}
                        disabled={started}
                    />
                </div>
                {/*<div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-6"}>*/}
                {/*    <div className={"font-sans text-white text-base"}>*/}
                {/*        Lower tension bound (kgf)*/}
                {/*    </div>*/}
                {/*    <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}*/}
                {/*           type={"number"} value={lowerTensionBound_KGF}*/}
                {/*           disabled={started}*/}
                {/*           onChange={it => onLowerTensionBound_KGF_Change(+it.target.value)}/>*/}
                {/*</div>*/}
                {/*<div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-6"}>*/}
                {/*    <div className={"font-sans text-white text-base"}>*/}
                {/*        Upper tension bound (kgf)*/}
                {/*    </div>*/}
                {/*    <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}*/}
                {/*           type={"number"} value={upperTensionBound_KGF}*/}
                {/*           disabled={started}*/}
                {/*           onChange={it => onUpperTensionBound_KGF_Change(+it.target.value)}/>*/}
                {/*</div>*/}
                {/*<div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-6"}>*/}
                {/*    <div className={"font-sans text-white text-base"}>*/}
                {/*        Averaging period (ms)*/}
                {/*    </div>*/}
                {/*    <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}*/}
                {/*           type={"number"} value={averagingPeriod_MS}*/}
                {/*           disabled={started}*/}
                {/*           onChange={it => onAveragingPeriod_MS_Change(+it.target.value)}/>*/}
                {/*</div>*/}

                {/*<div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-6"}>*/}
                {/*    <div className={"font-sans text-white text-base"}>*/}
                {/*        DB bound*/}
                {/*    </div>*/}
                {/*    <input className={"font-sans text-white text-base border-white border-2 border-solid p-2 rounded"}*/}
                {/*           type={"number"} value={dbBoundString}*/}
                {/*           disabled={started}*/}
                {/*           onChange={it => setDbBoundString(it.target.value)}/>*/}
                {/*</div>*/}
                <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-6"}>
                    <Card variant={'elevation'}>
                        <CardHeader
                            title={"Tension (kgf)"}
                            titleTypographyProps={{
                                variant: 'caption',
                            }}
                        />
                        <CardContent>
                            <div
                                className={"flex flex-col items-center justify-center w-96 max-w-full mb-6 border-border-grey-500"}>
                                <canvas className={"size-full"} ref={canvasRef}/>
                            </div>
                            <Typography textAlign={'center'} variant={'h5'} color={amplitudeDeviationReliable ? 'success' : 'primary'}>
                                {round(tension_KGF, 2)}
                            </Typography>
                        </CardContent>
                    </Card>
                    {/*<TextField*/}
                    {/*    label="Tension (kgf)"*/}
                    {/*    variant="outlined"*/}
                    {/*    color={amplitudeDeviationReliable ? 'success' : 'primary'}*/}
                    {/*    value={round(tension_KGF, 2)}*/}
                    {/*    disabled={!started}*/}
                    {/*    focused*/}
                    {/*/>*/}
                    {/*<div className={"font-sans text-white text-2xl"}>*/}
                    {/*    Deviation = {round(amplitudeDeviation, 2)}*/}
                    {/*</div>*/}
                    {/*<div className={"font-sans text-white text-base"}>*/}
                    {/*    Frequency = {round(frequency_HZ, 2)} HZ*/}
                    {/*</div>*/}
                    {/*<div className={"font-sans text-white text-base"}>*/}
                    {/*    Frequency Bound = [{round(lowerFrequencyBound_HZ, 2)}, {round(upperFrequencyBound_HZ, 2)}]*/}
                    {/*    HZ*/}
                    {/*</div>*/}
                </div>
                <div className={"flex flex-row items-center justify-start gap-4"}>
                    <Button onClick={started ? onStop : onStart} variant={"contained"}
                            color={started ? "error" : "success"}>
                        {started ? "Stop" : "Start"}
                    </Button>
                </div>
            </main>
        </ThemeProvider>
    );
})
