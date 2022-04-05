import React from 'react';
import { Motion, Navigation, SharedElement } from 'react-motion-router';
import {ReactComponent as BGElement} from '../assets/BGElement.svg';
import {Nav} from '../Components';
import LogoButton from '../Components/LogoButton';
import '../css/Settings.css';

interface SettingsProps {
    navigation: Navigation;
}
export class Settings extends React.Component<SettingsProps> {
    render() {
        return (
            <div className="settings screen-grid">
                <div className="banner">
                    <LogoButton onClick={() => this.props.navigation.goBack()} />
                    <SharedElement id="page-title">
                        <h3>Settings</h3>
                    </SharedElement>
                </div>
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
                    navigation={this.props.navigation}
                />
            </div>
        );
    }
}

export default Settings;