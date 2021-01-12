import isSyncInProgress from '../Sync/IsSyncInProgress';

// MDK's solution to issue https://sapjira.wdf.sap.corp/browse/ICMTANGOAMF10-10286
export default function ApplicationOnSync(clientAPI) {
    if (!isSyncInProgress(clientAPI)) {
        return clientAPI.executeAction('/SAPAssetManager/Actions/SyncInitializeProgressBannerMessage.action');
           
    } else {
        return clientAPI.executeAction('/SAPAssetManager/Actions/SyncInProgress.action');
    }
}
