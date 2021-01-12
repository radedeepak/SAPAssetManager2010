import Logger from '../Log/Logger';


export default function ApplicationOnWillUpdate(clientAPI) {
    const title = clientAPI.localizeText('confirm_check');
    const message = clientAPI.localizeText('check_for_update_message');
    const ok = clientAPI.localizeText('ok');
    const cancel = clientAPI.localizeText('later');

    return clientAPI.nativescript.uiDialogsModule.confirm({
        title: title,
        message: message,
        okButtonText: ok,
        cancelButtonText: cancel,
        cancelable: false,
    }).then((result) => {
        /**Implementing our Logger class*/
        Logger.debug('APPLICATION ON WILLUPDATE','Update now? ' + result);
        if (result === true) {
            return clientAPI.executeAction('/SAPAssetManager/Actions/OData/CloseOfflineOData.action').then((success) => {
                return Promise.resolve(success);
            }).catch((failure) => {
                Logger.error('ApplicationOnWillUpdateFailure', failure);
                Promise.reject(clientAPI.localizeText('offline_odata_close_failed'));
            });
        } else {
            return Promise.reject(clientAPI.localizeText('user_deferred'));
        }
    });
}
