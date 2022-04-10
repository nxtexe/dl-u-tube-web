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
    private _onUpdateListeners = new Map<string, UpdateListener>();
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
    /**
     * Inspired by MongoDB find operator
     * @param comparator A list of IDs or an object that implements a subset of the Download interface
     * @param startFrom Start index of retrieval
     * @param limit Max items to retrieve
     */
    async find(comparator?: Partial<Download>, startFrom?: number, limit?: number): Promise<[Download[], number | undefined]>;
    async find(comparator?: string[], startFrom?: number, limit?: number): Promise<[Download[], number | undefined]>;
    async find(comparator?: string[] | Partial<Download>, startFrom?: number, limit?: number): Promise<[Download[], number | undefined]> {
        const length = await this.forage.length();
        if (!startFrom) startFrom = 0;
        if (startFrom > length) throw (new Error("Range Error"));

        if (Array.isArray(comparator) || !comparator) {
            if (!comparator || !comparator.length) {
                if (!limit) limit = Math.min(length, startFrom + 10);
                limit = Math.min(length, limit);
            } else {
                limit = length; // if comparator are specified then iterate all records
            }

            const values: Download[] = [];
            await this.forage.iterate(function (download: Download, _id: string, index: number) {
                if (startFrom === undefined || limit === undefined) return _id;
                if (values.length < limit) {
                    if (index - 1 < startFrom) return;
                    if (!comparator || !comparator.length) {
                        if (download) values.push(download);
                    } else {
                        if (comparator.includes(_id)) {
                            values.push(download);
                        }
                    }
                    
                    return undefined;
                } else {
                    return _id; // exit iteration
                }
            } as any);

            const next = startFrom + limit < length && values.length === limit ? startFrom + limit : undefined;
            return [values, next];
        } else {
            if (!limit) limit = Math.min(length, startFrom + 10);
            limit = Math.min(length, limit);

            const values: Download[] = [];
            await this.forage.iterate(function (download: Download, _id: string, index: number) {
                if (startFrom === undefined || limit === undefined) return _id;
                if (values.length < limit) {
                    if (index - 1 < startFrom) return;
                    
                    for (const _key of Object.keys(comparator)) { // check if all keys and values match else skip to next item
                        const key = _key as keyof Partial<Download>;
                        if (comparator[key] !== download[key]) return;
                    }
                    
                    values.push(download);
                    
                    return undefined;
                } else {
                    return _id; // exit iteration
                }
            } as any);

            const next = startFrom + limit < length && values.length === limit ? startFrom + limit : undefined;
            return [values, next];
        }
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
        for (const listener of this._onUpdateListeners.values()) {
            listener(_id, updated);
        }
    }

    addUpdateListener(_onUpdate: UpdateListener) {
        const name = `${_onUpdate.name}-${_onUpdate.toString()}`;
        this._onUpdateListeners.set(name, _onUpdate);
    }
    
    removeUpdateListener(_onUpdate: UpdateListener) {
        this._onUpdateListeners.delete(_onUpdate.name);
    }
}