import React from 'react';
import { Navigation, SharedElement } from 'react-motion-router';
import {Nav} from '../Components';
import LogoButton from '../Components/LogoButton';
import '../css/History.css';

interface HistoryProps {
    navigation: Navigation;
}

export class History extends React.Component<HistoryProps> {
    render() {
        return (
            <div className="history screen-grid">
                <div className="banner">
                    <LogoButton neumorphic onClick={() => this.props.navigation.goBack()} />
                    <SharedElement id="page-title">
                        <h3>History</h3>
                    </SharedElement>
                </div>
                <Nav
                    navigation={this.props.navigation}
                />
            </div>
        );
    }
}

export default History;