import React from 'react';
import Paper from '@mui/material/Paper';
import Slide from '@mui/material/Slide';
import '../css/Toast.css';

export default class Toast extends React.Component {
    private timeout : number = 0;
    private _isMounted : boolean;

    constructor(props : {}) {
        super(props);
        this._isMounted = false;
        this.toastEventHandler = this.toastEventHandler.bind(this);
    }

    state = {
        show: false,
        message: "",
        duration: 2000
    }

    componentDidMount() {
        window.addEventListener('toast', this.toastEventHandler, true);

        this._isMounted = true;
    }

    componentWillUnmount() {
        window.removeEventListener('toast', this.toastEventHandler);
        this._isMounted = false;
    }

    toastEventHandler(e : Event) {
        this.setState({...this.state, ...(e as CustomEvent).detail, show: true}, () => {
            this.timeout = window.setTimeout(() => {
                this.handleClose();
            }, this.state.duration);
        });

        
    }

    handleClose() {
        if (this._isMounted) {
            this.setState({show: false});
            clearInterval(this.timeout)
        }
    }

    static toast(message : string = "", duration : number = 2000) {
        const event : CustomEvent = new CustomEvent("toast", {
            detail: {
                message: message,
                duration: duration
            }
        });
        event.stopPropagation();
        window.dispatchEvent(event);
    }
    render() {
        return (
            <div className="toast">
                <Slide in={this.state.show} direction="up">
                    <Paper className="toast-paper" elevation={3}>
                        <div className="toast-body">
                            <p className="toast-body-text">{this.state.message}</p>
                        </div>
                    </Paper>
                </Slide>
            </div>
        );
    }
}