import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
import libOPMobile from './OperationMobileStatusLibrary';
import libClock from '../../ClockInClockOut/ClockInClockOutLibrary';

export default function OperationMobileStatusToolBarCaption(context) {
    let received = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
    let hold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
    let started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
    let transfer = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/TransferParameterName.global').getValue());
    let complete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
    let mobileStatus = libMobile.getMobileStatus(context.binding);

    //Change operation status when assignment type is at operation level.
    if (libMobile.isOperationStatusChangeable(context)) {

        //User may be clocked in to this Operation locally regardless of what mobile status is set to
        //Status may have been changed by another user, so trap that here
        if (libClock.isBusinessObjectClockedIn(context)) {
            return context.localizeText('clock_out');
        } else {
            if (mobileStatus === received || mobileStatus === hold) {
                //This operation is not started. It is currently either on hold or received status.
                let isAnyOtherOperationStartedPromise = libOPMobile.isAnyOperationStarted(context);
                return isAnyOtherOperationStartedPromise.then(
                    isAnyOtherOperationStarted => {
                        if (isAnyOtherOperationStarted) {
                            return context.localizeText('transfer');
                        } else {
                            if (libClock.isCICOEnabled(context)) {
                                return context.localizeText('clock_in');
                            } else {
                                return context.localizeText('start_operation');
                            }
                        }
                    }
                );
            } else if (mobileStatus === started) {
                if (libClock.isCICOEnabled(context)) { //Handle clock in/out feature
                    if (context.binding.clockMobileUserGUID === libCommon.getUserGuid(context)) { //This Operation was started by current user
                        return context.localizeText('clock_out');
                    } else {
                        return context.localizeText('clock_in'); //This Operation was started by someone else, so current user can also start it
                    }
                } else {
                    return context.localizeText('end_operation');
                }
            } else if (mobileStatus === transfer) {
                return context.localizeText('transferred');
            } else if (mobileStatus === complete) {
                return context.localizeText('completed');
            }
            return context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/Status.global').getValue();
        }
    } else {
        //Change operation status when assignment type is at work order header level.
        return libMobile.isMobileStatusConfirmed(context).then(result => {
            if (result) {
                return context.localizeText('unconfirm');
            } else {
                return context.localizeText('confirm');
            }
        });
    }    
}
