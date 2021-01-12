import libCommon from '../../Common/Library/CommonLibrary';

export default function WorkOrderOperationUpdateNav(context) {
    //Set the global TransactionType variable to UPDATE
    libCommon.setOnCreateUpdateFlag(context, 'UPDATE');

    return libCommon.navigateOnRead(context, '/SAPAssetManager/Actions/WorkOrders/Operations/WorkOrderOperationCreateUpdateNav.action', context.getBindingObject()['@odata.readLink'], '$select=*,EquipmentOperation/EquipId,FunctionalLocationOperation/FuncLocIdIntern&$expand=EquipmentOperation,FunctionalLocationOperation');
}
