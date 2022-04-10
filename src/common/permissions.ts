import localforage from "localforage"
import Alert from '../Components/Alert';

enum PermissionsEnum {
    clipboard,
    notification
}

type PermissionType = keyof typeof PermissionsEnum;

export default class Permissions {
    private static permissionsForage = localforage.createInstance({
        name: process.env.REACT_APP_DB_NAME,
        storeName: 'permissions'
    });

    get clipboard(): Promise<boolean | null> {
        return new Promise((resolve) => {
            Permissions.permissionsForage.getItem<boolean>('clipboard')
            .then((clipboardPermission) => {
                resolve(clipboardPermission);
            });
        });
    }

    get notifications(): Promise<boolean | null> {
        return new Promise((resolve) => {
           Permissions.permissionsForage.getItem<boolean>('notification')
           .then((notificationPermission) => {
               resolve(notificationPermission);
           }); 
        });
    }

    requestPermission<T extends (...args: any) => any>(permission: PermissionType, resolveEntity?: T): Promise<ReturnType<T> | void> {
        let title = '';
        let message = '';
        return new Promise((resolve, reject) => {
            switch(permission) {
                case "clipboard":
                    title = "Clipboard Permission";    
                    message = "For a more streamlined experience we need access to your clipboard."
                break;
                
                case "notification":
                    title = "Notification Permission";
                    message = "Allow us to send you notifications.";
                break;
            
            }

            Alert.alert(
                title,
                message,
                [
                    {
                        text: 'Ok',
                        title: 'Ok',
                        style: "Ok",
                        onClick: async () => {
                            if (resolveEntity) {
                                try {
                                    resolve(await resolveEntity());
                                    Permissions.permissionsForage.setItem(permission, true);
                                } catch (e) {
                                    Permissions.permissionsForage.setItem(permission, false);
                                    reject(e);
                                }
                            }
                            else resolve();
                        }
                    }
                ],
                {
                    cancelable: false
                }
            );
        });
    }
}