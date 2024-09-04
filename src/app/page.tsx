"use client"
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {AudioSpectrometer} from "@/core/audio-spectrometer";
import {SpokeTension} from "@/core/spoke-tension";
import {maxBy} from "lodash";
import {SignalAveraging} from "@/core/signal-averaging";
import {HomePageView} from "@/app/view";

const DEFAULT_SPOKE_LENGTH_MM = 191
const DEFAULT_SPOKE_DENSITY_KG_M3 = 0.024
const DEFAULT_LOWER_TENSION_BOUND_KGF = 50
const DEFAULT_UPPER_TENSION_BOUND_KGF = 150
const DEFAULT_AVERAGING_PERIOD_MS = 1000

const TENSION_METER_SETTINGS_STORAGE_KEY = 'tension_meter_settings'

export default function HomePage() {
    const pitchDetectorRef = useRef(new AudioSpectrometer())
    const signalAveragingRef = useRef(new SignalAveraging(DEFAULT_AVERAGING_PERIOD_MS))

    const [settingsLoaded, setSettingsLoaded] = useState(false)
    const [started, setStarted] = useState(false);
    const [spokeLength_MM, setSpokeLength_MM] = useState(DEFAULT_SPOKE_LENGTH_MM);
    const [spokeDensity_KG_M3, setSpokeDensity_KG_M3] = useState(DEFAULT_SPOKE_DENSITY_KG_M3);
    const [lowerTensionBound_KGF, setLowerTensionBound_KGF] = useState(DEFAULT_LOWER_TENSION_BOUND_KGF);
    const [upperTensionBound_KGF, setUpperTensionBound_KGF] = useState(DEFAULT_UPPER_TENSION_BOUND_KGF);
    const [averagingPeriod_MS, setAveragingPeriod_MS] = useState(DEFAULT_AVERAGING_PERIOD_MS);

    const [spectre_HZ_DB, setSpectre_HZ_DB] = useState<Array<[number, number]>>([]);

    const frequency_HZ = useMemo(() => maxBy(spectre_HZ_DB, it => it[1])?.[0] ?? 0, [spectre_HZ_DB])
    const spokeLength_M = useMemo(() => spokeLength_MM / 1000, [spokeLength_MM])
    const spokeMass_KG = useMemo(() => spokeLength_M * spokeDensity_KG_M3, [spokeLength_M, spokeDensity_KG_M3])
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
        await pitchDetectorRef.current.stop()
        setStarted(false);
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
            setSpokeDensity_KG_M3(settings.spokeDensity_KG_M3 ?? DEFAULT_SPOKE_DENSITY_KG_M3)
            setLowerTensionBound_KGF(settings.lowerTensionBound_KGF ?? DEFAULT_LOWER_TENSION_BOUND_KGF)
            setUpperTensionBound_KGF(settings.upperTensionBound_KGF ?? DEFAULT_UPPER_TENSION_BOUND_KGF)
            setAveragingPeriod_MS(settings.averagingPeriod_MS ?? DEFAULT_AVERAGING_PERIOD_MS)
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
            spokeDensity_KG_M3,
            lowerTensionBound_KGF,
            upperTensionBound_KGF,
            averagingPeriod_MS
        }))
    }, [
        settingsLoaded,
        spokeLength_MM,
        spokeDensity_KG_M3,
        lowerTensionBound_KGF,
        upperTensionBound_KGF,
        averagingPeriod_MS
    ]);

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
        spokeDensity_KG_M3={spokeDensity_KG_M3}
        onSpokeDensity_KG_M3_Change={setSpokeDensity_KG_M3}
        spokeLength_MM={spokeLength_MM}
        onSpokeLength_MM_Change={setSpokeLength_MM}
        spectre_HZ_DB={spectre_HZ_DB}
        tension_KGS={tension.kgf}
        tension_N={tension.newton}
        frequency_HZ={frequency_HZ}
        lowerFrequencyBound_HZ={lowerFrequencyBound_HZ}
        upperFrequencyBound_HZ={upperFrequencyBound_HZ}
    />;
}
