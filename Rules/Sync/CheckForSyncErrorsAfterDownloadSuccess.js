import libCom from '../Common/Library/CommonLibrary';
import {DeltaSyncInit} from '../Common/InitializeGlobalStates';
import CreateDefaultOverviewRowEntities from '../Confirmations/Init/CreateDefaultOverviewRowEntities';
import setSyncInProgressState from './SetSyncInProgressState';
import getPendingPushState from '../PushNotifications/GetPushNotificationsPendingState';
import setPendingPushState from '../PushNotifications/SetPushNotificationsPendingState';

import downloadPush from '../PushNotifications/PushNotificationsDownload';

export default function CheckForSyncErrorsAfterDownloadSuccess(context) {
    setSyncInProgressState(context, false);
    // If there are pending Pushes, execute those
    if (getPendingPushState(context)) {
        // If there are pending pushes then we set the "PendingPush" state to false
        // and set the "SyncInProgress" state to true again and download the Push
        setPendingPushState(context, false);
        setSyncInProgressState(context, true);
        downloadPush(context, libCom.getStateVariable(context, 'ObjectType'));
    }
    return context.count('/SAPAssetManager/Services/AssetManager.service', 'ErrorArchive', '').then(result => {
            if (result > 0) {
                context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(0, false);
                context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(1, true);
                return context.executeAction('/SAPAssetManager/Actions/SyncErrorBannerMessage.action').then(function() {
                    return Promise.reject(false);
                });
            } else {
                context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(0, true);
                context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(1, false);
                return DeltaSyncInit(context).then(() => {
                    return CreateDefaultOverviewRowEntities(context).then(() => {
                        context.nativescript.appSettingsModule.setBoolean('didSetUserGeneralInfos', true);
                        return context.executeAction('/SAPAssetManager/Actions/SyncSuccessMessage.action');
                    });
                });
            }
    });
}
