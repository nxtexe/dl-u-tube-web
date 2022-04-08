import localforage from "localforage";
import {v4 as uuid4} from 'uuid';

export interface Download {
    title: string;
    coverArt: File | Blob;
    data: ArrayBuffer | null;
    duration: string;
    author: string;
    url: string;
    type: "mp4" | "mp3";
    downloaded: boolean;
    id?: string;
    timestamp: number;
}

interface Entry {
    id?: string;
    download: Download;
}

type UpdateListener = (id: string, data: Download) => void;

export default class DownloadHistory {
    private static _instance: DownloadHistory | null = null;
    private _onUpdateListeners: UpdateListener[] = [];
    private forage = localforage.createInstance({
        driver: localforage.INDEXEDDB,
        name: process.env.REACT_APP_DB_NAME,
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
        const length = await this.forage.length();
        if (startFrom && startFrom > length) throw (new Error("Range Error"));
        if (!IDs || !IDs.length) {
            if (!limit) limit = Math.min(length, 20);
            limit = Math.min(length, limit);
        } else {
            limit = length; // if IDs are specified then iterate all records
        }

        if (!startFrom) startFrom = 0;

        const values: Download[] = [];
        await this.forage.iterate(function (download: Download, _id: string, index: number) {
            if (startFrom === undefined || limit === undefined) return _id;
            if (index - 1 >= startFrom && index - 1 < limit) {
                if (!IDs || !IDs.length) {
                    if (download) values.push(download);
                } else {
                    if (IDs.includes(_id)) {
                        values.push(download);
                    }
                }
                
                return undefined;
            } else {
                return _id; // exit iteration
            }
        } as any);

        const next = startFrom + limit < length ? startFrom + limit : undefined;
        return [values, next];
    }

    async findOne(id: string): Promise<Download | null> {
        return await this.forage.getItem(id);
    }

    insert(entries: Entry[]) {
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < entries.length; i++) {
                let {id, download} = entries[i];
                if (!id) {
                    id = uuid4();
                } else {
                    const entry = await this.forage.getItem(id);
                    if (entry) reject("Duplicate ID");
                }
                await this.forage.setItem<Download>(id, {...download, id: id});
            }

            resolve(undefined);
        });
    }

    insertOne(entry: {id?: string, download: Download}) {
        return new Promise(async (resolve, reject) => {
            let {id, download} = entry;
            if (!id) id = uuid4();
            else {
                const entry = await this.forage.getItem(id);
                if (entry) reject("Duplicate ID");
            }
            await this.forage.setItem<Download>(id, {...download, id: id});
            resolve(undefined);
        });
    }

    async updateOne(_id: string, data: Partial<Download>) {
        const download = await this.findOne(_id);
        if (download) {
            const updated = {
                ...download,
                ...data
            };

            await this.forage.setItem<Download>(_id, updated);
            this.dispatchUpdateEvents(_id, updated);

            return true;
        }
        return false;
    }

    private dispatchUpdateEvents(_id: string, updated: Download) {
        this._onUpdateListeners.map((updateListener) => {
            updateListener(_id, updated);
            return;
        });
    }

    addUpdateListener(_onUpdate: UpdateListener) {
        this._onUpdateListeners.push(_onUpdate);
    }
}