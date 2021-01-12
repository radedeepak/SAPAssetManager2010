import libCommon from '../Common/Library/CommonLibrary';
import libEval from '../Common/Library/ValidationLibrary';
import QueryBuilder from '../Common/Query/QueryBuilder';
import MobileStatusCompleted from './MobileStatusCompleted';
import FetchRequest from '../Common/Query/FetchRequest';
import libThis from './MobileStatusLibrary';

export default class {

    static getObjectKey(context) {
        return libCommon.getTargetPathValue(context, '#Property:ObjectKey');
    }

    static getPageContext(context, page) {
        return context.evaluateTargetPathForAPI('#Page:' + page);
    }

    static isHeaderStatusChangeable(context) {
        var assignmentType = libCommon.getWorkOrderAssignmentType(context);
        switch (assignmentType) {
            case '1':
                return true;
            case '2':
                return false;
            case '3':
                return false;
            case '4':
                return false;
            case '5':
                return true;
            case '6':
                return false;
            case '7':
                return true;
            case '8':
                return true;
            case 'A':
                return false;
            default:
                return false;
        }
    }

    static isNotifHeaderStatusChangeable(context) {
        var assignmentType = libCommon.getNotificationAssignmentType(context);
        switch (assignmentType) {
            case '1':
                return true;
            case '2':
                return true;
            case '3':
                return true;
            case '4':
                return false;
            case '5':
                return true;
            case '6':
                return false;
            case '7':
                return false;
            case '8':
                return false;
            case 'A':
                return false;
            default:
                return false;
        }
    }

    static isOperationStatusChangeable(context) {
        var assignmentType = libCommon.getWorkOrderAssignmentType(context);
        switch (assignmentType) {
            case '1':
                return false;
            case '2':
                return true;
            case '3':
                return false;
            case '4':
                return true;
            case '5':
                return false;
            case '6':
                return true;
            case '7':
                return false;
            case '8':
                return false;
            case 'A':
                return true;
            default:
                return false;
        }
    }

    static isSubOperationStatusChangeable(context) {
        var assignmentType = libCommon.getWorkOrderAssignmentType(context);
        switch (assignmentType) {
            case '1':
                return false;
            case '2':
                return false;
            case '3':
                return true;
            case '4':
                return false;
            case '5':
                return false;
            case '6':
                return false;
            case '7':
                return false;
            case '8':
                return false;
            case 'A':
                return false;
            default:
                return false;
        }
    }

    static setStartStatus(context) {
        var clientData = context.getClientData();
        clientData.ChangeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
        this.setMobileStatus(context.binding, clientData.ChangeStatus, libCommon.getUserGuid(context));
    }

    static setHoldStatus(context) {
        var clientData = context.getClientData();
        clientData.ChangeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
        this.setMobileStatus(context.binding, clientData.ChangeStatus, libCommon.getUserGuid(context));
    }

    static setTransferStatus(context) {
        var clientData = context.getClientData();
        clientData.ChangeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/TransferParameterName.global').getValue());
        this.setMobileStatus(context.binding, clientData.ChangeStatus, libCommon.getUserGuid(context));
    }

    static setCompleteStatus(context) {
        var clientData = context.getClientData();
        clientData.ChangeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        this.setMobileStatus(context.binding, clientData.ChangeStatus, libCommon.getUserGuid(context));
    }

    static setSuccessStatus(context) {
        var clientData = context.getClientData();
        clientData.ChangeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/SuccessParameterName.global').getValue());
        this.setMobileStatus(context.binding, clientData.ChangeStatus, libCommon.getUserGuid(context));
    }

    static refreshPage(context) {
        if (context) {
            if (context.getControls()) {
                var controls = context.getControls();
                for (var i = 0; i < controls.length; i++) {
                    this.redraw(controls[i]);
                }
            }
        }
    }

    static refreshPreviousPage(context, page) {
        let pageProxy = context.evaluateTargetPathForAPI('#Page:' + page);
        this.refreshPage(pageProxy);
    }

    static redraw(control) {
        control.redraw();
    }

    static showWarningMessage(context, messageText, captionText = context.localizeText('confirm_status_change'), okButtonText = context.localizeText('ok'), cancelButtonText = context.localizeText('cancel_button_text')) {
        context.dismissActivityIndicator();
        if (!context.getPageProxy) {
            context.getClientData().DialogMessage = messageText;
            context.getClientData().DialogTitle = captionText;
            context.getClientData().DialogOkCaption = okButtonText;
            context.getClientData().DialogCancelCaption = cancelButtonText;
        } else {
            context.getPageProxy().getClientData().DialogMessage = messageText;
            context.getPageProxy().getClientData().DialogTitle = captionText;
            context.getPageProxy().getClientData().DialogOkCaption = okButtonText;
            context.getPageProxy().getClientData().DialogCancelCaption = cancelButtonText;
        }
        return context.executeAction('/SAPAssetManager/Actions/Common/GenericWarningDialog.action').then(result => {
            if (result.data === true) {
                return Promise.resolve(true);
            } else {
                return Promise.resolve(false);
            }
        });
    }

    static getOrderId(context) {
        return libCommon.getTargetPathValue(context, '#Property:OrderId');
    }

    static markedJobsListMobileStatus(context, binding) {
        let currentReadLink = binding.WorkOrderHeader['@odata.readLink'];
        let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
        var status = '';
        if (!isLocal) {
            if (binding && binding.WorkOrderHeader && binding.WorkOrderHeader.OrderMobileStatus_Nav.MobileStatus) {
                status = binding.WorkOrderHeader.OrderMobileStatus_Nav.MobileStatus;
            } else if (binding && binding.WorkOrderHeader && binding.WorkOrderHeader.MobileStatus) {
                status = binding.WorkOrderHeader.MobileStatus;
            }
        } else {
            status = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
        }
        return status;
    }

    /**
     * Gets the mobile status as a Promise.
     * @deprecated Use new function called {@link getMobileStatus}
     * @param {*} context
     * @param {*} binding
     */
    static mobileStatus(context, binding) {
        var status = this.getMobileStatus(binding);
        if (context.binding) {
            return Promise.resolve(status);
        }
        return Promise.resolve(status);
    }

    /**
     * Gets the mobile status value of the context binding object.
     *
     * @param {*} binding context.binding object
     */
    static getMobileStatus(binding) {
        if (binding) {
            binding.clockMobileUserGUID = ''; //Handle clock in/out support
            switch (binding['@odata.type']) {
                case '#sap_mobile.MyWorkOrderHeader':
                    if (binding.OrderMobileStatus_Nav.MobileStatus) {
                        if (binding.OrderMobileStatus_Nav.CreateUserGUID) {
                            binding.clockMobileUserGUID = binding.OrderMobileStatus_Nav.CreateUserGUID;
                        }
                        return binding.OrderMobileStatus_Nav.MobileStatus;
                    }
                    break;
                case '#sap_mobile.MyWorkOrderOperation':
                    if (binding.OperationMobileStatus_Nav.MobileStatus) {
                        if (binding.OperationMobileStatus_Nav.CreateUserGUID) {
                            binding.clockMobileUserGUID = binding.OperationMobileStatus_Nav.CreateUserGUID;
                        }
                        return binding.OperationMobileStatus_Nav.MobileStatus;
                    }
                    break;
                case '#sap_mobile.MyWorkOrderSubOperation':
                    if (binding.SubOpMobileStatus_Nav.MobileStatus) {
                        if (binding.SubOpMobileStatus_Nav.CreateUserGUID) {
                            binding.clockMobileUserGUID = binding.SubOpMobileStatus_Nav.CreateUserGUID;
                        }
                        return binding.SubOpMobileStatus_Nav.MobileStatus;
                    }
                    break;
                case '#sap_mobile.MyNotificationHeader':
                        if (binding.NotifMobileStatus_Nav.MobileStatus) {
                            return binding.NotifMobileStatus_Nav.MobileStatus;
                        }
                        break;
                case '#sap_mobile.MyNotificationTask':
                        if (binding.TaskMobileStatus_Nav.MobileStatus) {
                            return binding.TaskMobileStatus_Nav.MobileStatus;
                        }
                        break;
                case '#sap_mobile.MyNotificationItemTask':
                        if (binding.ItemTaskMobileStatus_Nav.MobileStatus) {
                            return binding.ItemTaskMobileStatus_Nav.MobileStatus;
                        }
                        break;
                default:
                    if (binding.MobileStatus) {
                        if (binding.MobileStatus.CreateUserGUID) {
                            binding.clockMobileUserGUID = binding.MobileStatus.CreateUserGUID;
                        }
                        return binding.MobileStatus.MobileStatus;
                    }
            }
        }
        return '';
    }

    /**
     * Sets the mobile status of the current context binding object.
     * @param {*} binding
     * @param {*} mobileStatus
     * @param {*} userGUID - GUID for the user making the status change
     */
    static setMobileStatus(binding, mobileStatus, userGUID) {
        if (binding && mobileStatus && (mobileStatus !== '')) {
            switch (binding['@odata.type']) {
                case '#sap_mobile.MyWorkOrderHeader': {
                        binding.OrderMobileStatus_Nav.MobileStatus = mobileStatus;
                        binding.OrderMobileStatus_Nav.CreateUserGUID = userGUID;
                    break;
                }
                case '#sap_mobile.MyWorkOrderOperation': {
                    binding.OperationMobileStatus_Nav.MobileStatus = mobileStatus;
                    binding.OperationMobileStatus_Nav.CreateUserGUID = userGUID;
                    break;
                }
                case '#sap_mobile.MyWorkOrderSubOperation': {
                    binding.SubOpMobileStatus_Nav.MobileStatus = mobileStatus;
                    binding.SubOpMobileStatus_Nav.CreateUserGUID = userGUID;
                    break;
                }
                case '#sap_mobile.MyNotificationHeader': {
                    binding.NotifMobileStatus_Nav.MobileStatus = mobileStatus;
                    binding.NotifMobileStatus_Nav.CreateUserGUID = userGUID;
                    break;
                }
                case '#sap_mobile.MyNotificationTask': {
                    binding.TaskMobileStatus_Nav.MobileStatus = mobileStatus;
                    binding.TaskMobileStatus_Nav.CreateUserGUID = userGUID;
                    break;
                }
                case '#sap_mobile.MyNotificationItemTask': {
                    binding.ItemTaskMobileStatus_Nav.MobileStatus = mobileStatus;
                    binding.ItemTaskMobileStatus_Nav.CreateUserGUID = userGUID;
                    break;
                }
                default:
            }
        }
    }

    static isMobileStatusConfirmed(context, SubOperation) {

        let binding = context.getBindingObject();

        let queryBuilder = new QueryBuilder();
        queryBuilder.addSelectStatement('FinalConfirmation');
        queryBuilder.addFilter(`OrderID eq '${binding.OrderId}'`);
        queryBuilder.addFilter(`Operation eq '${binding.OperationNo}'`);

        if (SubOperation) {
            queryBuilder.addFilter(`SubOperation eq '${SubOperation}'`);
        } else {
            queryBuilder.addFilter("SubOperation eq ''");
        }
        queryBuilder.addExtra('orderby=ConfirmationCounter desc');
        queryBuilder.addExtra('top=1');

        let request = new FetchRequest('Confirmations', queryBuilder.build());

        return request.execute(context).then(result => {

            if (result && result.length > 0) {
                let confirmation = result.getItem(0);
                if (confirmation && confirmation.FinalConfirmation) {
                    return confirmation.FinalConfirmation === 'X';
                }
            }
            return false;
        });
    }

    static getQueryOptionsForCompletedStatusForOperations(context, orderId) {
        let binding = context.getBindingObject();
        let queryBuilder = new QueryBuilder();

        queryBuilder.addFilter(`OrderId eq '${orderId}'`);
        queryBuilder.addAllSelectStatements(['OperationNo', 'OperationShortText']);

        if (this.isOperationStatusChangeable(context)) {
            queryBuilder.addExpandStatement('OperationMobileStatus_Nav');
            if (!libEval.evalIsEmpty(binding.Operation)) {
                queryBuilder.addFilter(`OperationNo eq '${binding.Operation}'`);
            } else {
                queryBuilder.addFilter(`OperationMobileStatus_Nav/MobileStatus ne '${MobileStatusCompleted(context)}'`);
            }
            return queryBuilder.build();
        } else { //Header level assignment type so need to check for confirmed status
            return this.getAllConfirmationsForWorkorderForOperation(context, orderId).then(allConfirmations => {
                let grouped = this.groupByOperation(allConfirmations, confirmation => confirmation.Operation);
                let iterator1 = grouped[Symbol.iterator]();

                for (let [key, value] of iterator1) {
                    if (value.FinalConfirmation === 'X') {
                        if (binding.Operation === key) { //During confirmation edit we do not want to exclude the current operation
                            queryBuilder.addFilter(`OperationNo eq '${key}'`);
                        }
                    }
                }
                queryBuilder.addExtra('orderby=OperationNo');
                return queryBuilder.build();
            });
        }
    }

    static getStatusForOperations(context, orderId) {
        let queryBuilder = new QueryBuilder();

        queryBuilder.addFilter(`OrderId eq '${orderId}'`);

        return this.getAllConfirmationsForWorkorderForOperation(context, orderId).then(allConfirmations => {
            let grouped = this.groupByOperation(allConfirmations, confirmation => confirmation.Operation);
            let iterator1 = grouped[Symbol.iterator]();

            for (let [key, value] of iterator1) {
                if (value.FinalConfirmation === 'X') {
                    queryBuilder.addFilter(`OperationNo ne '${key}'`);
                }
            }
            return queryBuilder.build();
        });
    }

    static getQueryOptionsForCompletedStatusForSuboperations(context, orderId, operation) {
        let binding = context.binding;
        let queryBuilder = new QueryBuilder();

        queryBuilder.addFilter(`OrderId eq '${orderId}'`);
        queryBuilder.addFilter(`OperationNo eq '${operation}'`);
        queryBuilder.addExtra('orderby=SubOperationNo');

        if (this.isSubOperationStatusChangeable(context)) { //check for subop completed status
            queryBuilder.addExpandStatement('SubOpMobileStatus_Nav');
            if (!libEval.evalIsEmpty(binding.SubOperation)) {
                queryBuilder.addFilter(`SubOperationNo eq '${binding.SubOperation}'`);
            } else {
                queryBuilder.addFilter(`SubOpMobileStatus_Nav/MobileStatus ne '${MobileStatusCompleted(context)}'`);
            }
            return new Promise((resolve, reject) => {
                try {
                    return resolve(queryBuilder.build());
                } catch (error) {
                    return reject('');
                }
            });
        } else { // check for confirmed status of suboperations
            return this.getAllConfirmationsForWorkorderForSubOperation(context, orderId, operation).then(allConfirmations => {
                let grouped = this.groupByOperation(allConfirmations, confirmation => confirmation.SubOperation);
                let iterator1 = grouped[Symbol.iterator]();

                for (let [key, value] of iterator1) {
                    if (value.FinalConfirmation === 'X') {
                        if (binding.SubOperation === key) { //During confirmation edit we do not want to exclude the current suboperation
                            queryBuilder.addFilter(`SubOperationNo eq '${key}'`);
                        }
                    }
                }
                return queryBuilder.build();
            });
        }

    }

    static getStatusForSubOperations(context, orderId, operationNo) {
        let queryBuilder = new QueryBuilder();

        queryBuilder.addFilter(`OrderId eq '${orderId}'`);
        queryBuilder.addFilter(`OperationNo eq '${operationNo}'`);

        return this.getAllConfirmationsForWorkorderForSubOperation(context, orderId, operationNo).then(allConfirmations => {
            let grouped = this.groupByOperation(allConfirmations, confirmation => confirmation.SubOperation);
            let iterator1 = grouped[Symbol.iterator]();

            for (let [key, value] of iterator1) {
                if (value.FinalConfirmation === 'X') {
                    queryBuilder.addFilter(`SubOperationNo ne '${key}'`);
                }
            }
            return queryBuilder.build();
        });
    }

    static groupByOperation(confirmations, keyProperty) {
        let map = new Map();
        confirmations.forEach((confirmation) => {
            let operationNo = keyProperty(confirmation);
            let existingConfirmation = map.get(operationNo);
            if (!existingConfirmation) { //no confirmation exist for this operation so add it
                map.set(operationNo, confirmation);
            } else { //multiple confirmations for this operation
                let counter = parseInt(confirmation.ConfirmationCounter);
                let existingCounter = parseInt(existingConfirmation.ConfirmationCounter);
                if (counter > existingCounter) {
                    map.set(operationNo, confirmation);
                }
            }
        });
        return map;
    }

    static getAllConfirmationsForWorkorderForOperation(context, orderId) {
        let queryBuilder = new QueryBuilder();
        queryBuilder.addFilter(`OrderID eq '${orderId}'`);
        queryBuilder.addFilter("SubOperation eq ''");

        let request = new FetchRequest('Confirmations', queryBuilder.build());

        return request.execute(context).then(result => {
            let confirmations = [];
            result.forEach(item => {
                confirmations.push(item);
            });
            return confirmations;
        });
    }

    static getAllConfirmationsForWorkorderForSubOperation(context, orderId, operationNo) {
        let queryBuilder = new QueryBuilder();
        queryBuilder.addFilter(`OrderID eq '${orderId}'`);
        queryBuilder.addFilter(`Operation eq '${operationNo}'`);
        queryBuilder.addFilter("SubOperation ne ''");

        let request = new FetchRequest('Confirmations', queryBuilder.build());

        return request.execute(context).then(result => {
            let confirmations = [];
            result.forEach(item => {
                confirmations.push(item);
            });
            return confirmations;
        });
    }

    static isMobileStatusComplete(context, entitySet, orderId, operation) {
        let queryBuilder = new QueryBuilder();

        queryBuilder.addFilter(`OrderId eq '${orderId}'`);

        if (operation) { //Operation level assignment
            queryBuilder.addFilter(`OperationNo eq '${operation}'`);
            queryBuilder.addExpandStatement('OperationMobileStatus_Nav');
        } else { //Header level assignment
            queryBuilder.addExpandStatement('OrderMobileStatus_Nav');
        }

        let fetchRequest = new FetchRequest(entitySet, queryBuilder.build());

        return fetchRequest.execute(context).then(result => {
            let object = result.getItem(0);
            if (operation) {
                if (object.OperationMobileStatus_Nav.MobileStatus === MobileStatusCompleted(context)) {
                    return true;
                }
            } else {
                if (object.OrderMobileStatus_Nav.MobileStatus === MobileStatusCompleted(context)) {
                    return true;
                }
            }
            return false;
        });
    }

    /**
     * We create our own Confirmation object called mConfirmation in ConfirmationCreateUpdateNav.js
     * instead of creating it from an actual EntitySet. mConfirmation is then assigned to the action
     * context's binding property. Thus, it becomes our new binding object. We shouldn't be creating
     * this mConfirmation object to begin with, but the Confirmation code is too complex to refactor
     * in the short time that we have right now.
     *
     * This function is to get the WorkOrderHeader object which does come from an EntitySet from the mConfirmation object.
     * If no WorkOrderHeader object is found then it returns undefined.
     *
     * @param {*} context The PageProxy or Action context.
     */
    static getWorkOrderHeaderObjFromConfirmationObj(context) {
        let bindingObj = context.binding;
        if (bindingObj.hasOwnProperty('name')) {
            if (bindingObj.name === 'mConfirmation') {
                if (bindingObj.hasOwnProperty('WorkOrderHeader')) {
                    bindingObj = bindingObj.WorkOrderHeader;
                    return bindingObj;
                }
            }
        }
        return undefined;
    }

    /**
     * Rollup code is completing a parent work order, operation or sub-operation, so update this complete status on the detail pages that reference this parent
     * @param {*} context
     * @param {*} object
     */
    static rollupCompleteStatusToChildPages(context, parent) {

        let page;
        let pageContext;
        let completeStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());

        switch (parent['@odata.type']) {
            case '#sap_mobile.MyWorkOrderHeader': {
                page = '#Page:WorkOrderDetailsPage';
                try {
                    pageContext = context.evaluateTargetPathForAPI(page);
                } catch (err) {
                    //page does not exist
                }
                if (pageContext) {
                    libThis.setMobileStatus(pageContext.getBindingObject(), completeStatus, libCommon.getUserGuid(context));
                }
                page = '#Page:WorkOrderOperationDetailsPage';
                pageContext = '';
                try {
                    pageContext = context.evaluateTargetPathForAPI(page);
                } catch (err) {
                    //page does not exist
                }
                if (pageContext) {
                    libThis.setMobileStatus(pageContext.getBindingObject().WOHeader, completeStatus, libCommon.getUserGuid(context));
                }
                page = '#Page:SubOperationDetailsPage';
                pageContext = '';
                try {
                    pageContext = context.evaluateTargetPathForAPI(page);
                } catch (err) {
                    //page does not exist
                }
                if (pageContext) {
                    libThis.setMobileStatus(pageContext.getBindingObject().WorkOrderOperation.WOHeader, completeStatus, libCommon.getUserGuid(context));
                }
                break;
            }
            case '#sap_mobile.MyWorkOrderOperation': {
                page = '#Page:WorkOrderOperationDetailsPage';
                try {
                    pageContext = context.evaluateTargetPathForAPI(page);
                } catch (err) {
                    //page does not exist
                }
                if (pageContext) {
                    libThis.setMobileStatus(pageContext.getBindingObject(), completeStatus, libCommon.getUserGuid(context));
                }
                page = '#Page:SubOperationDetailsPage';
                pageContext = '';
                try {
                    pageContext = context.evaluateTargetPathForAPI(page);
                } catch (err) {
                    //page does not exist
                }
                if (pageContext) {
                    libThis.setMobileStatus(pageContext.getBindingObject().WorkOrderOperation, completeStatus, libCommon.getUserGuid(context));
                }
                break;
            }
            case '#sap_mobile.MyWorkOrderSubOperation': {
                page = '#Page:SubOperationDetailsPage';
                try {
                    pageContext = context.evaluateTargetPathForAPI(page);
                } catch (err) {
                    //page does not exist
                }
                if (pageContext) {
                    libThis.setMobileStatus(pageContext.getBindingObject(), completeStatus, libCommon.getUserGuid(context));
                }
                break;
            }
        }
    }

}
