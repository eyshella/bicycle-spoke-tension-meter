"use client"
import {memo} from "react";
import Button from '@mui/material/Button';
import {
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    TextField,
} from "@mui/material";

type Props = {
    open: boolean,
    onClose: () => void,
    lowerTensionBound_KGF: number,
    onLowerTensionBound_KGF_Change: (value: number) => void
    upperTensionBound_KGF: number,
    onUpperTensionBound_KGF_Change: (value: number) => void
    averagingPeriod_MS: number
    onAveragingPeriod_MS_Change: (value: number) => void
    amplitudeDeviation: number
    lowerFrequencyBound_HZ: number,
    upperFrequencyBound_HZ: number,
}

export const AdvancedSettingsDialog = memo((props: Props) => {
    const {
        open,
        onClose,
        lowerTensionBound_KGF,
        onLowerTensionBound_KGF_Change,
        upperTensionBound_KGF,
        onUpperTensionBound_KGF_Change,
        averagingPeriod_MS,
        onAveragingPeriod_MS_Change,
    } = props

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>
                {"Use Google's location service?"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    This is internal settings and parameters that may be useful in some cases.
                </DialogContentText>
                <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-6"}>
                    <TextField
                        label="Lower tension bound (kgf)"
                        variant="outlined"
                        color={"primary"}
                        value={lowerTensionBound_KGF}
                        onChange={it => onLowerTensionBound_KGF_Change(+it.target.value)}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} autoFocus>Close</Button>
            </DialogActions>
        </Dialog>
    );
})


