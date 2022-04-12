import localforage from "localforage";
import Alert from "../Components/Alert";
import Permissions from './permissions';

export default async function inAppInstall() {
    const installedForage = localforage.createInstance({
        name: process.env.REACT_APP_DB_NAME,
        storeName: 'misc'
    });
    
    if (await installedForage.getItem('installed') !== null) return;

    if (!('onbeforeinstallprompt' in window)) return;
    window.addEventListener('beforeinstallprompt', async (e: any) => {
        e.preventDefault();
        if (await new Permissions().notifications !== true) return;
        const intervalID = setInterval(() => {
            if (!document.hasFocus()) return;
            clearInterval(intervalID);
            Alert.alert(
                "Add to Homescreen",
                "Add our app to your homescreen to get the full experience.",
                [{
                    title: "Install",
                    text: "Install",
                    style: "Ok",
                    onClick: async () => {
                        if ('prompt' in e) {
                            e.prompt();
                            const {outcome} = await e.userChoice;
                            installedForage.setItem("installed", outcome);
                        }
                    }
                }]
            );
            
        }, 5000);
    }, {once: true});
}