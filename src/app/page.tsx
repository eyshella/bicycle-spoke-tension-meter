"use client"
import {useState} from "react";

export default function Home() {
    const [started, setStarted] = useState(false);
    const [spokeLengthString, setSpokeLengthString] = useState('');
    const [spokeDensityString, setSpokeDensityString] = useState('');

    return (
        <main className={"flex flex-col items-center justify-start size-full bg-blue-950 text-white p-4"}>
            <div className={"font-sans text-center text-white text-9xl mb-12"}>
                54
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div>
                    Spoke length (mm)
                </div>
                <input className={"font-sans text-white text-base border-white border-1 border-solid p-2 rounded"}
                       type={"number"} value={spokeLengthString}
                       onChange={it => setSpokeLengthString(it.target.value)}/>
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full mb-12"}>
                <div>
                    Spoke density (kg/m3)
                </div>
                <input className={"font-sans text-white text-base border-white border-1 border-solid p-2 rounded"}
                       type={"number"} value={spokeDensityString}
                       onChange={it => setSpokeDensityString(it.target.value)}/>
            </div>
            <div className={"flex flex-row items-center justify-start gap-4"}>
                {started && <button
                    onClick={() => setStarted(false)}
                    className={"border-1 border-solid border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 active:border-red-700 active:text-red-700 p-2 cursor-pointer rounded"}>
                    Stop
                </button>}

                {!started && <button
                    disabled={started}
                    onClick={() => setStarted(true)}
                    className={"border-1 border-solid border-green-500 text-green-500 hover:border-green-600 hover:text-green-600 active:border-green-700 active:text-green-700 p-2 cursor-pointer rounded"}>Start
                </button>}
            </div>
        </main>
    );
}
