import React, {useState, useEffect} from 'react';
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronUpIcon from '@mui/icons-material/KeyboardArrowUp';
import '../css/Dropdown.css';
import localforage from 'localforage';

interface DropdownProps {
    disabled: boolean;
    onChange: (value: "mp3" | "mp4") => void;
}

export function Dropdown(props: DropdownProps) {
    const preferencesForage = localforage.createInstance({
        name: process.env.REACT_APP_DB_NAME,
        storeName: 'preferences'
    });
    const [value, setValue] = useState('mp3');
    const [open, setOpen] = useState(false);

    const onClick = (value: "mp3" | "mp4") => {
        preferencesForage.setItem('filetype', value);
        setValue(value);
        setOpen(false);
        props.onChange(value);
    }

    useEffect(() => {
        preferencesForage.getItem<"mp3" | "mp4">('filetype')
        .then((value) => {
            if (value) {
                setValue(value);
                props.onChange(value);
            }
        });
    }, []);
    return (
        <div className={`dropdown ${open ? 'open' : ''} ${props.disabled ? 'disabled' : ''}`}>
            <div className="top" onClick={() => {if (!props.disabled) setOpen(!open)}}>
                <small>{value.toUpperCase()}</small>
                {!open && <ChevronDownIcon />}
                {open && <ChevronUpIcon />}
            </div>
            <ul>
                <li value="mp3" style={{
                    backgroundColor: value === 'mp3' ? 'var(--primary-main)' : ''
                }} onClick={onClick.bind(null, "mp3") as React.MouseEventHandler<HTMLLIElement>}>MP3</li>
                <li value="mp4" style={{
                    backgroundColor: value === 'mp4' ? 'var(--primary-main)' : ''
                }} onClick={onClick.bind(null, "mp4") as React.MouseEventHandler<HTMLLIElement>}>MP4</li>
            </ul>
        </div>
    );
}

export default Dropdown;