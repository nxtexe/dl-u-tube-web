import React from 'react';
import { Download } from '../common/downloadhistory';
import CircularProgress from '@mui/material/CircularProgress';
import '../css/DownloadList.css';
import InfiniteScroll from 'react-infinite-scroll-component';
import { VideoInfo } from './VideoInfo';

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
                    loader={<div className='loading'><CircularProgress color="secondary" /></div>}
                >
                {
                    downloads.map((download, index) => {
                        return <VideoInfo {...download} key={index} />
                    })
                }
                </InfiniteScroll>
            </div>
        );
    }
}

export default DownloadList;