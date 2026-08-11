import React from 'react'
import { useEffect ,useState} from 'react';

function useSearching(value, delay) {
    const [searchValue, setSearchValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchValue(value)
        }, delay);
        return ()=>{
            clearTimeout(handler);
        }
    },[value,delay])
    return searchValue;
}

export default useSearching