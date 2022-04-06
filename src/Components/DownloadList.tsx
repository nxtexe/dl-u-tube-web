import React from 'react';
import { Download } from '../common/downloadhistory';
import { Ticker } from './Ticker';
import '../css/DownloadList.css';
import InfiniteScroll from 'react-infinite-scroll-component';

interface DownloadListProps {
    downloads: Download[];
    getNext: () => any;
    hasMore: boolean;
}

export class DownloadList extends React.Component<DownloadListProps> {
    render() {
        const {downloads} = this.props;
        return (
            <div className="download-list">
                <InfiniteScroll
                    dataLength={downloads.length}
                    next={this.props.getNext}
                    hasMore={this.props.hasMore}
                    loader={<div>Loading</div>}
                >
                {
                    downloads.map((download, index) => 
                        <div className="video-info" key={index}>
                            <div className="cover-art">
                                <img ref={(ref: HTMLImageElement | null) => {
                                    if (ref) {
                                        if (ref.src) URL.revokeObjectURL(ref.src);
                                        ref.src = URL.createObjectURL(download.coverArt);
                                    }
                                }} alt="cover-art" />
                            </div>
                            <div className="info">
                                <div className="title-wrap">
                                    <Ticker className="title">{download.title}</Ticker>
                                </div>
                                <div className="author-wrap">
                                    <Ticker className="author">{download.author}</Ticker>
                                </div>
                                <small className="duration">{download.duration}</small>
                            </div>
                        </div>
                    )
                }
                </InfiniteScroll>
            </div>
        );
    }
}

export default DownloadList;