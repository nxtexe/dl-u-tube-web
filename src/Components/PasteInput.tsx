import React, {useState, useEffect} from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import DoneIcon from '@mui/icons-material/Done';
import '../css/PasteInput.css';
import { getClipboardText, isYTURL } from '../common/utils';
import Permissions from '../common/permissions';
import Toast from './Toast';

interface PasteInputProps {
    onPaste: (url: string) => void;
    done: boolean;
}

export function PasteInput(props: PasteInputProps) {
    const [url, setURL] = useState('');
    const [loading, setLoading] = useState(false);
    const permissions = new Permissions();

    useEffect(() => {
        const onClipboard = (clipText: string) => {
            if (isYTURL(clipText)) {
                setLoading(true);
                Toast.toast("Link Pasted!");
                navigator.vibrate(200);
                setURL(clipText);
                props.onPaste(clipText);
            }
        }
        async function getURL() {
            if (await permissions.clipboard) {
                getClipboardText()
                .then(onClipboard);
            } else {
                permissions.requestPermission('clipboard', getClipboardText)
                .then(async (value) => {
                    if (value) {
                        onClipboard(await value); // please refactor 😭
                    }
                });
            }
        }

        if (document.hasFocus()) {
            getURL();
        }

        window.addEventListener('focus', getURL);

        return () => {
            window.removeEventListener('focus', getURL);
        }
    }, []);

    return (
        <div className="paste-input">
            <div className="input">
                <input placeholder='Paste here...' value={url} readOnly />
            </div>
            <div className="adornment">
                {(!loading && !props.done) && <SearchIcon />}
                {(loading && !props.done) && <CircularProgress />}
                {props.done && <DoneIcon style={{color: 'var(--success-main)'}} />}
            </div>
        </div>
    );
}

export default PasteInput;