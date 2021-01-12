import libNotifMobile from './NotificationMobileStatusLibrary';
import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';

export default function NotificationEnableMobileStatus(context) {

    //We don't allow local mobile status changes if App Parameter MOBILESTATUS - EnableOnLocalBusinessObjects = N
    let isLocal = libCommon.isCurrentReadLinkLocal(context.binding['@odata.readLink']);
    if (isLocal) {
        if (!libCommon.isAppParameterEnabled(context, 'MOBILESTATUS', 'EnableOnLocalBusinessObjects')) {
            return false;
        }
    }

        var received = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
    var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
    let mobileStatus = libMobile.getMobileStatus(context.binding);

    if (mobileStatus === received) {
        return true;
    } else if (mobileStatus === started) {
        // check if all tasks and item tasks completed
        return libNotifMobile.isAllTasksComplete(context).then(allTasksComplete => {
            if (allTasksComplete) {
                return libNotifMobile.isAllItemTasksComplete(context).then(allItemTasksComplete => {
                    if (allItemTasksComplete) {
                        return true;
                    }
                    return false;
                });
            }
            return false;
        });
    }
    return false;
}

