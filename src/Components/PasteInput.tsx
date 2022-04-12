import React, {useState, useEffect} from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import DoneIcon from '@mui/icons-material/Done';
import '../css/PasteInput.css';
import { getClipboardText, isYTURL, vibrate } from '../common/utils';
import Permissions from '../common/permissions';
import Toast from './Toast';

interface PasteInputProps {
    onPaste: (url: string) => void;
    done: boolean;
}

export function PasteInput(props: PasteInputProps) {
    const [url, setURL] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeoutID, setTimeoutID] = useState(0);
    const permissions = new Permissions();

    const onClipboard = (clipText: string) => {
        if (isYTURL(clipText)) {
            setLoading(true);
            Toast.toast("Link Pasted!");
            vibrate(200);
            setURL(clipText);
            props.onPaste(clipText);
        }
    }

    useEffect(() => {
        setLoading(false);
        setURL('');
    }, [props.done]);

    useEffect(() => {
        async function getURL() {
            const clipboardPermission = await permissions.clipboard;
            if (clipboardPermission === true) {
                getClipboardText()
                .then(onClipboard);
            } else {
                if (clipboardPermission === false) return; // use some fallback UI
                permissions.requestPermission('clipboard', getClipboardText)
                .then(async (value) => {
                    if (value) {
                        onClipboard(await value); // please refactor 😭
                    }
                });
            }
        }

        if ('clipboard' in navigator) {
            if (document.hasFocus()) {
                setTimeoutID(window.setTimeout(getURL, 500));
            }
    
            window.addEventListener('focus', getURL);
        }

        return () => {
            clearTimeout(timeoutID);
            window.removeEventListener('focus', getURL);
        }
    }, []);

    return (
        <div className="paste-input">
            <div className="input noselect">
                <input 
                    placeholder='Paste here...'
                    value={url}
                    readOnly={'clipboard' in navigator}
                    onPaste={(event) => {
                        const clipText = event.clipboardData.getData('text');
                        onClipboard(clipText);
                        (event.target as HTMLInputElement).blur();
                    }}
                />
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