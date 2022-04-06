import React from 'react';
import { Navigation, SharedElement } from 'react-motion-router';
import DownloadHistory, { Download } from '../common/downloadhistory';
import {DownloadList, Nav} from '../Components';
import LogoButton from '../Components/LogoButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SwipeableViews from 'react-swipeable-views';
import '../css/History.css';

interface HistoryProps {
    navigation: Navigation;
}

interface HistoryState {
    page: number;
    audioDownloads: Download[];
    videoDownloads: Download[];
    next: number | undefined;
}

export class History extends React.Component<HistoryProps> {
    constructor(props: HistoryProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.getNext = this.getNext.bind(this);
    }
    state: HistoryState = {
        audioDownloads: [],
        videoDownloads: [],
        page: 0,
        next: 0
    }

    async componentDidMount() {
        const [downloads, next] = await DownloadHistory.instance.find();
        const audioDownloads = downloads.filter((download) => download.type === "mp3");
        const videoDownloads = downloads.filter((download) => download.type === "mp4");

        this.setState({videoDownloads, audioDownloads, next});
    }

    onChange() {
        let page = arguments[0];
        if (typeof arguments[0] !== "number") {
            page = arguments[1];
        }

        this.setState({page});
    }

    async getNext() {
        const [downloads, next] = await DownloadHistory.instance.find([], this.state.next);
        const audioDownloads = [
            ...this.state.audioDownloads,
            downloads.filter((download) => download.type === "mp3")
        ];
        const videoDownloads = [
            ...this.state.videoDownloads,
            downloads.filter((download) => download.type === "mp4")
        ];

        this.setState({videoDownloads, audioDownloads, next});
    }
    render() {
        return (
            <div className="history screen-grid">
                <div className="banner">
                    <LogoButton neumorphic onClick={() => this.props.navigation.goBack()} />
                    <SharedElement id="page-title">
                        <h3>History</h3>
                    </SharedElement>
                </div>
                
                <div className="tab-panel">
                    <Tabs value={this.state.page} onChange={this.onChange} component="div">
                        <Tab label="Audio" />
                        <Tab label="Video" />
                    </Tabs>
                    <SwipeableViews index={this.state.page} onChangeIndex={this.onChange}>
                        <DownloadList hasMore={Boolean(this.state.next)} getNext={this.getNext} downloads={this.state.audioDownloads} />
                        <DownloadList hasMore={Boolean(this.state.next)} getNext={this.getNext} downloads={this.state.videoDownloads} />
                    </SwipeableViews>
                </div>

                <Nav
                    navigation={this.props.navigation}
                />
            </div>
        );
    }
}

export default History;