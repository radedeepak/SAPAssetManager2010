import libCommon from '../Common/Library/CommonLibrary';
import { WorkOrderLibrary as libWo} from './WorkOrderLibrary';

export default function WorkOrderListViewSetCaption(context) {

    let queryOption = libCommon.getStateVariable(context,'WORKORDER_FILTER');
    if (context.binding.isHighPriorityList ) {
        if (queryOption !== '$filter=') {
            queryOption = queryOption + " and (Priority eq '1' or  Priority eq '2')";
        } else {
            queryOption = libWo.getFilterForHighPriorityWorkorders();
        }
    }
    var params = [];
    let totalCountPromise = context.count('/SAPAssetManager/Services/AssetManager.service','MyWorkOrderHeaders', '');
    let countPromise = context.count('/SAPAssetManager/Services/AssetManager.service','MyWorkOrderHeaders',queryOption);

    return Promise.all([totalCountPromise, countPromise]).then(function(resultsArray) {
        let totalCount = resultsArray[0];
        let count = resultsArray[1];
        params.push(count);
        params.push(totalCount);
        if (count === totalCount) {
            return context.setCaption(context.localizeText('work_order_x', [totalCount]));
        }
        return context.setCaption(context.localizeText('work_order_x_x', params));
    });
}
