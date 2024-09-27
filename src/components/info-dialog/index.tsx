"use client"
import {memo} from "react";
import Button from '@mui/material/Button';
import {
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link,
} from "@mui/material";

type Props = {
    open: boolean,
    onClose: () => void,
    githubUrl: string
    licenseUrl: string
}

export const InfoDialog = memo((props: Props) => {
    const {
        open,
        onClose,
        githubUrl,
        licenseUrl
    } = props

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>
                {"Information"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    This web app uses sound to measure bicycle spoke tension.
                </DialogContentText>

                <br/>
                <ul className={"list-disc"}>
                    <li>
                        <DialogContentText>
                            Enter spoke length from spoke nipple to the first crossing with other spoke.
                        </DialogContentText>
                    </li>
                    <li>
                        <DialogContentText>
                            Choose spoke material (usually steel or aluminium).
                        </DialogContentText>
                    </li>
                    <li>
                        <DialogContentText>
                            Enter spoke diameter.
                        </DialogContentText>
                    </li>
                    <li>
                        <DialogContentText>
                            Make sure you are in the quiet room.
                        </DialogContentText>
                    </li>
                    <li>
                        <DialogContentText>
                            Start measuring by pressing <b>Start</b> button.
                        </DialogContentText>
                    </li>
                    <li>
                        <DialogContentText>
                            Vibrate the spoke like a guitar string by a plastic card or plectrum.
                        </DialogContentText>
                    </li>
                    <li>
                        <DialogContentText>
                            Place your finger lightly on the crossing spoke for better accuracy (to avoid its
                            vibration).
                        </DialogContentText>
                    </li>
                    <li>
                        <DialogContentText>
                            Wait until measured tension became green. Repeat few times to verify.
                        </DialogContentText>
                    </li>
                </ul>
                <br/>
                <DialogContentText>
                    The app can only measure spoke tensions between 50 and 150 kgf.
                    If you're unable to measure the tension, it's likely too loose (the spoke bends easily).
                    Try adjusting the spoke tension until it falls within the measurable range.
                </DialogContentText>
                <br/>
                <DialogContentText>
                    Feel free to come up with comments and suggestions at the <Link target="_blank" href={githubUrl}
                                                                                    color={"info"}>Github.</Link>
                </DialogContentText>
                <DialogContentText>
                    This application is licensed under the <Link target="_blank" href={licenseUrl} color={"info"}>MIT
                    License.</Link>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} autoFocus>Close</Button>
            </DialogActions>
        </Dialog>
    );
})


