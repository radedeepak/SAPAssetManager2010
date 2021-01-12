import libCom from '../../Common/Library/CommonLibrary';

export default function OperationsListViewNav(context) {
    libCom.setStateVariable(context,'FromOperationsList', true);
    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/WorkOrderOperationsListViewNav.action');
}
