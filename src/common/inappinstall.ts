import localforage from "localforage";
import Alert from "../Components/Alert";

export default async function inAppInstall() {
    // const installedForage = localforage.createInstance({
    //     name: process.env.REACT_APP_DB_NAME,
    //     storeName: 'misc'
    // });

    // const installPrompt = await installedForage.getItem<any>('installprompt');
    // if (installPrompt) {
    //     Alert.alert(
    //         "Install Our App",
    //         "Your browser supports installing this app to the homescreen. Consider installing for easier access.",
    //         [
    //             {
    //                 text: "Install",
    //                 title: "Install",
    //                 style: "Ok",
    //                 onClick: async () => {
    //                     installPrompt .prompt();
    //                     const {outcome} = await installPrompt.userChoice;
    //                     installedForage.setItem("installed", outcome);
    //                     installedForage.setItem("installprompt", false);
    //                 }
    //             },
    //             {
    //                 text: "Cancel",
    //                 title: "Cancel",
    //                 style: 'cancel',
    //                 onClick: () => {}
    //             }
    //         ],
    //         {cancelable: false}
    //     );
    // } else {
    //     if (installPrompt === false || !('onbeforeinstallprompt' in window)) return;
    //     window.addEventListener('beforeinstallprompt', (e) => {
    //         e.preventDefault();
    //         installedForage.setItem('installprompt', e);
    //     });

    // }
    
    
}