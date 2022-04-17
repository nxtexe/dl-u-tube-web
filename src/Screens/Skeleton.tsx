import React, { useContext } from 'react';
import { Motion, Navigation, SharedElement } from 'react-motion-router';
import {ReactComponent as BGElement} from '../assets/BGElement.svg';
import { Nav } from '../Components';
import LogoButton from '../Components/LogoButton';
import '../css/Skeleton.css';

interface BannerProps {
    navigation: Navigation;
}

function Banner(props: BannerProps) {
    const neumorphic = props.navigation.location.pathname === '/' || props.navigation.location.pathname === '/history';
    const title = props.navigation.location.pathname === '/' ? "DL-U-Tube" : props.navigation.location.pathname === "/settings" ? "Settings" : "History";
    return(
        <div className="banner">
            <LogoButton neumorphic={neumorphic} onClick={() => props.navigation.goBack()} />
            <SharedElement id="page-title" config={{
                type: 'cross-fade'
            }}>
                <h3>{title}</h3>
            </SharedElement>
        </div>
    );
}

interface SkeletonProps {
    navigation?: Navigation;
}

export function Skeleton(props: SkeletonProps) {
    if (!props.navigation) return <></>;
    if (props.navigation.location.pathname === "/") {
        return(
            <div className="skeleton screen-grid">
                <Banner navigation={props.navigation} />
                <Motion.Consumer>
                    {(progress) => 
                        <div className="bg-element" style={{
                            transform: `translate(-${(progress / 100) * 30}%, 0%) rotate(${(progress / 100) * 156}deg)`
                        }}>
                            <BGElement width={600} viewBox='0 0 560 273' />
                        </div>
                    }
                </Motion.Consumer>
                <Nav
                    navigation={props.navigation}
                />
            </div>
        );
    } else if (props.navigation.location.pathname === "/history") {
        return(
            <div className="skeleton history screen-grid">
                <Banner navigation={props.navigation} />
                <Nav
                    navigation={props.navigation}
                />
            </div>
        );
    } else if (props.navigation.location.pathname === "/settings") {
        return(
            <div className="skeleton settings screen-grid">
                <Banner navigation={props.navigation} />
                <Motion.Consumer>
                    {(progress) => 
                        <div className="bg-element" style={{
                            transform: `translate(-${(progress / 100) * 30}%, 0%) rotate(${(progress / 100) * 156}deg)`
                        }}>
                            <BGElement width={600} viewBox='0 0 560 273' />
                        </div>
                    }
                </Motion.Consumer>
                <Nav
                    navigation={props.navigation}
                />
            </div>
        );
    } else {
        return <></>;
    }
}

export default Skeleton;