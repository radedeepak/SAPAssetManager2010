export default function DiscardErrorAction(context) {
    return context.executeAction('/SAPAssetManager/Actions/DiscardErrorWarningMessage.action').then(result => {
        if (result.data === true) {
            return context.executeAction('/SAPAssetManager/Actions/Common/ErrorArchiveDiscard.action').then( ()=> {
                return context.count('/SAPAssetManager/Services/AssetManager.service', 'ErrorArchive', '').then(errorCount => {
                    if (errorCount > 0) {
                        context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(0, false);
                        context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(1, true);
                    } else {
                        context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(0, true);
                        context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(1, false);
                    }
                    return Promise.resolve();
                });
            });
        }
        return Promise.resolve();
    });
}
