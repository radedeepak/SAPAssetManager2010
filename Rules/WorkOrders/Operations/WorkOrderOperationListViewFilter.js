import queryOptions from './WorkOrderOperationsListViewQueryOption';
import CommonLibrary from '../../Common/Library/CommonLibrary';
import libVal from '../../Common/Library/ValidationLibrary';
import IsOperationLevelAssigmentType from './IsOperationLevelAssigmentType';
import ListViewSetCaption from './WorkOrderOperationListViewSetCaption';

export default function WorkOrderOperationListViewFilter(context) {
    var entitySet;
    var queryOption;
    var localizeText;
    var localizeText_x_x;
    var filterText = libVal.evalIsEmpty(context.actionResults.filterResult) ? '' : context.actionResults.filterResult.data.filter;

    if (CommonLibrary.isDefined(context.binding['@odata.readLink'])) {
        switch (context.binding['@odata.readLink'].split('(')[0]) {
            case 'MyWorkOrderHeaders':
                entitySet = context.binding['@odata.readLink'] + '/Operations';
                queryOption = queryOptions(context);
                localizeText = 'operations_x';
                localizeText_x_x = 'operations_x_x';
                break;
            default:
                break;

        } 
    } else {
        if (IsOperationLevelAssigmentType(context)) {
            entitySet = 'MyWorkOrderOperations';
            queryOption = libVal.evalIsEmpty(context.actionResults.filterResult) ? '' : context.actionResults.filterResult.data.filter;
            localizeText = 'operations_x';
            localizeText_x_x = 'operations_x_x';
        }
    }
    
    queryOption = queryOption + '&' + filterText;
    CommonLibrary.setStateVariable(context,'OPERATIONS_FILTER', {entity: entitySet, query: queryOption, localizeTextX: localizeText, localizeTextXX: localizeText_x_x});
    return ListViewSetCaption(context);
}
