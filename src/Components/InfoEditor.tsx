import React, {useState, useEffect} from 'react';
import { InputAdornment } from '@mui/material';
import TextField from '@mui/material/OutlinedInput';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import { VideoResult } from '../common/types';
import '../css/InfoEditor.css';

interface InfoEditorProps {
    onChange: (result: VideoResult) => void;
    info?: VideoResult;
    open: boolean;
    undo: boolean;
}

export function InfoEditor(props: InfoEditorProps) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [coverArt, setCoverArt] = useState('...');
    const inputRef = React.createRef<HTMLInputElement>();

    useEffect(() => {
        setTitle(props.info?.title || '');
        setAuthor(props.info?.author || '');
        setCoverArt('...')
    }, [props.open, props.undo]);

    function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setTitle(e.target.value);
        if (!props.info) return;
        props.onChange({
            ...props.info,
            title: e.target.value
        });
    }

    function onAuthorChange(e: React.ChangeEvent<HTMLInputElement>) {
        setAuthor(e.target.value);
        if (!props.info) return;
        props.onChange({
            ...props.info,
            author: e.target.value
        });
    }

    async function onChangeImage() {
        if (!inputRef.current) return;
        inputRef.current.click();
        inputRef.current.onchange = () => {
            if (!inputRef.current) return;
            if (inputRef.current.files?.length) {
                const [file] = inputRef.current.files;
                setCoverArt(file.name);
                if (!props.info) return;
                props.onChange({
                    ...props.info,
                    coverArt: URL.createObjectURL(file),
                    coverArtFile: file
                });
            }
        }
    }
    return (
        <div className="info-editor">
            <div className="title">
                <TextField
                    value={title}
                    onChange={onTitleChange}
                    endAdornment={
                        <InputAdornment position="end">
                            <EditIcon />
                        </InputAdornment>
                    } 
                    startAdornment={
                        <InputAdornment position="start">
                            <PersonIcon />
                        </InputAdornment>
                    }
                />
            </div>
            <div className="author">
                <TextField
                    value={author}
                    onChange={onAuthorChange}
                    endAdornment={
                        <InputAdornment position="end">
                            <EditIcon />
                        </InputAdornment>
                    } 
                    startAdornment={
                        <InputAdornment position="start">
                            <FileIcon />
                        </InputAdornment>
                    }
                />
            </div>
            <div className="cover-art">
                <TextField
                    onClick={onChangeImage}
                    value={coverArt}
                    endAdornment={
                        <InputAdornment position="end">
                            <EditIcon />
                        </InputAdornment>
                    } 
                    startAdornment={
                        <InputAdornment position="start">
                            <ImageIcon />
                        </InputAdornment>
                    }
                    inputProps={{readOnly: true}} 
                />
                <input ref={inputRef} type="file" accept='image/png' hidden />
            </div>
        </div>
    );
}

export default InfoEditor;