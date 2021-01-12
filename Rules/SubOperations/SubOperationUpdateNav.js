import libCommon from '../Common/Library/CommonLibrary';

export default function SubOperationUpdateNav(context) {
    //Set the global TransactionType variable to UPDATE
    libCommon.setOnCreateUpdateFlag(context, 'UPDATE');
    return libCommon.navigateOnRead(context, '/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationCreateUpdateNav.action', context.getBindingObject()['@odata.readLink'], '$select=*,EquipmentSubOperation/EquipId,FunctionalLocationSubOperation/FuncLocIdIntern,WorkOrderOperation/WOHeader/OrderId&$expand=EquipmentSubOperation,FunctionalLocationSubOperation,WorkOrderOperation/WOHeader');
}
