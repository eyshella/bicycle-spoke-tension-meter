import {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";

export type UseNumberInputResult = {
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    value: string
}

function convertStringToNumber(value: string): number {
    if(value === ''){
        return 0
    }

    if(Number.isFinite(+value)){
        return +value
    }

    return NaN
}

export function useNumericField(numericValue: number, onChangeNumericValue: (value: number) => void): UseNumberInputResult {
    const[internalStringValue, setInternalStringValue] = useState<string>(
        () => Number.isFinite(numericValue)? numericValue.toString(): ''
    );

    const onChangeStringValue = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValueString = event.target.value
        const newValueNumber = convertStringToNumber(newValueString)

        if(!Number.isNaN(newValueNumber)){
            setInternalStringValue(newValueString)
            onChangeNumericValue(newValueNumber)
        }
    }, [onChangeNumericValue])

    useEffect(() => {
        setInternalStringValue(oldStringValue => {
            const oldNumberValue = convertStringToNumber(oldStringValue)
            if(oldNumberValue !== numericValue || Number.isNaN(oldNumberValue)){
                return numericValue.toString()
            }

            return oldStringValue
        })
    }, [numericValue])


    return {
        onChange: onChangeStringValue,
        value: internalStringValue,
    }
}
