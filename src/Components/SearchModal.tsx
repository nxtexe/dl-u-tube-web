import React from 'react';
import '../css/SearchModal.css';
import PasteInput from './PasteInput';
import { VideoInfo } from './VideoInfo';
import { IconButton } from '@mui/material';
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import UndoIcon from '@mui/icons-material/Undo';
import InfoEditor from './InfoEditor';
import { RawVideoResult, VideoResult } from '../common/types';
import Dropdown from './Dropdown';
import moment from 'moment';
import { fetchImage, formatFromDuration, getFileRaw, isYTURL } from '../common/utils';
import Downloader, { DownloadProgress } from '../common/downloader';
import Converter, { ConversionProgress } from '../common/converter';
import ID3Writer from 'browser-id3-writer';
import DownloadHistory from '../common/downloadhistory';
import {v4 as uuid4} from 'uuid';
import Toast from './Toast';
import localforage from 'localforage';

interface SearchModalProps {
    url?: string;
}

interface SearchModalState {
    result?: VideoResult;
    defaults?: VideoResult;
    expand: boolean;
    undo: boolean;
    contentLength: number;
    url: string;
    fileType: "mp4" | "mp3";
}

export class SearchModal extends React.Component<SearchModalProps, SearchModalState> {
    private unsavedForage = localforage.createInstance({
        name: process.env.REACT_APP_DB_NAME,
        storeName: 'unsaved'
    });
    constructor(props: any) {
        super(props);
        this.onPaste = this.onPaste.bind(this);
        this.onDownload = this.onDownload.bind(this);
    }

    state: SearchModalState = {
        expand: false,
        undo: false,
        contentLength: 0,
        url: this.props.url || '',
        fileType: 'mp3'
    }

    async componentDidMount() {
        if (this.props.url && isYTURL(this.props.url)) this.onPaste(this.props.url);
        Converter.instance.onProgress = (resourceID, progress) => {
            const conversionProgress = new CustomEvent<ConversionProgress>('conversionprogress', {
                detail: {resourceID, progress}
            });

            window.dispatchEvent(conversionProgress);
        }

        Downloader.instance.onProgress = (resourceID, progress) => {
            const downloadProgress = new CustomEvent<DownloadProgress>('downloadprogress', {
                detail: {resourceID, progress}
            });

            window.dispatchEvent(downloadProgress);
        }
    }

    async onPaste(url: string) {
        try {
            const response = await fetch(`/api/video/info?url=${url}`);
            const info = await response.json() as RawVideoResult;

            info.thumbnails.sort((a, b) => {
                const diff1 = a.width - a.height;
                const diff2 = b.width - b.height;

                return diff1 > diff2 ? -1 : 1;
            });

            const [coverArt] = info.thumbnails;

            const duration = parseFloat(info.duration);

            const videoResult: VideoResult = {
                coverArt: coverArt.url,
                coverArtFile: await fetchImage(coverArt.url),
                title: info.title,
                author: info.author,
                duration: moment.utc(duration).format(formatFromDuration(duration / 1000))
            }

            this.setState({
                result: videoResult,
                defaults: videoResult,
                contentLength: parseInt(info.contentLength),
                url: url
            });
        } catch(e) {
            console.error(e);
        }
    }

    async onDownload() {
        if (!this.state.result) return;
        Toast.toast('Added to Download Queue');

        const {url, contentLength, fileType} = this.state;
        const {title, coverArtFile, duration, author} = this.state.result;
        const _id = uuid4();

        this.setState({result: undefined, defaults: undefined, url: '', expand: false, contentLength: 0});

        DownloadHistory.instance.insertOne({
            id: _id,
            download: {
                title: title,
                coverArt: coverArtFile,
                duration: duration,
                url: url,
                author: author,
                type: fileType,
                data: null,
                downloaded: false,
                timestamp: Date.now()
            }
        });

        let data = await Downloader.instance.download(_id, url, contentLength);
        
        if (fileType === "mp3") {
            // convert
            const mp3Buffer = await Converter.instance.mp4ToMp3(_id, data, title);
            const coverArtBuffer = await getFileRaw(coverArtFile);
            const writer = new ID3Writer(mp3Buffer);
            // TODO WOAS, WORS, WOAF, TPE2, TALB, TYEAR, TDAT, COMM
            writer.setFrame('TIT2', title)
            .setFrame('TPE1', author.split(','))
            .setFrame('TLEN', duration)
            .setFrame('APIC', {
                type: 3,
                data: coverArtBuffer,
                description: '',
                useUnicodeEncoding: false

            });
            writer.addTag();

            data = writer.arrayBuffer;
        }

        DownloadHistory.instance.updateOne(_id, {data, downloaded: true});
        this.unsavedForage.setItem(_id, fileType);
        // notify user if possible
    }

    render() {
        return (
            <div className={`search-modal ${this.state.result ? 'results' : ''} ${this.state.expand ? 'expand' : ''}`}>
                <PasteInput onPaste={this.onPaste} done={Boolean(this.state.result)} />
                <VideoInfo {...this.state.result} />
                <Dropdown disabled={!this.state.expand} onChange={(value) => this.setState({fileType: value})} />
                <InfoEditor
                    info={this.state.result}
                    onChange={(result) => this.setState({result: result})}
                    open={this.state.expand}
                    undo={this.state.undo}
                />

                <div className="options">
                    <IconButton onClick={this.onDownload}>
                        <SaveAltIcon />
                    </IconButton>
                    <IconButton onClick={() => this.setState({expand: !this.state.expand})}>
                        {!this.state.expand && <ChevronDownIcon />}
                        {this.state.expand && <ChevronUpIcon />}
                    </IconButton>
                    <IconButton onClick={() => this.setState({
                        result: this.state.defaults,
                        undo: !this.state.undo
                    })}>
                        <UndoIcon />
                    </IconButton>
                </div>
            </div>
        );
    }
}