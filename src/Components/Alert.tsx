import React from 'react';
import Paper from '@mui/material/Paper';
import Zoom from '@mui/material/Zoom';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import '../css/Alert.css';

interface IOptions {
    cancelable : boolean;
}

enum ButtonTypesEnum {
    Ok,
    cancel,
}

export type ButtonTypes = keyof typeof ButtonTypesEnum;

interface IButton {
    onClick : Function;
    text : string;
    title : string;
    style? : ButtonTypes;
}
export default class Alert extends React.Component {
    private _isMounted : boolean;

    constructor(props : {}) {
        super(props);
        this._isMounted = false;
    }

    state = {
        show: false,
        cancelable: false,
        options: {
            cancelable: true
        },
        title: "",
        buttons: [],
        message: ""
    }

    componentDidMount() {
        window.addEventListener('alert', this.alertEventHandler.bind(this), true);
        this._isMounted = true;
    }

    componentWillUnmount() {
        window.removeEventListener('alert', this.alertEventHandler);
        this._isMounted = false;
    }

    alertEventHandler(e : Event) {
        this.setState({...this.state, ...(e as CustomEvent).detail, show: true});
    }

    handleClose() {
        if (this._isMounted) {
            setTimeout(() => {
                this.setState({show: false, cancelable: false, buttons: undefined, message: undefined, title: undefined, options: undefined});
            }, 100);
        }
    }

    handleClickAway() {
        if (this._isMounted && this.state.cancelable && this.state.show && this.state.options && this.state.options?.cancelable) {
            this.handleClose();
        } else if (this._isMounted && this.state.cancelable && this.state.show && this.state.options && this.state.options?.cancelable === undefined) {
            this.handleClose();
        }
    }

    static alert(title : string = "", message : string = "", buttons : IButton[] = [], options : IOptions = {cancelable: true}) {
        const event : CustomEvent = new CustomEvent("alert", {
            detail: {
                title: title,
                message: message,
                buttons: buttons,
                options: options
            }
        });
        event.stopPropagation();
        window.dispatchEvent(event);
    }
    render() {
        return (
            
            <div className="alert-presentation" style={{display: this.state.show ? 'block' : 'none', top: `${window.scrollY}px`}}>
                <ClickAwayListener onClickAway={this.handleClickAway.bind(this)}>
                    <div className="alert">
                        <Zoom in={this.state.show} onEntered={() => this.setState({...this.state, cancelable: true})}>
                            <Paper elevation={3}>
                                <div className="alert-header row">
                                    <h3 className="alert-header-text">{this.state.title}</h3>
                                </div>
                                <div className="alert-body">
                                    <p className="alert-body-text">{this.state.message}</p>
                                </div>
                                {this.state.buttons && !this.state.buttons.length ? <div className="alert-buttons row">
                                    <div className="col"></div>
                                    <div className="col">
                                        <div className="row" style={{justifyContent: 'flex-start', marginLeft: '25%'}}>
                                            <Button onClick={() => this.handleClose()}>Ok</Button>
                                        </div>
                                    </div>
                                </div> : <div className="alert-buttons row">
                                    <div className="col">
                                        <div className="row">
                                            {this.state.buttons && this.state.buttons.filter((item : IButton) => !item.style || item.style === "Ok").map((item : IButton, index) => {
                                                return (
                                                    <Button key={index} onClick={() => {
                                                        this.handleClose();
                                                        if (item.onClick) {
                                                            item.onClick();
                                                        }
                                                    }}>{item.text}</Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="row">
                                            {this.state.buttons && this.state.buttons.filter((item : IButton) => item.style === "cancel").map((item : IButton, index) => {
                                                return (
                                                    <Button className="alert-cancel" key={index} onClick={() => {
                                                        this.handleClose();
                                                        if (item.onClick) {
                                                            item.onClick();
                                                        }
                                                    }}>{item.text}</Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>}
                            </Paper>
                        </Zoom>
                    </div>
                </ClickAwayListener>
            </div>
        );
    }
}