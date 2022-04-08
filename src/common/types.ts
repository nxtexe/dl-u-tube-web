import {NotificationPreferences} from '../Screens/Settings';

export interface VideoResult {
    title: string;
    author: string;
    duration: string;
    coverArt: string;
    coverArtFile: File | Blob;
};

export interface RawVideoResult {
    title: string;
    author: string;
    duration: string;
    thumbnails: {
        height: number;
        width: number;
        url: string;
    }[];
    contentLength: string;
}

export interface Preferences {
    notifications: NotificationPreferences;
    filetype: "mp3" | "mp4";
}