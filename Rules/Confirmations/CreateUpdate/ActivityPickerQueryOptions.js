import QueryBuilder from '../../Common/Query/QueryBuilder';
import libCom from '../../Common/Library/CommonLibrary';
import libVal from '../../Common/Library/ValidationLibrary';

export default function ActivityPickerQueryOptions(context) {
    let queryBuilder = new QueryBuilder();
    let workOrder = libCom.getListPickerValue(libCom.getTargetPathValue(context, '#Control:WorkOrderLstPkr/#Value'));
    let operation = libCom.getListPickerValue(libCom.getTargetPathValue(context, '#Control:OperationPkr/#Value'));
    if ((libVal.evalIsEmpty(workOrder)) && (libVal.evalIsEmpty(operation))) {
        workOrder = context.binding.OrderID;
        operation = context.binding.Operation;
    }
    if ((!libVal.evalIsEmpty(workOrder)) && (!libVal.evalIsEmpty(operation))) {
        return context.read('/SAPAssetManager/Services/AssetManager.service', `MyWorkOrderOperations(OrderId='${workOrder}',OperationNo='${operation}')`, [], '$expand=WOHeader&$select=ActivityType,WorkCenterInternalId,WOHeader/WorkCenterInternalId,WOHeader/MainWorkCenterPlant,WOHeader/MaintenancePlant,WOHeader/PlanningPlant,WOHeader/CostCenter,WOHeader/ControllingArea').then(function(data) {
            if (data.getItem(0)) {
                context.getClientData().DefaultActivityType = data.getItem(0).ActivityType;
                let workCenter = '';
                if (!libVal.evalIsEmpty(data.getItem(0).WorkCenterInternalId)) {
                    workCenter = data.getItem(0).WorkCenterInternalId;
                } else if (!libVal.evalIsEmpty(data.getItem(0).WOHeader.WorkCenterInternalId)) {
                    workCenter = data.getItem(0).WOHeader.WorkCenterInternalId;
                } else if (!libVal.evalIsEmpty(data.getItem(0).WOHeader.CostCenter) && !libVal.evalIsEmpty(data.getItem(0).WOHeader.ControllingArea)) {
                    queryBuilder.addFilter(`CostCenter eq '${data.getItem(0).WOHeader.CostCenter}'`);
                    queryBuilder.addFilter(`ControllingArea eq '${data.getItem(0).WOHeader.ControllingArea}'`);
                }

                if (!libVal.evalIsEmpty(workCenter)) {
                    return context.read('/SAPAssetManager/Services/AssetManager.service', `WorkCenters(WorkCenterId='${workCenter}',ObjectType='A')`, [], '$select=CostCenter,ControllingArea').then(function(result) {
                        if (!libVal.evalIsEmpty(result)) {
                            if (!libVal.evalIsEmpty(result.getItem(0).CostCenter)) {
                                queryBuilder.addFilter(`CostCenter eq '${result.getItem(0).CostCenter}'`);
                            }
                            if (!libVal.evalIsEmpty(result.getItem(0).ControllingArea)) {
                                queryBuilder.addFilter(`ControllingArea eq '${result.getItem(0).ControllingArea}'`);
                            }
                        } 
                        queryBuilder.addExtra('orderby=ActivityType asc');  
                        return queryBuilder.build();
                    });
                }
            }
            queryBuilder.addExtra('orderby=ActivityType asc');  
            return queryBuilder.build();
        });
    } else {
        queryBuilder.addExtra('orderby=ActivityType asc');    
        return queryBuilder.build();
    }
}
