import libCommon from '../../Common/Library/CommonLibrary';
export default function WorkOrderMobileStatusSuccessMessage(context) {
    context.dismissActivityIndicator();
    var clientData = context.getClientData();
    if (clientData && clientData.ChangeStatus) {
        //if (clientData["ChangeStatus"]) {
        var status = clientData.ChangeStatus;
        var woStarted = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
        var woHold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
        var woTransfer = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/TransferParameterName.global').getValue());
        var woComplete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        switch (status) {
            case woStarted:
                return context.localizeText('work_order_started');
            case woHold:
                return context.localizeText('work_order_on_hold');
            case woTransfer:
                return context.localizeText('work_order_transferred');
            case woComplete:
                return context.localizeText('work_order_completed');
            default:
                return context.localizeText('status_updated');
        }
        // }
    }
    return context.localizeText('status_updated');
}
