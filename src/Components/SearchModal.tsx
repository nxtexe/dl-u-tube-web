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
import { fetchImage, formatFromDuration, getFileRaw } from '../common/utils';
import {fileSave} from 'browser-fs-access';
import {converter, downloader} from '../Workers';
import convert from '../common/video-to-audio';
import ID3Writer from 'browser-id3-writer';

interface SearchModalState {
    result?: VideoResult;
    defaults?: VideoResult;
    expand: boolean;
    undo: boolean;
    contentLength: number;
    url: string;
    fileType: string;
}

export class SearchModal extends React.Component<any, SearchModalState> {
    constructor(props: any) {
        super(props);
        this.onPaste = this.onPaste.bind(this);
        this.onSave = this.onSave.bind(this);
    }

    state: SearchModalState = {
        expand: false,
        undo: false,
        contentLength: 0,
        url: '',
        fileType: 'mp3'
    }

    async componentDidMount() {
        const url = 'https://www.youtube.com/watch?v=-TxzW4eklEU';
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

            const videoResult: VideoResult = {
                coverArt: coverArt.url,
                coverArtFile: await fetchImage(coverArt.url),
                title: info.title,
                author: info.author,
                duration: info.duration
            }

            this.setState({result: videoResult, defaults: videoResult});
        } catch(e) {
            console.error(e);
        }
    }

    onSave() {
        downloader.postMessage({
            url: this.state.url,
            contentLength: this.state.contentLength
        });
        downloader.onmessage = async (event: MessageEvent<Blob>) => {
            if (!this.state.result) return;
            const blob = event.data;

            if (this.state.fileType === "mp4") {
                try {
                    fileSave(blob, {
                        fileName: this.state.result.title + '.mp4',
                        mimeTypes: ['video/mp4'],
                        extensions: ['.mp4']
                    });
                } catch(e) {
                    console.error(e);
                }
            } else {
                try {
                    const audioData = this.state.result;
                    const name = audioData.title;
                    
                    const videoBuffer = await getFileRaw(blob);
                    converter.postMessage({videoBuffer, name}, [videoBuffer]);
                    converter.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
                        const mp3Buffer = event.data;

                        const coverArtBuffer = await getFileRaw(audioData.coverArtFile);
                        const writer = new ID3Writer(mp3Buffer);
                        writer.setFrame('TIT2', audioData.title)
                        .setFrame('TPE1', audioData.author.split(','))
                        .setFrame('TLEN', audioData.duration)
                        .setFrame('APIC', {
                            type: 3,
                            data: coverArtBuffer,
                            description: 'The Melodic Blue',
                            useUnicodeEncoding: false

                        });
                        writer.addTag();

                        fileSave(writer.getBlob(), {
                            fileName: name + '.mp3',
                            mimeTypes: [blob.type],
                            extensions: ['.mp3']
                        });
                    }
                    
                } catch(e) {
                    console.error(e);
                }
            }
        }
    }

    render() {
        return (
            <div className={
                `search-modal\
                ${this.state.result ? 'results' : ''}\
                ${this.state.expand ? 'expand' : ''}`
            }>
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
                    <IconButton onClick={this.onSave}>
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