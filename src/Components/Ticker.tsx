import React, {useEffect, useState} from 'react';
import {toggleTicker} from '../common/utils';

interface TickerProps {
    children: string;
    className: string;
}

export function Ticker(props: TickerProps) {
    let ref = React.createRef<HTMLParagraphElement>();
    const [timeoutID, setTimeoutID] = useState(0);
    const [playing, setPlaying] = useState(false);
    
    useEffect(() => {
        clearTimeout(timeoutID);
        if (!ref.current || !ref.current.parentElement) return;

        if (playing) {
            toggleTicker(ref.current, ref.current.parentElement);
            setPlaying(false);
        }

        function timeout(ref: HTMLParagraphElement | null) {
            if (ref && ref.parentElement) {
                if (!playing) {
                    toggleTicker(ref, ref.parentElement);
                    setPlaying(true);
                }
            }
        }
        setTimeoutID(window.setTimeout(timeout.bind(null, ref.current), 1000));
    }, [props.children]);

    return <p className={props.className} ref={ref}>{props.children}</p>
}