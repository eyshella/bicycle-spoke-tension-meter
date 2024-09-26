"use client"
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {AudioSpectrometer} from "@/core/audio-spectrometer";
import {SpokeTension} from "@/core/spoke-tension";
import {maxBy, mean, round} from "lodash";
import {SignalAveraging} from "@/core/signal-averaging";
import {HomePageView} from "@/app/view";
import {SpokeMaterial} from "@/app/types";

const DEFAULT_SPOKE_LENGTH_MM = 191
const DEFAULT_SPOKE_DENSITY_KG_M3 = 0.024
const DEFAULT_LOWER_TENSION_BOUND_KGF = 50
const DEFAULT_UPPER_TENSION_BOUND_KGF = 150
const DEFAULT_AVERAGING_PERIOD_MS = 1000
const DEFAULT_AMPLITUDE_DEVIATION_THRESHOLD = 3.5
const DEFAULT_SPOKE_MATERIAL: SpokeMaterial = 'steel'
const DEFAULT_SPOKE_DIAMETER_MM = 2

const DENSITIES_KG_M3: Omit<Record<SpokeMaterial, number>, 'other'> = {
    steel: 7800,
    aluminium: 2699,
}

const TENSION_METER_SETTINGS_STORAGE_KEY = 'tension_meter_settings'

export default function HomePage() {
    const pitchDetectorRef = useRef(new AudioSpectrometer())
    const signalAveragingRef = useRef(new SignalAveraging(DEFAULT_AVERAGING_PERIOD_MS))

    const [settingsLoaded, setSettingsLoaded] = useState(false)
    const [started, setStarted] = useState(false);
    const [spokeLength_MM, setSpokeLength_MM] = useState(DEFAULT_SPOKE_LENGTH_MM);
    const [specificSpokeDensity_KG_M, setSpecificSpokeDensity_KG_M] = useState(DEFAULT_SPOKE_DENSITY_KG_M3);
    const [lowerTensionBound_KGF, setLowerTensionBound_KGF] = useState(DEFAULT_LOWER_TENSION_BOUND_KGF);
    const [upperTensionBound_KGF, setUpperTensionBound_KGF] = useState(DEFAULT_UPPER_TENSION_BOUND_KGF);
    const [averagingPeriod_MS, setAveragingPeriod_MS] = useState(DEFAULT_AVERAGING_PERIOD_MS);
    const [spokeMaterial, setSpokeMaterial] = useState<SpokeMaterial>(DEFAULT_SPOKE_MATERIAL);
    const [spokeDiameter_MM, setSpokeDiameter_MM] = useState(DEFAULT_SPOKE_DIAMETER_MM);
    const [infoDialogOpened, setInfoDialogOpened] = useState(false);

    const [spectre_HZ_DB, setSpectre_HZ_DB] = useState<Array<[number, number]>>([]);

    const frequency_HZ = useMemo(() => maxBy(spectre_HZ_DB, it => it[1])?.[0] ?? 0, [spectre_HZ_DB])
    const amplitude_DB = useMemo(() => maxBy(spectre_HZ_DB, it => it[1])?.[1] ?? 0, [spectre_HZ_DB])

    const spokeLength_M = useMemo(() => spokeLength_MM / 1000, [spokeLength_MM])
    const spokeMass_KG = useMemo(() => spokeLength_M * specificSpokeDensity_KG_M, [spokeLength_M, specificSpokeDensity_KG_M])
    const lowerFrequencyBound_HZ = useMemo(
        () => SpokeTension.fromKGS(lowerTensionBound_KGF).toFrequency(spokeMass_KG, spokeLength_M),
        [lowerTensionBound_KGF, spokeMass_KG, spokeLength_M]
    )
    const upperFrequencyBound_HZ = useMemo(
        () => SpokeTension.fromKGS(upperTensionBound_KGF).toFrequency(spokeMass_KG, spokeLength_M),
        [upperTensionBound_KGF, spokeMass_KG, spokeLength_M]
    )

    const tension = useMemo(
        () => SpokeTension.fromFrequency(frequency_HZ, spokeMass_KG, spokeLength_M),
        [frequency_HZ, spokeLength_M, spokeMass_KG]
    )

    const spectre_KGF_DB: Array<[number, number]> = useMemo(
        () => spectre_HZ_DB.map(
            ([frequency, db]) => [SpokeTension.fromFrequency(frequency, spokeMass_KG, spokeLength_M).kgf, db]
        ),
        [spectre_HZ_DB, spokeMass_KG, spokeLength_M]
    )

    const amplitudeDeviation = useMemo(
        () => {
            if (spectre_HZ_DB.length === 0) {
                return 0
            }

            const spectreValues_DB = spectre_HZ_DB.map(it => it[1])
            const spectreMean_DB = mean(spectreValues_DB)
            const sd_2 = spectreValues_DB.reduce((acc, curr) => {
                return acc + ((curr - spectreMean_DB) ** 2) / spectreValues_DB.length
            }, 0)
            return sd_2 > 0 ? Math.abs(amplitude_DB - spectreMean_DB) / Math.sqrt(sd_2) : 0
        },
        [spectre_HZ_DB, amplitude_DB]
    )

    const amplitudeDeviationReliable = useMemo(() => amplitudeDeviation > DEFAULT_AMPLITUDE_DEVIATION_THRESHOLD, [amplitudeDeviation])

    const startCallback = useCallback(async () => {
        setSpectre_HZ_DB([])
        if (pitchDetectorRef.current.started) {
            await pitchDetectorRef.current.stop()
        }

        await pitchDetectorRef.current.start({
            bounds: [lowerFrequencyBound_HZ, upperFrequencyBound_HZ],
        })
        setStarted(true);
    }, [lowerFrequencyBound_HZ, upperFrequencyBound_HZ])

    const stopCallback = useCallback(async () => {
        setSpectre_HZ_DB([])
        await pitchDetectorRef.current.stop()
        setStarted(false);
    }, [])

    const onOpenInfoDialogCallback = useCallback(() => {
        setInfoDialogOpened(true)
    }, [])

    const onCloseInfoDialogCallback = useCallback(() => {
        setInfoDialogOpened(false)
    }, [])

    useEffect(() => {
        signalAveragingRef.current = new SignalAveraging(+averagingPeriod_MS)
    }, [averagingPeriod_MS]);

    useEffect(() => {
        pitchDetectorRef.current.addListener('spectre', ({spectre, timestamp}) => {
            signalAveragingRef.current.addInput(spectre, timestamp)
            const averaged = signalAveragingRef.current.output

            setSpectre_HZ_DB(averaged)
        })
    }, []);

    useEffect(() => {
        try {
            const settingsString = localStorage.getItem(TENSION_METER_SETTINGS_STORAGE_KEY)
            const settings = settingsString ? JSON.parse(settingsString) : null

            if (!settings) {
                return
            }

            setSpokeLength_MM(settings.spokeLength_MM ?? DEFAULT_SPOKE_LENGTH_MM)
            setSpecificSpokeDensity_KG_M(settings.spokeDensity_KG_M3 ?? DEFAULT_SPOKE_DENSITY_KG_M3)
            setLowerTensionBound_KGF(settings.lowerTensionBound_KGF ?? DEFAULT_LOWER_TENSION_BOUND_KGF)
            setUpperTensionBound_KGF(settings.upperTensionBound_KGF ?? DEFAULT_UPPER_TENSION_BOUND_KGF)
            setAveragingPeriod_MS(settings.averagingPeriod_MS ?? DEFAULT_AVERAGING_PERIOD_MS)
            setSpokeMaterial(settings.spokeMaterial ?? DEFAULT_SPOKE_MATERIAL)
        } catch (e) {
            console.log(`Local storage read error ${e}`)
        } finally {
            setSettingsLoaded(true)
        }
    }, []);

    useEffect(() => {
        if (!settingsLoaded) {
            return
        }

        localStorage.setItem(TENSION_METER_SETTINGS_STORAGE_KEY, JSON.stringify({
            spokeLength_MM,
            spokeDensity_KG_M3: specificSpokeDensity_KG_M,
            lowerTensionBound_KGF,
            upperTensionBound_KGF,
            averagingPeriod_MS,
            spokeMaterial,
        }))
    }, [
        settingsLoaded,
        spokeLength_MM,
        specificSpokeDensity_KG_M,
        lowerTensionBound_KGF,
        upperTensionBound_KGF,
        averagingPeriod_MS,
        spokeMaterial
    ]);

    useEffect(() => {
        if (spokeMaterial === 'other') {
            return
        }

        const density_KG_M3 = DENSITIES_KG_M3[spokeMaterial]
        setSpecificSpokeDensity_KG_M(
            round(density_KG_M3*Math.PI*(spokeDiameter_MM/2/1000)**2, 4)
        )
    }, [spokeMaterial, spokeDiameter_MM]);

    if (!settingsLoaded) {
        return null
    }

    return <HomePageView
        started={started}
        onStop={stopCallback}
        onStart={startCallback}
        averagingPeriod_MS={+averagingPeriod_MS}
        onAveragingPeriod_MS_Change={setAveragingPeriod_MS}
        lowerTensionBound_KGF={lowerTensionBound_KGF}
        onLowerTensionBound_KGF_Change={setLowerTensionBound_KGF}
        upperTensionBound_KGF={upperTensionBound_KGF}
        onUpperTensionBound_KGF_Change={setUpperTensionBound_KGF}
        specificSpokeDensity_KG_M={specificSpokeDensity_KG_M}
        onSpecificSpokeDensity_KG_M_Change={setSpecificSpokeDensity_KG_M}
        spokeLength_MM={spokeLength_MM}
        onSpokeLength_MM_Change={setSpokeLength_MM}
        spectre_KGF_DB={spectre_KGF_DB}
        tension_KGF={tension.kgf}
        frequency_HZ={frequency_HZ}
        lowerFrequencyBound_HZ={lowerFrequencyBound_HZ}
        upperFrequencyBound_HZ={upperFrequencyBound_HZ}
        amplitudeDeviation={amplitudeDeviation}
        amplitudeDeviationReliable={amplitudeDeviationReliable}
        spokeMaterial={spokeMaterial}
        onSpokeMaterialChange={setSpokeMaterial}
        spokeDiameter_MM={spokeDiameter_MM}
        onSpokeDiameter_MM_Change={setSpokeDiameter_MM}
        infoDialogOpened={infoDialogOpened}
        onCloseInfoDialog={onCloseInfoDialogCallback}
        onOpenInfoDialog={onOpenInfoDialogCallback}
    />;
}
