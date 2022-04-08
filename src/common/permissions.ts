import localforage from "localforage"
import Alert from '../Components/Alert';

enum PermissionsEnum {
    clipboard
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

    requestPermission<T extends (...args: any) => any>(permission: PermissionType, resolveEntity?: T): Promise<ReturnType<T> | void> {
        return new Promise((resolve, reject) => {
            switch(permission) {
                case "clipboard":
                    Alert.alert(
                        "Clipboard Permission",
                        "For a more streamlined experience we need access to your clipboard.",
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
                    break;
            }
        });
    }
}