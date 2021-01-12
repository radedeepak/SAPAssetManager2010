import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
import libClock from '../../ClockInClockOut/ClockInClockOutLibrary';
import libWOMobile from './WorkOrderMobileStatusLibrary';

export default function WorkOrderEnableMobileStatus(context) {

    //We don't allow local mobile status changes if App Parameter MOBILESTATUS - EnableOnLocalBusinessObjects = N
    let isLocal = libCommon.isCurrentReadLinkLocal(context.binding['@odata.readLink']);
    if (isLocal) {
        if (!libCommon.isAppParameterEnabled(context, 'MOBILESTATUS', 'EnableOnLocalBusinessObjects')) {
            return false;
        }
    }

    if (libMobile.isHeaderStatusChangeable(context)) {
        var woTransfer = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/TransferParameterName.global').getValue());
        var woComplete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        var woStarted = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
        var mobileStatus = libMobile.getMobileStatus(context.binding);
        var userGUID = libCommon.getUserGuid(context);

        //User may be clocked in to this WO regardless of what mobile status is set to, so allow change
        //Status may have been changed by another user, so trap that here
        if (libClock.isBusinessObjectClockedIn(context)) {
            return true;
        } else {
            return libClock.isUserClockedIn(context).then(clockedIn => {
                if (mobileStatus === woTransfer || mobileStatus === woComplete) {
                    return false;
                } else if (mobileStatus === woStarted) {
                    if (libClock.isCICOEnabled(context)) {
                        //I am either not clocked in (so allow starting this WO that somebody else started), or the status change was made by me
                        if (!clockedIn || context.binding.clockMobileUserGUID === userGUID) {
                            return true;
                        }
                        return false;
                    } else { //Clock in/out is disabled
                        return true;
                    }
                } else {
                    let isAnyOtherWorkOrderStartedPromise = libWOMobile.isAnyWorkOrderStarted(context);
                    return isAnyOtherWorkOrderStartedPromise.then(isAnyWorkOrderStarted => {
                        if (isAnyWorkOrderStarted && libCommon.isCurrentReadLinkLocal(context.binding['@odata.readLink'])) {
                            return false;
                        } else {
                            return true;
                        }
                    });
                }
            });
        }
    }
    return false;
}
