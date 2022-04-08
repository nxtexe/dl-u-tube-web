import localforage from "localforage"
import Alert from '../Components/Alert';
import { getClipboardText } from "./utils";
enum PermissionsEnum {
    clipboard
}

type PermissionType = keyof typeof PermissionsEnum;

export default class Permissions {
    private static permissionsForage = localforage.createInstance({
        name: process.env.REACT_APP_DB_NAME,
        storeName: 'permissions'
    });

    get clipboard(): Promise<boolean> {
        return new Promise((resolve) => {
            Permissions.permissionsForage.getItem<boolean>('clipboard')
            .then((clipboardPermission) => {
                resolve(Boolean(clipboardPermission));
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
                                    Permissions.permissionsForage.setItem(permission, true);
                                    if (resolveEntity) {
                                        resolve(resolveEntity());
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