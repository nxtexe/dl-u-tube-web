import React from 'react';
import LogoButton from '../Components/LogoButton';
import {ReactComponent as BGElement} from '../assets/BGElement.svg';
import {Nav} from '../Components';
import '../css/Home.css';
import { SearchModal } from '../Components';
import { Motion, Navigation, SharedElement } from 'react-motion-router';

interface HomeProps {
    navigation: Navigation;
    route: {
        params: {url: string | undefined};
    }
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
                <SearchModal url={this.props.route.params.url} />
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

export default Home;