import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';

export default function NotificationMobileStatusToolBarCaption(context) {
    var received = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
    var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
    var complete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
    let mobileStatus = libMobile.getMobileStatus(context.binding);
    if (mobileStatus === received) {
        return context.localizeText('start_notification');
    } else if (mobileStatus === started) {
        return context.localizeText('complete_notification');
    } else if (mobileStatus === complete) {
        return context.localizeText('completed');
    }
    return context.localizeText('status');
}
