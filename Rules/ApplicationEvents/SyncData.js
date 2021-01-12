import DeleteUnusedOverviewEntities from '../Confirmations/Init/DeleteUnusedOverviewEntities';
import setSyncInProgressState from '../Sync/SetSyncInProgressState';

export default function SyncData(clientAPI) {
    return clientAPI.executeAction('/SAPAssetManager/Actions/SyncIntializeMessage.action').then(() => {
    setSyncInProgressState(clientAPI, true);
    return DeleteUnusedOverviewEntities(clientAPI).then( ()=> {
        // MDK's solution to issue https://sapjira.wdf.sap.corp/browse/ICMTANGOAMF10-9879
        return clientAPI.executeAction('/SAPAssetManager/Actions/OData/ReInitializeOfflineOData.action').then( ()=> {
            return clientAPI.executeAction('/SAPAssetManager/Actions/OData/UploadOfflineData.action');
        });
    });
});
}
