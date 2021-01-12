import Logger from '../Log/Logger';
/**
 * Query options for the MyEquipments entityset shown on the equipment list view page.
 * @param context The PageProxy object.
 */
export default function EquipmentQueryOptions(context) {
    Logger.info(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryEquipment.global').getValue(), 'OData read called');
    //"#sap_mobile.MyWorkOrderHeader"
    let binding = context.binding;
    if (binding && binding['@odata.type'] === '#sap_mobile.MyWorkOrderHeader') {
        return `$expand=WorkCenter_Main_Nav&$filter=(WorkOrderHeader/any( wo: wo/OrderId eq '${binding.OrderId}' ) or WorkOrderOperation/WOHeader/any(wo: wo/OrderId eq '${binding.OrderId}' ) or WorkOrderSubOperation/WorkOrderOperation/WOHeader/any( wo: wo/OrderId eq '${binding.OrderId}' ))`;
    }
    if (binding && binding['@odata.type'] === '#sap_mobile.MyFunctionalLocation') {
        return '';
    }
    let searchString = context.searchString;
    if (searchString) {
        let qob = context.dataQueryBuilder();
        qob.expand('ObjectStatus_Nav/SystemStatus_Nav,EquipDocuments,EquipDocuments/Document,WorkOrderHeader,WorkCenter_Main_Nav').orderBy('EquipId').select('ObjectStatus_Nav/SystemStatus_Nav/StatusText,WorkOrderHeader/OrderId,EquipDesc,EquipId,PlanningPlant,MaintPlant,WorkCenter');
        let filters = [
            `substringof('${searchString.toLowerCase()}', tolower(EquipDesc))`,
            `substringof('${searchString.toLowerCase()}', tolower(WorkCenter_Main_Nav/PlantId))`,
            `substringof('${searchString.toLowerCase()}', tolower(WorkCenter_Main_Nav/WorkCenterDescr))`,
            `substringof('${searchString.toLowerCase()}', tolower(EquipId))`,
            `substringof('${searchString.toLowerCase()}', tolower(WorkCenter_Main_Nav/WorkCenterName))`,
            `substringof('${searchString.toLowerCase()}', tolower(WorkCenter_Main_Nav/ExternalWorkCenterId))`,
        ];
        qob.filter(filters.join(' or '));
        return qob;
    } else {
        return '$select=ObjectStatus_Nav/SystemStatus_Nav/StatusText,WorkOrderHeader/OrderId,EquipDesc,EquipId,PlanningPlant,MaintPlant,WorkCenter' +
            '&$orderby=EquipId' +
            '&$expand=ObjectStatus_Nav/SystemStatus_Nav,EquipDocuments,EquipDocuments/Document,WorkOrderHeader,WorkCenter_Main_Nav';
    }
}
