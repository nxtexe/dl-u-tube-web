import React from 'react';
import '../css/VideoInfo.css';
import { Ticker } from './Ticker';

interface VideoInfoProps {
    title?: string;
    author?: string;
    duration?: string;
    coverArt?: string;
}

export function VideoInfo(props: VideoInfoProps) {
    return (
        <div className="video-info">
            <div className="cover-art">
                <img src={props.coverArt || ''} alt="cover-art" />
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
    );
}