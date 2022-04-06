import localforage from "localforage";
import {v4 as uuid4} from 'uuid';

export interface Download {
    title: string;
    coverArt: File | Blob;
    duration: string;
    author: string;
    url: string;
    type: "mp4" | "mp3";
}

interface Entry {
    id?: string;
    download: Download;
}

export default class DownloadHistory {
    private static _instance: DownloadHistory | null = null;
    private forage = localforage.createInstance({
        driver: localforage.INDEXEDDB,
        name: 'dl-u-tube',
        storeName: 'history',
        version: 1.0
    });

    private constructor() {}

    static get instance(): DownloadHistory {
        if (!DownloadHistory._instance) {
            DownloadHistory._instance = new DownloadHistory();
        }

        return DownloadHistory._instance;
    }

    // startFrom and limit for pagination
    async find(IDs?: string[], startFrom?: number, limit?: number): Promise<[Download[], number | undefined]> {
        if (!IDs || !IDs.length) {
            IDs = await this.forage.keys();
        }
        if (!limit) limit = Math.min(IDs.length, 10);
        limit = Math.min(IDs.length, limit);

        if (!startFrom) startFrom = 0;
        if (startFrom > IDs.length) throw (new Error("Range Error"));

        const values: Download[] = [];
        for (let i = startFrom; i < limit; i++) {
            const download = await this.forage.getItem<Download>(IDs[i]);
            if (download) values.push(download);
        }

        const next = startFrom + limit < IDs.length ? startFrom + limit : undefined;
        return [values, next];
    }

    async findOne(id: string): Promise<Download | null> {
        return await this.forage.getItem(id);
    }

    async insert(entries: Entry[]) {
        for (let i = 0; i < entries.length; i++) {
            let {id, download} = entries[i];
            if (!id) {
                id = uuid4();
            }
            await this.forage.setItem<Download>(id, download);
        }
    }

    async insertOne(entry: {id?: string, download: Download}) {
        let {id, download} = entry;
        if (!id) id = uuid4();
        await this.forage.setItem<Download>(id, download);
    }
}