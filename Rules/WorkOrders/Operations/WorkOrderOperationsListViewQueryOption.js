import { OperationConstants as Constants } from './WorkOrderOperationLibrary';
import CommonLibrary from '../../Common/Library/CommonLibrary';

export default function WorkOrderOperationsListViewQueryOption(context) {
    let searchString = context.searchString;
    let clockedInString = context.localizeText('clocked_in').substring('Clocked In');
    let lowercaseClockedInString = context.localizeText('clocked_in_lowercase').substring('clocked in');
    

    if ((searchString !== '') && (searchString === clockedInString) || (searchString === lowercaseClockedInString)) {
    let queryBuilder = context.dataQueryBuilder();
    return context.read('/SAPAssetManager/Services/AssetManager.service', 'UserTimeEntries', ['PreferenceGroup','OrderId','OperationNo','WOHeader_Nav/ObjectKey','WOOperation_Nav/ObjectKey'], '$orderby=PreferenceValue desc&$top=1&$expand=WOHeader_Nav,WOOperation_Nav').then(function(results) {
        if (results && results.length > 0) {
            let row = results.getItem(0);
            if (row.PreferenceGroup === 'CLOCK_IN') {
                queryBuilder.expand('UserTimeEntry_Nav');
                queryBuilder.filter(`OrderId eq '${row.OrderId}'`);
                return queryBuilder;
            }
            return queryBuilder(''); 
        }
        return queryBuilder(''); 
    }).catch(() => {
        return queryBuilder(''); //Read failure so return a blank string
    });
} else if (CommonLibrary.isDefined(context.binding['@odata.type']) &&  context.binding['@odata.type'] === '#sap_mobile.MyWorkOrderHeader') {
        return Constants.OperationListQueryOptions;
    } else {
        return Constants.FromWOrkOrderOperationListQueryOptions;
    }
}
