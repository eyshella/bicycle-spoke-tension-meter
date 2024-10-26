"use client"
import {memo} from "react";
import Button from '@mui/material/Button';
import {
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, Typography,
} from "@mui/material";
import Image from "next/image";

type Props = {
    open: boolean,
    onClose: () => void,
    githubUrl: string
    gratitude: Record<'name' | 'url' | 'reason', string>[]
    licenseUrl: string
}

export const InfoDialog = memo((props: Props) => {
    const {
        open,
        onClose,
        githubUrl,
        gratitude,
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
                        <div className={'flex flex-col items-start justify-start'}>
                            <DialogContentText>
                                Enter spoke length from spoke nipple to the first crossing with other spoke.
                            </DialogContentText>
                            <Image className={'self-center'} width={400} height={400} src={'/length-to-measure.png'}
                                   alt={"Length to measure explanation"}/>
                        </div>
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
                        <div className={'flex flex-col items-start justify-start'}>
                            <DialogContentText>
                                Place your finger lightly on the crossing spoke for better accuracy (to avoid its
                                vibration).
                            </DialogContentText>
                            <Image className={'self-center'} width={400} height={400} src={'/cross-spoke.png'}
                                   alt={"Length to measure explanation"}/>
                        </div>
                    </li>
                    <li>
                        <DialogContentText>
                            Wait until measured tension became green. Repeat few times to verify.
                        </DialogContentText>
                    </li>
                </ul>
                <br/>
                <div className={'w-full h-px bg-grey-400'}/>
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
                <br/>
                <DialogContentText>
                    <Typography variant={'h6'} color={'warning'}>
                        Special thank you to:
                    </Typography>
                    <ul className={"list-disc"}>
                        {
                            gratitude.map(it => (
                                <li key={it.url}>
                                    <Link target="_blank" href={it.url} color={"info"}>{it.name}</Link> for {it.reason}
                                </li>
                            ))
                        }
                    </ul>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} autoFocus>Close</Button>
            </DialogActions>
        </Dialog>
    );
})
