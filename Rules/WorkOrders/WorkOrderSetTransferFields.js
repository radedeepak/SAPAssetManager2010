import { GlobalVar } from '../Common/Library/GlobalCommon';
import libCommon from '../Common/Library/CommonLibrary';

export default function WorkOrderSetTransferFields(context) {
    let assnType = libCommon.getWorkOrderAssignmentType(context);
    let clientData = context.getClientData();

    if (context.evaluateTargetPathForAPI('#Page:-Previous').getClientData().FromErrorArchive || context.evaluateTargetPathForAPI('#Page:-Previous').getClientData().ErrorObject) {
        clientData.EmployeeFrom = context.binding.EmployeeFrom;
        clientData.PlannerGroupFrom = context.binding.PlannerGroupFrom;
        clientData.UserFrom = context.binding.UserFrom;
        clientData.WorkCenterFrom = context.binding.WorkCenterFrom;
        switch (assnType) {
            case '1':
            case '2':
            case '3':
            case '4':
            case 'A':
                clientData.EmployeeTo = context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue;
                break;
            case '5':
                clientData.PlannerGroupTo = context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue;
                break;
            case '7':
                clientData.UserTo = context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue;
                break;
            case '6':
                clientData.WorkCenterTo =(context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue).split('|')[0];
                clientData.PlantId = (context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue).split('|')[1];

                break;
            case '8':
                clientData.WorkCenterTo =(context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue).split('|')[0];
                clientData.PlantId = (context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue).split('|')[1];                
                break;
            default:
                break;
        }
        clientData.TransferReason = context.evaluateTargetPath('#Control:TransferReasonLstPkr/#Value')[0].ReturnValue;
        clientData.TransferNote = context.evaluateTargetPath('#Control:TransferNote/#Value');

        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderTransferUpdate.action');
    } else {
        clientData.EmployeeFrom = '';
        clientData.EmployeeTo = '';
        clientData.PlannerGroupFrom = '';
        clientData.PlannerGroupTo = '';
        clientData.UserFrom = '';
        clientData.UserTo = '';
        clientData.WorkCenterFrom = '';
        clientData.WorkCenterTo = '';
        clientData.WorkCenterFrom = '';
        clientData.WorkCenterTo = '';
        switch (assnType) {
            case '1':
            case '2':
            case '3':
            case '4':
            case 'A':
                clientData.EmployeeFrom = GlobalVar.getUserSystemInfo().get('PERNO');
                clientData.EmployeeTo = context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue;
                break;
            case '5':
                clientData.PlannerGroupFrom = GlobalVar.getUserSystemInfo().get('USER_PARAM.IHG');
                clientData.PlannerGroupTo = context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue;
                break;
            case '7':
                clientData.UserFrom = libCommon.getSapUserName(context);
                clientData.UserTo = context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue;
                break;
            case '6':
                clientData.WorkCenterFrom = context.binding.WOHeader.MainWorkCenter;
                clientData.WorkCenterTo =(context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue).split('|')[0];
                clientData.PlantId = (context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue).split('|')[1];
                break;
            case '8':
                clientData.WorkCenterFrom = context.binding.MainWorkCenter;
                clientData.WorkCenterTo =(context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue).split('|')[0];
                clientData.PlantId = (context.evaluateTargetPath('#Control:TransferToLstPkr/#Value')[0].ReturnValue).split('|')[1];
                break;
            default:
                break;
        }
        clientData.TransferReason = context.evaluateTargetPath('#Control:TransferReasonLstPkr/#Value')[0].ReturnValue;
        clientData.TransferNote = context.evaluateTargetPath('#Control:TransferNote/#Value');
        switch (assnType) {
            case '1':
            case '5':
            case '7':
            case '8':
                libCommon.enableToolBar(context, 'WorkOrderDetailsPage', 'IssuePartTbI', false);
                break;
            case '2':
            case '4':
            case '6':
            case 'A':
                libCommon.enableToolBar(context, 'WorkOrderOperationDetailsPage', 'IssuePartTbI', false);
                break;
            case '3':
                libCommon.enableToolBar(context, 'SubOperationDetailsPage', 'IssuePartTbI', false);
                break;
            default:
                break;
        }

        switch (assnType) {
            case '6':
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/WorkOrderOperationWorkCenterUpdate.action');
            case '8':
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderTransferWorkCenterUpdate.action');
            default:
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderTransfer.action');
        }
    }
}
