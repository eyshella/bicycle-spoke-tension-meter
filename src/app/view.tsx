"use client"
import {memo, useEffect, useMemo, useRef} from "react";
import {ceil, floor, forOwn, groupBy, mean, round} from "lodash";
import Chart from 'chart.js/auto';
import Button from '@mui/material/Button';
import {blueGrey, deepOrange, green, grey} from "@mui/material/colors";
import {
    Card,
    CardContent,
    CardHeader,
    createTheme,
    TextField,
    ThemeProvider, ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import {SpokeMaterial} from "@/app/types";
import InfoIcon from '@mui/icons-material/InfoOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import {InfoDialog} from "@/components/info-dialog";

const CHART_Y_MIN = -150
const CHART_X_TICKS_AMOUNT = 10

type Props = {
    spokeLength_MM: number
    onSpokeLength_MM_Change: (value: number) => void
    specificSpokeDensity_KG_M: number
    onSpecificSpokeDensity_KG_M_Change: (value: number) => void
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
    spokeMaterial: SpokeMaterial
    onSpokeMaterialChange: (value: SpokeMaterial) => void
    spokeDiameter_MM: number
    onSpokeDiameter_MM_Change: (value: number) => void
    infoDialogOpened: boolean
    onOpenInfoDialog: () => void
    onCloseInfoDialog: () => void
    githubUrl: string,
    licenseUrl: string
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
        specificSpokeDensity_KG_M,
        onSpecificSpokeDensity_KG_M_Change,
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
        amplitudeDeviationReliable,
        spokeMaterial,
        onSpokeMaterialChange,
        spokeDiameter_MM,
        onSpokeDiameter_MM_Change,
        infoDialogOpened,
        onOpenInfoDialog,
        onCloseInfoDialog,
        amplitudeDeviation,
        lowerFrequencyBound_HZ,
        upperFrequencyBound_HZ,
        githubUrl,
        licenseUrl
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
                            max: -CHART_Y_MIN,
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
                    data: bars.map(([, amplitude]) => amplitude - CHART_Y_MIN),
                    backgroundColor: barColors,
                    barThickness: 'flex'
                },
            ]
        }
        chart.current.update('none')
    }, [bars, barColors]);

    return (
        <ThemeProvider theme={darkTheme}>
            <InfoDialog
                open={infoDialogOpened}
                onClose={onCloseInfoDialog}
                githubUrl={githubUrl}
                licenseUrl={licenseUrl}
            />
            <main className={"flex flex-col items-center justify-start w-full p-4"}>
                <div className={"flex flex-row items-center justify-between w-96 max-w-full mb-6 gap-4"}>
                    <Typography
                        textAlign={'center'}
                        variant={'h6'}
                        color={'primary'}
                    >
                        Bicycle Spoke Tension Meter
                    </Typography>
                    <Button onClick={onOpenInfoDialog} variant={"text"} color={"primary"} disabled={infoDialogOpened}>
                        <InfoIcon/>
                    </Button>
                </div>
                <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-6"}>
                    <TextField
                        label="Spoke length from nipple to cross with other spoke (mm)"
                        variant="outlined"
                        color={"primary"}
                        value={spokeLength_MM}
                        onChange={it => onSpokeLength_MM_Change(+it.target.value)}
                        disabled={started}
                    />
                </div>
                <div className={"flex flex-row items-center justify-between w-96 max-w-full mb-6"}>
                    <ToggleButtonGroup
                        color="primary"
                        exclusive
                        disabled={started}
                        size={"small"}
                        aria-label="Material"
                        value={spokeMaterial}
                        onChange={(_, it) => onSpokeMaterialChange(it)}
                    >
                        <ToggleButton value="steel">Steel</ToggleButton>
                        <ToggleButton value="aluminium">Aluminium</ToggleButton>
                        <ToggleButton value="other">Other</ToggleButton>
                    </ToggleButtonGroup>
                    {/*<ToggleButton value={""} ><SettingsIcon /></ToggleButton>*/}

                    <Button
                        onClick={onOpenInfoDialog}
                        variant={"outlined"}
                        size={"medium"}
                        color={"primary"}
                        disabled={infoDialogOpened}
                    >
                        <SettingsIcon/>
                    </Button>
                </div>
                {
                    spokeMaterial !== 'other' &&
                    <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-6"}>
                        <TextField
                            label="Spoke diameter (mm)"
                            variant="outlined"
                            color={"primary"}
                            value={spokeDiameter_MM}
                            onChange={it => onSpokeDiameter_MM_Change(+it.target.value)}
                            disabled={started}
                        />
                    </div>
                }
                {
                    spokeMaterial === 'other' &&
                    <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-6"}>
                        <TextField
                            label="Specific spoke density (kg/m)"
                            variant="outlined"
                            color={"primary"}
                            value={specificSpokeDensity_KG_M}
                            onChange={it => onSpecificSpokeDensity_KG_M_Change(+it.target.value)}
                            disabled={started}
                        />
                    </div>
                }
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
                            <Typography textAlign={'center'} variant={'h5'}
                                        color={amplitudeDeviationReliable ? 'success' : 'primary'}>
                                {round(tension_KGF, 2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </div>
                <div className={"flex flex-row items-center justify-start mb-6"}>
                    <Button
                        onClick={started ? onStop : onStart}
                        variant={"outlined"}
                        color={started ? "error" : "success"}
                    >
                        {started ? "Stop" : "Start"}
                    </Button>
                </div>
            </main>
        </ThemeProvider>
    );
})
