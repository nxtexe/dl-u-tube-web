import React, {useState, useEffect} from 'react';
import { ConversionProgress } from '../common/converter';
import { DownloadProgress } from '../common/downloader';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import '../css/VideoInfo.css';
import { Ticker } from './Ticker';

interface VideoInfoProps {
    title?: string;
    author?: string;
    duration?: string;
    coverArt?: string | File | Blob;
    data?: ArrayBuffer | null;
    downloaded?: boolean;
    id?: string;
    type?: "mp3" | "mp4";
}

export function VideoInfo(props: VideoInfoProps) {
    const [src, setSRC] = useState('');
    const defaultProgress = props.downloaded === false ? 0 : 1;
    const [conversionProgress, setConversionProgress] = useState(defaultProgress);
    const [downloadProgress, setDownloadProgress] = useState(defaultProgress);

    useEffect(() => {
        if (props.coverArt && typeof props.coverArt !== "string") {
            setSRC(URL.createObjectURL(props.coverArt));
            URL.revokeObjectURL(src);
        } else {
            if(props.coverArt) setSRC(props.coverArt);
        }
    }, [props.coverArt]);

    useEffect(() => {
        if (props.downloaded === false) {
            const onConversionProgress = (e: CustomEvent<ConversionProgress>) => {
                if (e.detail.resourceID === props.id) {
                    setConversionProgress(e.detail.progress);
                    setDownloadProgress(1);
                }
            };
            const onDownloadProgress = (e: CustomEvent<DownloadProgress>) => {
                if (e.detail.resourceID === props.id) {
                    setDownloadProgress(e.detail.progress);
                }
            };
            window.addEventListener('downloadprogress', onDownloadProgress as EventListener);
            if (props.type === "mp3") {
                window.addEventListener('conversionprogress', onConversionProgress as EventListener);
            } else {
                setConversionProgress(1);
            }

            return () => {
                window.removeEventListener('downloadprogress', onDownloadProgress as EventListener);
                if (props.type === "mp3") {
                    window.removeEventListener('conversionprogress', onConversionProgress as EventListener);
                }
            }
        }
    }, [props.type, props.downloaded]);
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
            <div className="video-info">
                <div className="cover-art">
                    <img src={src} alt="cover-art" />
                </div>
                <div className="info">
                    <div className="title-wrap">
                        <Ticker className="title">{props.title || 'dl-u-tube'}</Ticker>
                    </div>
                    <div className="author-wrap">
                        <Ticker className="author caption">{props.author || 'nxtexe'}</Ticker>
                    </div>
                    <small className="duration">{props.duration || '0:00'}</small>
                </div>
            </div>
            {
            Boolean(props.id) &&
            <Box sx={{ width: 'calc(100% - 30px)' }} style={{marginLeft: '15px', marginRight: '15px'}}>
                <LinearProgress
                    variant="determinate"
                    value={((conversionProgress + downloadProgress) / 2) * 100}
                />
            </Box>
            }
        </div>
    );
}