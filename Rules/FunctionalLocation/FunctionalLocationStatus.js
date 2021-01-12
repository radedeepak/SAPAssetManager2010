export default function FunctionalLocationStatus(context) {
    let entitySet = context.binding['@odata.readLink'] +'/SystemStatuses_Nav';
    return context.read('/SAPAssetManager/Services/AssetManager.service', entitySet, [], '$orderby=SequencePriority asc&$top=1').then(function(status) {
        if (status.length > 0 ) {
            let newEntitySet = status.getItem(0)['@odata.readLink'];
            newEntitySet = newEntitySet + '/SystemStatus_Nav';
            return context.read('/SAPAssetManager/Services/AssetManager.service', newEntitySet, [], '').then(function(results) {
                if (results.length > 0 ) {
                        return results.getItem(0).StatusText;
                } else {
                    return '';
                } 
                });
        }  else {
            return '';
        } 
        });
}
