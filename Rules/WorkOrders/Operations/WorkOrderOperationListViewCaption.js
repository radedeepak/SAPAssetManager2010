import queryOptions from './WorkOrderOperationsListViewQueryOption';
import CommonLibrary from '../../Common/Library/CommonLibrary';
import libVal from '../../Common/Library/ValidationLibrary';

export default function WorkOrderOperationListViewCaption(context) {

    var entitySet;
    var queryOption;
    var localizeText;
    var localizeText_x_x;
    var totalCountPromise = 0;
    var countPromise = 0;
    var params = [];

    var parameters = CommonLibrary.getStateVariable(context,'OPERATIONS_FILTER');

    if (!libVal.evalIsEmpty(parameters)) {
        entitySet = parameters.entity;
        queryOption = parameters.query;
        localizeText = parameters.localizeText;
        localizeText_x_x = parameters.localizeTextXX;
    
    } else {

        if (CommonLibrary.isDefined(context.binding['@odata.readLink'])) {
            entitySet = context.binding['@odata.readLink'] + '/Operations';
            queryOption = queryOptions(context);
            
            if ((CommonLibrary.getWorkOrderAssignmentType(context) === '3') || (CommonLibrary.getWorkOrderAssignmentType(context) === '2') || 
            (CommonLibrary.getWorkOrderAssignmentType(context) === '6')||(CommonLibrary.getWorkOrderAssignmentType(context) === '4')) { 
                entitySet = 'MyWorkOrderOperations';
            } else {
                entitySet = context.binding['@odata.readLink'] + '/Operations';
            }

            queryOption = libVal.evalIsEmpty(context.actionResults.filterResult) ? '' : context.actionResults.filterResult.data.filter;
            localizeText = 'operations_x';
            localizeText_x_x = 'operations_x_x';
            totalCountPromise = context.count('/SAPAssetManager/Services/AssetManager.service',entitySet, '');
            countPromise = context.count('/SAPAssetManager/Services/AssetManager.service',entitySet,queryOption);
        }
    }

    totalCountPromise = context.count('/SAPAssetManager/Services/AssetManager.service',entitySet, '');
    countPromise = context.count('/SAPAssetManager/Services/AssetManager.service',entitySet,queryOption);

    return Promise.all([totalCountPromise, countPromise]).then(function(resultsArray) {
        let totalCount = resultsArray[0];
        let count = resultsArray[1];
        params.push(count);
        params.push(totalCount);
        if (count === totalCount) {
            return context.localizeText(localizeText, [totalCount]);
        }
        return context.localizeText(localizeText_x_x, params);
    });
}
