import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
import libOPMobile from './OperationMobileStatusLibrary';
import libClock from '../../ClockInClockOut/ClockInClockOutLibrary';

export default function OperationEnableMobileStatus(context) {

    //We don't allow local mobile status changes if App Parameter MOBILESTATUS - EnableOnLocalBusinessObjects = N
    let isLocal = libCommon.isCurrentReadLinkLocal(context.binding['@odata.readLink']);
    if (isLocal) {
        if (!libCommon.isAppParameterEnabled(context, 'MOBILESTATUS', 'EnableOnLocalBusinessObjects')) {
            return false;
        }
    }

    var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());

    if (libMobile.isHeaderStatusChangeable(context)) {
        return context.read('/SAPAssetManager/Services/AssetManager.service', context.binding.WOHeader['@odata.readLink'], [], '$expand=OrderMobileStatus_Nav').then(function(result) {
            if (result && result.length > 0) {
                let headerMobileStatus = libMobile.getMobileStatus(result.getItem(0));
                return headerMobileStatus === started;
            } else {
                return false;
            }
        });
    }

    if (libMobile.isOperationStatusChangeable(context)) {
        let mobileStatus = libMobile.getMobileStatus(context.binding);
        var transfer = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/TransferParameterName.global').getValue());
        var complete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        var userGUID = libCommon.getUserGuid(context);

        //User may be clocked in to this operation regardless of what mobile status is set to, so allow change
        //Status may have been changed by another user, so trap that here
        if (libClock.isBusinessObjectClockedIn(context)) {
            return true;
        } else {
            return libClock.isUserClockedIn(context).then(clockedIn => {
                if (mobileStatus === transfer || mobileStatus === complete) {
                    return false;
                } else if (mobileStatus === started) {
                    if (libClock.isCICOEnabled(context)) {
                        //Started, but I am either not clocked in, or clocked in and this WO was started by me
                        if (!clockedIn || context.binding.clockMobileUserGUID === userGUID) {
                            return true;
                        }
                        return false;
                    } else { //Clock in/out is disabled
                        return true;
                    }
                } else {
                    let isAnyOtherWorkOrderStartedPromise = libOPMobile.isAnyOperationStarted(context);
                    return isAnyOtherWorkOrderStartedPromise.then(isAnyOperationStarted => {
                        if (isAnyOperationStarted && libCommon.isCurrentReadLinkLocal(context.binding['@odata.readLink'])) {
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
