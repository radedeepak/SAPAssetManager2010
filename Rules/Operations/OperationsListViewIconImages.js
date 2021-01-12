import libCommon from '../Common/Library/CommonLibrary';
import Logger from '../Log/Logger';
import libMobile from '../MobileStatus/MobileStatusLibrary';
import isAndroid from '../Common/IsAndroid';

export default function OperationsListViewIconImages(pageProxy) {
    var iconImage = [];
    if (libCommon.getTargetPathValue(pageProxy, '#Property:@sap.isLocal')) {
        iconImage.push(isAndroid(pageProxy) ? '/SAPAssetManager/Images/syncOnListIcon.android.png' : '/SAPAssetManager/Images/syncOnListIcon.png');
    }

    let binding = pageProxy.getBindingObject();
    
    if (binding && binding.OperationNo && libMobile.isOperationStatusChangeable()) { //check mobile status only if operation level assignment
        return libMobile.mobileStatus(pageProxy, binding).then(function(result) {
            if (result === 'COMPLETED') {
                iconImage.push('/SAPAssetManager/Images/stepCheckmarkIcon.png');
            }
            return iconImage;
        }).catch(err => {
            /**Implementing our Logger class*/
            Logger.error(pageProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryOperations.global').getValue(), err);
        });
    } else { //check system status
        return libMobile.isMobileStatusConfirmed(pageProxy).then(function(result) {
            if (result) {
                iconImage.push('/SAPAssetManager/Images/stepCheckmarkIcon.png');
            }
            return iconImage;
        }).catch(err => {
            /**Implementing our Logger class*/
            Logger.error(pageProxy.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryOperations.global').getValue(), err);
        });
    }

}
