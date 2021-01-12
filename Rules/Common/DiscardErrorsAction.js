export default function DiscardErrorsAction(context) {
    return context.read('/SAPAssetManager/Services/AssetManager.service', 'ErrorArchive', [] ,'').then(function(results) {
        if (results && results.length > 0) {
            return context.getPageProxy().executeAction('/SAPAssetManager/Actions/Common/ErrorArchiveDiscardNoClosePage.action').then( ()=> {
                return DiscardErrorsAction(context);
            });
        }
        context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(0, true);
        context.evaluateTargetPathForAPI('#Page:OverviewPage').setActionBarItemVisible(1, false);
        return context.getPageProxy().executeAction('/SAPAssetManager/Actions/Page/ClosePage.action');
    });
}
