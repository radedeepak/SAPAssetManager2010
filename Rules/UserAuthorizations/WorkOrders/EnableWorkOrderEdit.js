/**
* Show/Hide Work Order edit button based on User Authorization
* @param {IClientAPI} context
*/
import libCom from '../../Common/Library/CommonLibrary';
import libMobileStatus from '../../MobileStatus/MobileStatusLibrary';
import libVal from '../../Common/Library/ValidationLibrary';

export default function EnableWorkOrderEdit(context) {
    let binding = context.binding;
    let completeStatus = libCom.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
    let completed = false;
    let enableOrLocal =  libCom.getAppParam(context, 'USER_AUTHORIZATIONS', 'Enable.WO.Edit') === 'Y' || libCom.isCurrentReadLinkLocal(context.binding['@odata.readLink']);

    if (!binding['@odata.type'] && context.getActionBinding) {
        binding = context.getActionBinding();
    }

    if (libVal.evalIsEmpty(binding)) {
        return enableOrLocal;
    }

    switch (binding['@odata.type']) {
        case '#sap_mobile.MyWorkOrderHeader':
            completed = libMobileStatus.getMobileStatus(binding) === completeStatus;
            break;
        case '#sap_mobile.MyWorkOrderOperation':
            if (libMobileStatus.isOperationStatusChangeable(context)) {
                completed = libMobileStatus.getMobileStatus(binding) === completeStatus;
                return libMobileStatus.isMobileStatusComplete(context, 'MyWorkOrderHeaders', context.binding.OrderId).then(status => {
                    if (status) { //already complete so exit
                        return false;
                    } else {
                        return (enableOrLocal && !completed);
                    }
                }); 
            } else {
                return libMobileStatus.isMobileStatusComplete(context, 'MyWorkOrderHeaders', context.binding.OrderId).then(status => {
                    if (status) { //already complete so exit
                        return false;
                    } else {
                        return libMobileStatus.isMobileStatusConfirmed(context).then(result => {
                            if (result) {
                                return false;
                            } 
                            return (enableOrLocal && !completed);
                            
                        });
                    }
                });
            }
        case '#sap_mobile.MyWorkOrderSubOperation':
            if (libMobileStatus.isSubOperationStatusChangeable()) {
                completed = libMobileStatus.getMobileStatus(binding) === completeStatus;
            } else {
                let subOp = binding.SubOperationNo;
                return libMobileStatus.isMobileStatusConfirmed(context, subOp).then(result => {
                    if (result) {
                        return false;
                    } 
                    return (enableOrLocal && !completed);
                    
                });
            }
            break;
        default:
            break;
        }
    
    return (enableOrLocal && !completed);
}
