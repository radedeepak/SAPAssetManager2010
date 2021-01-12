import InitDefaultOverviewRows from '../Confirmations/Init/InitDefaultOverviewRows';
import setSyncInProgressState from './SetSyncInProgressState';
export default function CheckForSyncErrorsAfterDownloadFailure(context) {
    setSyncInProgressState(context, false);
    return InitDefaultOverviewRows(context).then(() => {
        return context.count('/SAPAssetManager/Services/AssetManager.service', 'ErrorArchive', '').then(result => {
            if (result > 0) {
                context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(0, false);
                context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(1, true);
                context.executeAction('/SAPAssetManager/Actions/SyncErrorBannerMessage.action');
            } else {
                context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(0, true);
                context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(1, false);
                context.executeAction('/SAPAssetManager/Actions/OData/ODataDownloadFailureMessage.action');
            }
        });
    });
}
