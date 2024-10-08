"use client"
import {memo, useCallback, useState} from "react";
import Button from '@mui/material/Button';
import {
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    TextField,
} from "@mui/material";
import {useNumericField} from "@/hooks/use-numeric-field";

type Props = {
    open: boolean,
    onClose: () => void,
    started: boolean,
    lowerTensionBound_KGF: number,
    onLowerTensionBound_KGF_Change: (value: number) => void
    upperTensionBound_KGF: number,
    onUpperTensionBound_KGF_Change: (value: number) => void
    averagingPeriod_MS: number
    onAveragingPeriod_MS_Change: (value: number) => void
    amplitudeDeviation: number
    lowerFrequencyBound_HZ: number,
    upperFrequencyBound_HZ: number,
    amplitudeDeviationThreshold: number
    onAmplitudeDeviationThresholdChange: (value: number) => void
    onReset: () => void
}

export const AdvancedSettingsDialog = memo((props: Props) => {
    const {
        open,
        onClose,
        started,
        lowerTensionBound_KGF,
        onLowerTensionBound_KGF_Change,
        upperTensionBound_KGF,
        onUpperTensionBound_KGF_Change,
        lowerFrequencyBound_HZ,
        upperFrequencyBound_HZ,
        averagingPeriod_MS,
        onAveragingPeriod_MS_Change,
        amplitudeDeviation,
        amplitudeDeviationThreshold,
        onAmplitudeDeviationThresholdChange,
        onReset
    } = props

    const lowerTensionBound_KGF_Field = useNumericField(lowerTensionBound_KGF, onLowerTensionBound_KGF_Change)
    const upperTensionBound_KGF_Field = useNumericField(upperTensionBound_KGF, onUpperTensionBound_KGF_Change)
    const averagingPeriod_MS_Field = useNumericField(averagingPeriod_MS, onAveragingPeriod_MS_Change)
    const amplitudeDeviationThresholdField = useNumericField(amplitudeDeviationThreshold, onAmplitudeDeviationThresholdChange)

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>
                {"Advanced settings"}
            </DialogTitle>
            <DialogContent>
                <div className={"flex flex-col items-start justify-start max-w-full"}>
                    <div className={"mb-6"}>
                        <DialogContentText>
                            These are advanced settings that you might only need to adjust in specific situations. It's
                            usually best to leave them alone. If you accidentally mess something up, you can always
                            reset all app settings to their original values by clicking the 'Reset All' button.
                        </DialogContentText>
                    </div>
                    <div className={"flex flex-col items-stretch justify-start sm:w-96 w-48 max-w-full mb-6"}>
                        <TextField
                            label="Lower tension bound (kgf)"
                            variant="outlined"
                            color={"primary"}
                            disabled={started}
                            {...lowerTensionBound_KGF_Field}
                        />
                    </div>
                    <div className={"flex flex-col items-stretch justify-start sm:w-96 w-48 max-w-full mb-6"}>
                        <TextField
                            label="Upper tension bound (kgf)"
                            variant="outlined"
                            color={"primary"}
                            disabled={started}
                            {...upperTensionBound_KGF_Field}
                        />
                    </div>
                    <div className={"flex flex-col items-stretch justify-start sm:w-96 w-48 max-w-full mb-6"}>
                        <TextField
                            label="Lower frequency bound (hz)"
                            variant="outlined"
                            color={"primary"}
                            value={lowerFrequencyBound_HZ}
                            disabled
                        />
                    </div>
                    <div className={"flex flex-col items-stretch justify-start sm:w-96 w-48 max-w-full mb-6"}>
                        <TextField
                            label="Upper frequency bound (hz)"
                            variant="outlined"
                            color={"primary"}
                            value={upperFrequencyBound_HZ}
                            disabled
                        />
                    </div>
                    <div className={"flex flex-col items-stretch justify-start sm:w-96 w-48 max-w-full mb-6"}>
                        <TextField
                            label="Averaging period (ms)"
                            variant="outlined"
                            color={"primary"}
                            disabled={started}
                            {...averagingPeriod_MS_Field}
                        />
                    </div>
                    <div className={"flex flex-col items-stretch justify-start sm:w-96 w-48 max-w-full mb-6"}>
                        <TextField
                            label="Amplitude deviation threshold"
                            variant="outlined"
                            color={"primary"}
                            disabled={started}
                            {...amplitudeDeviationThresholdField}
                        />
                    </div>
                    <div className={"flex flex-col items-stretch justify-start sm:w-96 w-48 max-w-full mb-6"}>
                        <TextField
                            label="Amplitude deviation"
                            variant="outlined"
                            color={"primary"}
                            value={amplitudeDeviation}
                            disabled
                        />
                    </div>
                    <div className={"flex flex-col items-start justify-start max-w-full"}>
                        <Button onClick={onReset} color={'warning'} variant={"outlined"} disabled={started}>
                            Reset all
                        </Button>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} autoFocus>Close</Button>
            </DialogActions>
        </Dialog>
    );
})


