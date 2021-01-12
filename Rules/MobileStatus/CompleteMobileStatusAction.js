
import MobileStatusAction from './MobileStatusAction';
import libCommon from '../Common/Library/CommonLibrary';
import libEval from '../Common/Library/ValidationLibrary';
import libMobile from './MobileStatusLibrary';
import libClock from '../ClockInClockOut/ClockInClockOutLibrary';


export default class CompleteMobileStatusAction extends MobileStatusAction {

    getDefaultArgs() {
        let defaultArgs = super.getDefaultArgs();
        defaultArgs.didCreateFinalConfirmation = false;
        return defaultArgs;
    }

    /**
     * This should be overwritten by the class that extends this class.
     * That class needs to set the following values in client data: FinalConfirmationOrderID, FinalConfirmationOperation, FinalConfirmationSubOperation.
     * If there is no FinalConfirmationSubOperation, then its value should be blank but you still need to add FinalConfirmationSubOperation to client data.
     * All these client data values are used in ConfirmationCreateBlank.action.
     */
    didSetFinalConfirmationParams() {
        return false;
    }

    /**
     * context.binding is going to be one of the following objects: MyWorkOrderHeader, MyWorkOrderOperation, MyWorkOrderSubOperation, or mConfirmation.
     * This method is called multiple times from the same context to set the mobile status to complete for various object that are not always the same as
     * the context.binding object. For example, if context.binding is MyWorkOrderOperation, then this function is first called to set the operation
     * mobile status to complete. Next, it's called again to set the mobile status of the parent object of MyWorkOrderOperation,
     * which is MyWorkOrderHeader, to complete.
     *
     * @param {*} context PageProxy or action that contains a binding object.
     * @param {*} instance This is the object for which we want to set the mobile status to "complete".
     *              contest.binding can be MyWorkOrderOperation and instance can be MyWorkOrderHeaders.
     */
    setMobileStatusComplete(context, instance) {
        //Binding object should be either a MyWorkOrderHeader, MyWorkOrderOperation, or MyWorkOrderSubOperation.
        let bindingObj = context.binding;
        let mobileStatusObject = '';

        /**
         * Set the correct bindingObj here.
         * If you create a labor PM confirmation from ConfirmationsOverviewListView.page, the bindingObj will be mConfirmation.
         * mConfirmation is our madeup object which we shouldn't be using but it's too complex to break now.
         * mConfirmation contains MyWorkOrderHeader inside it, in a property called WorkOrderHeader.
         * Here we are just setting bindingObj to be MyWorkOrderHeader from mConfirmation.WorkOrderHeader.
         */
        if (bindingObj.hasOwnProperty('name') && bindingObj.name === 'mConfirmation') {
            bindingObj = libMobile.getWorkOrderHeaderObjFromConfirmationObj(context);
        }

        //This is the object for which we want to update the mobile status to "complete".
        let mobileInstance = '';

        if (bindingObj) {
            switch (instance.entitySet()) {
                case 'MyWorkOrderHeaders': {
                    switch (bindingObj['@odata.type']) {
                        case '#sap_mobile.MyWorkOrderHeader': {
                            mobileStatusObject = bindingObj.OrderMobileStatus_Nav;
                            mobileInstance = bindingObj;
                            break;
                        }
                        case '#sap_mobile.MyWorkOrderOperation': {
                            mobileStatusObject = bindingObj.WOHeader.OrderMobileStatus_Nav;
                            mobileInstance = bindingObj.WOHeader;
                            break;
                        }
                        case '#sap_mobile.MyWorkOrderSubOperation': {
                            mobileStatusObject = bindingObj.WorkOrderOperation.WOHeader.OrderMobileStatus_Nav;
                            mobileInstance = bindingObj.WorkOrderOperation.WOHeader;
                            break;
                        }
                        default:
                            break;
                    }
                    break;
                }
                case 'MyWorkOrderOperations': {
                    switch (bindingObj['@odata.type']) {
                        case '#sap_mobile.MyWorkOrderOperation': {
                            mobileStatusObject = bindingObj.OperationMobileStatus_Nav;
                            mobileInstance = bindingObj;
                            break;
                        }
                        case '#sap_mobile.MyWorkOrderSubOperation': {
                            mobileStatusObject = bindingObj.WorkOrderOperation.OperationMobileStatus_Nav;
                            mobileInstance = bindingObj.WorkOrderOperation;
                            break;
                        }
                        default:
                            break;
                    }
                    break;
                }
                case 'MyWorkOrderSubOperations': {
                    switch (bindingObj['@odata.type']) {
                        case '#sap_mobile.MyWorkOrderSubOperation': {
                            mobileStatusObject = bindingObj.SubOpMobileStatus_Nav;
                            break;
                        }
                        default:
                            break;
                    }
                    break;
                }
                default:
                    break;
            }
        }

        if (libCommon.isDefined(mobileStatusObject)) {
            //Needed for MobileStatusSetComplete.action.
            context.getClientData().MobileStatusReadLink = mobileStatusObject['@odata.readLink'];
            context.getClientData().MobileStatusObjectKey = mobileStatusObject.ObjectKey;
            context.getClientData().MobileStatusObjectType = mobileStatusObject.ObjectType;
            //Needed for EndDateTime.js which is called in MobileStatusSetComplete.action.
            context.getClientData().MobileStatusInstance = mobileInstance;

            //Fix for 12508 - JCL
            mobileInstance.MobileStatusReadLink = mobileStatusObject['@odata.readLink'];
            mobileInstance.MobileStatusObjectKey = mobileStatusObject.ObjectKey;
            mobileInstance.MobileStatusObjectType = mobileStatusObject.ObjectType;

            // Since we are closing the page in labor time, we need to save the instance for later
            context.evaluateTargetPathForAPI('#Page:-Previous').getClientData().currentInstance = instance;
            if (!libEval.evalIsEmpty(context.getClientData().currentObject)) {
                context.getClientData().currentObject.currentInstance=context.getClientData().currentInstance;
            }
            let target = mobileInstance;
            if (!target) {
                target = bindingObj;
            }

            libMobile.rollupCompleteStatusToChildPages(context, target);
            return libClock.reloadUserTimeEntries(context, false, false, mobileInstance).then(() => {
                return libClock.clockOutBusinessObject(context, mobileInstance).then(() => {
                    return context.executeAction('/SAPAssetManager/Actions/Confirmations/MobileStatusSetComplete.action');
                });
            });
        } else {
            if (bindingObj) {
                switch (bindingObj['@odata.type']) {
                    case '#sap_mobile.MyWorkOrderHeader': {
                        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
                    }
                    case '#sap_mobile.MyWorkOrderOperation': {
                        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
                    }
                    case '#sap_mobile.MyWorkOrderSubOperation': {
                        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusFailureMessage.action');
                    }
                    default:
                        break;
                }
            }
            return Promise.reject(false);
        }
    }

    executeCreateBlankConfirmationIfMissing(context, instance) {	
        if (!instance.args.didCreateFinalConfirmation && instance.didSetFinalConfirmationParams(context)) {	
            // Execute the blank final confirmation create action
            return context.executeAction('/SAPAssetManager/Actions/Confirmations/ConfirmationCreateBlank.action');
        }
        return Promise.resolve(true);
    }
}
