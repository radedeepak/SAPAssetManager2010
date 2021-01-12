export default function FormatWorkCenter(context) {
    return context.read('/SAPAssetManager/Services/AssetManager.service', 'WorkCenters', [], "$filter=WorkCenterId eq '"+ context.binding.WorkCenter + "'").then(function(result) {
        if (result && result.getItem(0)) {
            return result.getItem(0).ExternalWorkCenterId;
        } else {
            return '-';
        }
    });
}
