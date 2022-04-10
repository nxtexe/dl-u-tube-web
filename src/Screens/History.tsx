import React from 'react';
import { Navigation, SharedElement } from 'react-motion-router';
import DownloadHistory, { Download } from '../common/downloadhistory';
import {DownloadList, Nav} from '../Components';
import LogoButton from '../Components/LogoButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SwipeableViews from 'react-swipeable-views';
import '../css/History.css';
import { Button } from '@mui/material';
import localforage from 'localforage';
import JSZip from 'jszip';
import {fileSave} from 'browser-fs-access';
import Toast from '../Components/Toast';

interface HistoryProps {
    navigation: Navigation;
}

interface HistoryState {
    page: number;
    audioDownloads: Download[];
    videoDownloads: Download[];
    audioNext: number | undefined;
    videoNext: number | undefined;
    unsavedAudio: string[];
    unsavedVideo: string[];
}

export class History extends React.Component<HistoryProps> {
    private downloadHistory = DownloadHistory.instance;
    private unsavedForage = localforage.createInstance({
        name: process.env.REACT_APP_DB_NAME,
        storeName: 'unsaved'
    });
    private getNextAudio;
    private getNextVideo;
    constructor(props: HistoryProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.getNextAudio = this.getNext.bind(this, "mp3");
        this.getNextVideo = this.getNext.bind(this, "mp4");
        this.onSave = this.onSave.bind(this);
        this.updateUnsaved = this.updateUnsaved.bind(this);
    }
    state: HistoryState = {
        audioDownloads: [],
        videoDownloads: [],
        page: 0,
        audioNext: 0,
        videoNext: 0,
        unsavedAudio: [],
        unsavedVideo: []
    }

    async componentDidMount() {
        const [audioDownloads, audioNext] = await DownloadHistory.instance.find({type: "mp3"});
        const [videoDownloads, videoNext] = await DownloadHistory.instance.find({type: "mp4"});
        videoDownloads.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);
        audioDownloads.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);

        DownloadHistory.instance.addUpdateListener(this.updateUnsaved);

        const unsavedAudio: string[] = [];
        const unsavedVideo: string[] = [];
        await this.unsavedForage.iterate(function (type: "mp3" | "mp4", _id: string) {
            if (type === "mp3") {
                unsavedAudio.push(_id);
                return undefined;
            }
            unsavedVideo.push(_id);
            return undefined;
        } as any);

        this.setState({unsavedAudio, unsavedVideo});
        
        this.setState({videoDownloads, audioDownloads, audioNext, videoNext});
    }

    componentWillUnmount() {
        DownloadHistory.instance.removeUpdateListener(this.updateUnsaved);
    }

    async updateUnsaved(_id: string, data: Partial<Download>) {
        if (data.data) {
            if (data.type === "mp3") {
                this.setState({
                    unsavedAudio: [
                        ...this.state.unsavedAudio,
                        _id
                    ]
                });
            } else {
                this.setState({
                    unsavedVideo: [
                        ...this.state.unsavedVideo,
                        _id
                    ]
                });
            }
        }
    }

    onChange() {
        let page = arguments[0];
        if (typeof arguments[0] !== "number") {
            page = arguments[1];
        }

        this.setState({page});
    }

    async getNext(type: "mp3" | "mp4") {
        if (type === "mp3") {
            const [audioDownloads, audioNext] = await DownloadHistory.instance.find({type: type}, this.state.audioNext);
            
            audioDownloads.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);
            this.setState({audioNext, audioDownloads: [
                ...this.state.audioDownloads,
                ...audioDownloads
            ]});
        } else {
            const [videoDownloads, videoNext] = await DownloadHistory.instance.find({type: type}, this.state.videoNext);
            
            videoDownloads.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);
            this.setState({videoNext, videoDownloads: [
                ...this.state.videoDownloads,
                ...videoDownloads
            ]});
        }
    }

    async onSave() {
        Toast.toast("Preparing Download");

        const zip = new JSZip();
        let downloads: Download[] | undefined;
        if (this.state.page === 0) {
            //save audio
            [downloads] = await this.downloadHistory.find(this.state.unsavedAudio);
        } else {
            // save video
            [downloads] = await this.downloadHistory.find(this.state.unsavedVideo);
        }

        if (downloads.length > 1) {
            downloads.map((download) => {
                if (download.data) {
                    zip.file(`${download.title}.${download.type}`, download.data);
                }
                return;
            });
            const zipBlob = await zip.generateAsync({type: "blob"});
            fileSave(zipBlob, {
                fileName: this.state.page === 0 ? 'dl-u-tube-audio.zip' : 'dl-u-tube-video.zip',
                extensions: ['.zip']
            });
        } else {
            const [download] = downloads;
            if (download && download.data) {
                const mimeType = download.type === "mp3" ? 'audio/mpeg' : 'video/mp4';
                const blob = new Blob([download.data], {type: mimeType});
                fileSave(blob, {
                    fileName: `${download.title}.${download.type}`,
                    extensions: [`.${download.type}`]
                });
            }
        }

        // clear unsaved
        const clearFunc = (_id: string) => {
            this.downloadHistory.updateOne(_id, {data: null});
            return undefined;
        }
        this.state.unsavedAudio.map(clearFunc);
        this.state.unsavedVideo.map(clearFunc);
        this.setState({unsavedAudio: [], unsavedVideo: []});
        await this.unsavedForage.clear();        
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
                <div className="save-indicator-wrap">
                    {Boolean(this.state.page === 0 && this.state.unsavedAudio.length) &&
                    <Button onClick={this.onSave} className='save-indicator'>
                        {this.state.unsavedAudio.length} unsaved
                    </Button>
                    }
                    {Boolean(this.state.page === 1 && this.state.unsavedVideo.length) &&
                    <Button onClick={this.onSave} className='save-indicator' style={{fontWeight: 'var(--oswald-medium)'}}>
                        {this.state.unsavedVideo.length} unsaved
                    </Button>
                    }
                </div>
                <div className="tab-panel">
                    <Tabs value={this.state.page} onChange={this.onChange} component="div">
                        <Tab label="Audio" />
                        <Tab label="Video" />
                    </Tabs>
                    <SwipeableViews index={this.state.page} onChangeIndex={this.onChange} style={{flex: '1'}} containerStyle={{height: '100%'}}>
                        <DownloadList hasMore={Boolean(this.state.audioNext)} getNext={this.getNextAudio} downloads={this.state.audioDownloads} />
                        <DownloadList hasMore={Boolean(this.state.videoNext)} getNext={this.getNextVideo} downloads={this.state.videoDownloads} />
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