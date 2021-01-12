import libCommon from '../Common/Library/CommonLibrary';
import Logger  from '../Log/Logger';
import libVal from '../Common/Library/ValidationLibrary';
import libMobile from '../MobileStatus/MobileStatusLibrary';
/**
* Check if the Signature Control is enabled and set the client data to keep track
* @param {IClientAPI} context
*/
export default function SignatureControlViewPermission(context) {
    let isSignatureEnabled = false;
    if (libMobile.isHeaderStatusChangeable(context)) {
        isSignatureEnabled = !libVal.evalIsEmpty(libCommon.getAppParam(context, 'SIGN_CAPTURE', 'WO.Complete')) && (libCommon.getAppParam(context, 'SIGN_CAPTURE', 'WO.Complete') !== 'N');
    } else if (libMobile.isOperationStatusChangeable(context)) {
        isSignatureEnabled = !libVal.evalIsEmpty(libCommon.getAppParam(context, 'SIGN_CAPTURE', 'OP.Complete')) && (libCommon.getAppParam(context, 'SIGN_CAPTURE', 'OP.Complete') !== 'N');
    } else if (libMobile.isSubOperationStatusChangeable(context)) {
        isSignatureEnabled = !libVal.evalIsEmpty(libCommon.getAppParam(context, 'SIGN_CAPTURE', 'SubOp.Complete')) && (libCommon.getAppParam(context, 'SIGN_CAPTURE', 'SubOp.Complete') !== 'N');
    }
    if (isSignatureEnabled) { 
        if (!context.getPageProxy().getClientData().didShowSignControl) { // set the flag to avoid showing it again when adding time
            libCommon.setStateVariable(context, 'LAMSignature', true);
            return context.executeAction('/SAPAssetManager/Actions/SignatureControl/View/SignatureControlView.action').then(() => {
               return context.getPageProxy().getClientData().didShowSignControl = true; // set the flag to avoid showing it again when adding time
            }).catch(err => {
                context.dismissActivityIndicator();
                /**Implementing our Logger class*/
                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySignature.global').getValue(), err);
                return Promise.reject(false);
            });
        }
    }
    // If the Signature Control parameters is not present, by default it is not required so we will proceed
    return Promise.resolve(true);
}
