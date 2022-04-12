import React, {useEffect, useState} from 'react';
import { Motion } from 'react-motion-router';
import {ReactComponent as LogoBG} from '../assets/LogoBG.svg';
import {ReactComponent as LogoPlay} from '../assets/LogoPlay.svg';
import { clamp, isPWA, iOS } from '../common/utils';
import '../css/LogoButton.css';

interface LogoButtonProps {
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    neumorphic?: boolean;
}

export default function LogoButton(props: LogoButtonProps) {
    const [defaultRotation, setDefaultRotation] = useState(iOS() && !isPWA && props.onClick ? 90 : 0);

    useEffect(() => {
        window.addEventListener('load', () => {
            if (props.onClick) {
                setDefaultRotation(90);
            }
        }, {once: true});
    }, []);
    return (
        <div className={`logo-button ${props.neumorphic ? 'neumorphic' : ''}`} onClick={props.onClick} role="navigation" aria-label='back-button'>
            <Motion.Consumer>
                {(progress) => 
                    <div className="play" style={{transform: `rotate(${clamp(progress - 10, 0, 90) || defaultRotation}deg)`}}>
                        <LogoPlay width={'22'} height={'19'} />
                    </div>
                }
            </Motion.Consumer>
            <div className="bg">
                <LogoBG width={64} height={44} />
            </div>
        </div>
    );
}