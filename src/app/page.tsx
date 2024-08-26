export default function Home() {
    return (
        <main className={"flex flex-col items-center justify-start size-full bg-blue-950 text-white p-4"}>
            <div className={"font-sans text-center text-white text-9xl mb-12"}>
                54
            </div>
            <div className={"flex flex-col items-stretch justify-start w-96 max-w-full"}>
                <div>
                    Spoke length
                </div>
                <input className={"font-sans text-white text-base border-white border-1 border-solid p-2"}
                       type={"number"}/>
            </div>
        </main>
    );
}
