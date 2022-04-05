import React, {useState, useEffect} from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import DoneIcon from '@mui/icons-material/Done';
import '../css/PasteInput.css';
import { getClipboardText, isYTURL } from '../common/utils';
import Toast from './Toast';

interface PasteInputProps {
    onPaste: (url: string) => void;
    done: boolean;
}

export function PasteInput(props: PasteInputProps) {
    const [url, setURL] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        function getURL() {
            getClipboardText()
            .then(clipText => {
                setLoading(true);
                if (isYTURL(clipText)) {
                    Toast.toast("Link Pasted!");
                    navigator.vibrate(200);
                    setURL(clipText);
                    props.onPaste(clipText);
                }
            });
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