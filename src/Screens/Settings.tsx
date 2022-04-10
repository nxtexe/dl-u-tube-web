import React from 'react';
import { Motion, Navigation, SharedElement } from 'react-motion-router';
import {ReactComponent as BGElement} from '../assets/BGElement.svg';
import {Nav} from '../Components';
import LogoButton from '../Components/LogoButton';
import {Switch} from '../Components';
import '../css/Settings.css';
import localforage from 'localforage';
import Permissions from '../common/permissions';
import Alert from '../Components/Alert';


export interface NotificationPreferences {
    downloads_finish?: boolean | null;
    update_available?: boolean | null;
}

interface SettingsProps {
    navigation: Navigation;
}

interface SettingsState {
    notifications: NotificationPreferences;
}

export class Settings extends React.Component<SettingsProps, SettingsState> {
    private permissions = new Permissions();
    private preferencesForage = localforage.createInstance({
        name: process.env.REACT_APP_DB_NAME,
        storeName: 'preferences'
    });

    constructor(props: SettingsProps) {
        super(props);
        this.onSwitchChange = this.onSwitchChange.bind(this);
        
        
    }

    state: SettingsState = {
        notifications: {}
    }

    componentDidMount() {
        this.preferencesForage.getItem<NotificationPreferences>("notifications")
        .then((notifications) => {
            this.setState({
                notifications: notifications || {}
            });
        });
    }

    async onSwitchChange(event: React.ChangeEvent<HTMLInputElement>, checked: boolean) {
        const notificationPermissions = await this.permissions.notifications;
        if (notificationPermissions === null) {
            try {
                await this.permissions.requestPermission('notification', (): Promise<void> => {
                    return new Promise(async (resolve, reject) => {
                        const permission = await Notification.requestPermission();
                        if (permission === "denied") reject();
                        else resolve();
                    });
                });
            } catch (e) {
                return;
            }
        } else if (notificationPermissions === false) {
            Alert.alert(
                "Enable Notifications",
                "For us to send you notifications we need you to enable notifications in the site settings for your browser."
            );
            return;
        }
        const notificationPreferences = await this.preferencesForage.getItem<NotificationPreferences>("notifications");
        this.preferencesForage.setItem<NotificationPreferences>("notifications", {
            ...(notificationPreferences || {}),
            [event.target.name.replace('-', '_')]: checked
        });

        this.setState({
            notifications: {
                ...this.state.notifications,
                [event.target.name.replace('-', '_')]: checked
            }
        });
    }

    render() {
        return (
            <div className="settings screen-grid">
                <div className="banner">
                    <LogoButton onClick={() => this.props.navigation.goBack()} />
                    <SharedElement id="page-title">
                        <h3>Settings</h3>
                    </SharedElement>
                </div>
                <div className='content'>
                    <div className="notifications">
                        <p className="title">Notify Me When</p>
                        <div className="option">
                            <p className="option-title">Downloads Finish</p>
                            <Switch
                                checked={Boolean(this.state.notifications.downloads_finish)}
                                onChange={this.onSwitchChange}
                                name="downloads-finish"
                            />
                        </div>
                        <div className="option">
                            <p className="option-title">Update Available</p>
                            <Switch
                                checked={Boolean(this.state.notifications.update_available)}
                                onChange={this.onSwitchChange}
                                name="update-available"
                             />
                        </div>
                    </div>
                </div>
                <Motion.Consumer>
                    {(progress) => 
                        <div className="bg-element" style={{
                            transform: `translate(-${(progress / 100) * 30}%, 0%) rotate(${(progress / 100) * 156}deg)`
                        }}>
                            <BGElement width={600} viewBox='0 0 560 273' />
                        </div>
                    }
                </Motion.Consumer>
                <Nav
                    navigation={this.props.navigation}
                />
            </div>
        );
    }
}

export default Settings;