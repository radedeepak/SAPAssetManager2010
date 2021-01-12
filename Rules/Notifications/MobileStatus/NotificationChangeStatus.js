import libNotifMobile from './NotificationMobileStatusLibrary';
import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';

export default function NotificationChangeStatus(context) {
    context.showActivityIndicator('');
    if (libMobile.isNotifHeaderStatusChangeable(context)) {
        let mobileStatus = libMobile.getMobileStatus(context.binding);
        if (mobileStatus && mobileStatus !== '') {
            let started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
            let received = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
            if (mobileStatus === received) {
                return libNotifMobile.startNotification(context);
            } else if (mobileStatus === started) {
                return libNotifMobile.isAllTasksComplete(context).then(allTasksComplete => {
                    if (allTasksComplete) {
                        return libNotifMobile.isAllItemTasksComplete(context).then(allItemTasksComplete => {
                            if (allItemTasksComplete) {
                                return libNotifMobile.completeNotification(context);
                            }
                            context.dismissActivityIndicator();
                            return context.executeAction('/SAPAssetManager/Actions/Notifications/MobileStatus/NotificationTaskPendingError.action');
                        });
                    } else {
                        context.dismissActivityIndicator();
                        return context.executeAction('/SAPAssetManager/Actions/Notifications/MobileStatus/NotificationTaskPendingError.action');
                    }
                });
            }
            context.dismissActivityIndicator();
            return '';
        }
        return context.executeAction('/SAPAssetManager/Actions/Notifications/NotificationMobileStatusFailureMessage.action');
    }
    return context.executeAction('/SAPAssetManager/Actions/Notifications/NotificationMobileStatusFailureMessage.action');
}

