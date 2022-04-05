import React from 'react';
import LogoButton from '../Components/LogoButton';
import {ReactComponent as BGElement} from '../assets/BGElement.svg';
import {Nav} from '../Components';
import '../css/Home.css';
import { SearchModal } from '../Components';
import { Navigation, SharedElement } from 'react-motion-router';

interface HomeProps {
    navigation: Navigation;
}
export class Home extends React.Component<HomeProps> {
    render() {
        return (
            <div className="home screen-grid">
                <div className="banner">
                    <LogoButton neumorphic />
                    <SharedElement id="page-title" config={{
                        type: 'cross-fade'
                    }}>
                        <h3>DL-U-Tube</h3>
                    </SharedElement>
                </div>
                <SearchModal />
                <div className="bg-element">
                    <BGElement width={window.innerWidth} />
                </div>
                <Nav
                    navigation={this.props.navigation}
                />
            </div>
        );
    }
}

export default Home;