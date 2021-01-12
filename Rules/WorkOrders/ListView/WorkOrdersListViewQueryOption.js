import { WorkOrderLibrary as libWo} from '../WorkOrderLibrary';

export default function WorkOrdersListViewQueryOption(context) {
    let searchString = context.searchString;
    let clockedInString = context.localizeText('clocked_in').substring('Clocked In');
    let lowercaseClockedInString = context.localizeText('clocked_in_lowercase').substring('clocked in');
    let queryBuilder = context.dataQueryBuilder();

    if ((searchString !== '') && (searchString === clockedInString) || (searchString === lowercaseClockedInString)) {
    return context.read('/SAPAssetManager/Services/AssetManager.service', 'UserTimeEntries', ['PreferenceGroup','OrderId', 'WOHeader_Nav/ObjectKey'], '$orderby=PreferenceValue desc&$top=1&$expand=WOHeader_Nav').then(function(results) {
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
    } else if (context.binding.isHighPriorityList) {
        return libWo.getHighPriorityWorkOrdersQueryOptions();
    } else {
        return libWo.getWorkOrdersListViewQueryOptions();
    }
}
