import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
import Logger from '../../Log/Logger';
import HideActionItems from '../../Common/HideActionItems';
import isTimeSheetsEnabled from '../../TimeSheets/TimeSheetsIsEnabled';
import isConfirmationsEnabled from '../../Confirmations/ConfirmationsIsEnabled';
import confirmationsCreateUpdateNav from '../../Confirmations/CreateUpdate/ConfirmationCreateUpdateNav';
import CompleteSubOperationMobileStatusAction from './CompleteSubOperationMobileStatusAction';
import UnconfirmSubOperationMobileStatusAction from './UnconfirmSubOperationMobileStatusAction';
import libClock from '../../ClockInClockOut/ClockInClockOutLibrary';
import authorizedConfirmationCreate from '../../UserAuthorizations/Confirmations/EnableConfirmationCreate';
import authorizedTimeSheetCreate from '../../UserAuthorizations/TimeSheets/EnableTimeSheetCreate';
import libWOStatus from '../../WorkOrders/MobileStatus/WorkOrderMobileStatusLibrary';
import isSignatureControlEnabled from '../../SignatureControl/SignatureControlViewPermission';

const subOperationDetailsPage = 'SubOperationDetailsPage';

export default class {


    static showTimeCaptureMessage(context, isFinalRequired = false) {

        if (isConfirmationsEnabled(context) && authorizedConfirmationCreate(context)) {
            return this.showConfirmationsCaptureMessage(context, isFinalRequired);
        } else if (isTimeSheetsEnabled(context) && authorizedTimeSheetCreate(context)) {
            return this.showTimeSheetCaptureMessage(context);
        }
        return Promise.resolve(true);
    }

    static showConfirmationsCaptureMessage(context, isFinalRequired = false) {
        return this.showWorkOrderConfirmationMessage(context).then(didSelectOk => {
            if (!didSelectOk) {
                return Promise.resolve(true);
            }
            let startDate = libCommon.getStateVariable(context, 'StatusStartDate');
            let endDate = libCommon.getStateVariable(context, 'StatusEndDate');
            let binding = context.getBindingObject();

            let overrides = {
                'IsWorkOrderChangable': false,
                'IsOperationChangable': false,
                'IsSubOperationChangable': false,
                'OrderID': binding.OrderId,
                'WorkOrderHeader': binding.WorkOrderOperation.WOHeader,
                'Operation': binding.OperationNo,
                'SubOperation': binding.SubOperationNo,
                'MobileStatus': binding.MobileStatus,
                'WorkOrderOperation': binding.WorkOrderOperation,
                'IsFinalChangable': false,
                'Plant' : binding.MainWorkCenterPlant,
                'doCheckSubOperationComplete' : false,
                'doCheckOperationComplete': false,
                'OperationActivityType': binding.ActivityType,
            };

            if (isFinalRequired) {
                overrides.IsFinal = true;
            }

            return confirmationsCreateUpdateNav(context, overrides, startDate, endDate).then(() => {
                return Promise.resolve(true);
            });
        });
    }

    static showTimeSheetCaptureMessage(context) {
        return this.showWorkOrderTimesheetMessage(context).then(
            doSetComplete => {
                if (doSetComplete) {
                    return context.executeAction('/SAPAssetManager/Actions/TimeSheets/TimeSheetEntryCreateForWONav.action');
                }
                return Promise.resolve();
            }, error => {
                /**Implementing our Logger class*/
                context.dismissActivityIndicator();
                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySubOperations.global').getValue(), error);
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusFailureMessage.action');
            });
    }


    static startSubOperation(context) {
        let pageContext = context;
        if (typeof context.setToolbarItemCaption !== 'function') {
            pageContext = context.getPageProxy();
        }

        libMobile.setStartStatus(context);
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusStartUpdate.action').then(function() {
            //Handle clock in create for sub-operation
            libClock.setClockInSubOperationODataValues(context); 
            pageContext.setToolbarItemCaption('IssuePartTbI', context.localizeText('end_suboperation'));
            return context.executeAction('/SAPAssetManager/Actions/ClockInClockOut/WorkOrderClockInOut.action').then(() => {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusSuccessMessage.action');
            });
        });
    }

    static holdSubOperation(context) {
        var parent = this;
        return this.showSubOperationHoldWarningMessage(context).then(
            result => {
                if (result) {
                    libMobile.setHoldStatus(context);
                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusHoldUpdate.action').then(function() {
                        //Handle clock out create for sub-operation
                        libClock.setClockOutSubOperationODataValues(context);
                        return context.executeAction('/SAPAssetManager/Actions/ClockInClockOut/WorkOrderClockInOut.action').then(() => {
                            context.setToolbarItemCaption('IssuePartTbI', context.localizeText('start_suboperation'));
                            return parent.showTimeCaptureMessage(context);
                        });
                    });
                } else {
                    return Promise.resolve();
                }
            });
    }

    static transferSubOperation(context) {
        libMobile.setTransferStatus(context);
        return this.showSubOperationTransferWarningMessage(context);
    }

    static completeSubOperation(context) {
        var pageContext = libMobile.getPageContext(context, subOperationDetailsPage);
        var parent = this;
        let promises = [];
        return this.showSubOperationCompleteWarningMessage(pageContext).then(
            doSetComplete => {
                if (!doSetComplete) {
                    // Return early, user elected to not complete this operation
                    return true;
                }
                if (libMobile.isSubOperationStatusChangeable(context)) {
                    promises.push(isSignatureControlEnabled(context));
                }
                return Promise.all(promises).then(() => {
                    // Setup the SubOperation action
                    let binding = pageContext.getBindingObject();

                    let actionArgs = {
                        SubOperationId: binding.SubOperationNo,
                        OperationId: binding.OperationNo,
                        WorkOrderId: binding.OrderId,
                        isSubOperationStatusChangeable: libMobile.isSubOperationStatusChangeable(context),
                        isOperationStatusChangeable: libMobile.isOperationStatusChangeable(context),
                        isHeaderStatusChangeable: libMobile.isHeaderStatusChangeable(context),
                    };
                    return libWOStatus.NotificationUpdateMalfunctionEnd(context, binding.WorkOrderOperation.WOHeader).then(() => { //Capture malfunction end date if breakdown set
                        return parent.showTimeCaptureMessage(pageContext, true).then(() => {
                            if (libMobile.isSubOperationStatusChangeable(context)) { //Handle clock out create for sub-operation
                                libClock.setClockOutSubOperationODataValues(context);
                                promises.push(context.executeAction('/SAPAssetManager/Actions/ClockInClockOut/WorkOrderClockInOut.action'));
                            }
                            return Promise.all(promises).then(() => {
                                actionArgs.didCreateFinalConfirmation = libCommon.getStateVariable(context, 'IsFinalConfirmation', libCommon.getPageName(context));
                                let action = new CompleteSubOperationMobileStatusAction(actionArgs);
                                pageContext.getClientData().confirmationArgs = {
                                    doCheckSubOperationComplete: false,
                                    doCheckOperationComplete: false,
                                };
                                // Add this action to client data for retrieval as needed
                                pageContext.getClientData().mobileStatusAction = action;
                                return action.execute(pageContext).then(() => {
                                    return parent.didSetSubOperationCompleteWrapper(pageContext);
                                });
                            });
                            
                        }, (error) => {
                            /**Implementing our Logger class*/
                            pageContext.dismissActivityIndicator();
                            Logger.error(pageContext.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySubOperations.global').getValue(), error);
                            pageContext.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusFailureMessage.action');
                            return Promise.reject(error);
                        });
                    });
                });
            });
    }

    static unconfirmSubOperation(context) {
        let pageContext = libMobile.getPageContext(context, subOperationDetailsPage);
        let parent = this;

        return this.showUnconfirmSubOperationWarningMessage(context).then(
            doMarkUnconfirm => {
                if (!doMarkUnconfirm) {
                    //User chose not to unconfirm operation
                    return '';
                }

                let binding = pageContext.getBindingObject();
                let actionArgs = {
                    OperationId: binding.OperationNo,
                    WorkOrderId: binding.OrderId,
                    SubOperationId: binding.SubOperationNo,
                };

                let action = new UnconfirmSubOperationMobileStatusAction(actionArgs);
                // Add this action to client data for retrieval as needed
                pageContext.getClientData().mobileStatusAction = action;

                return action.execute(pageContext).then(() => {
                    return parent.didSetSubOperationUnconfirm(pageContext);
                }, () => {
                    return pageContext.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationUnconfirmFailureMessage.action');
                });

            }
        );
    }

    static showUnconfirmSubOperationWarningMessage(context) {
        return libMobile.showWarningMessage(context, context.localizeText('unconfirm_suboperation_warning_message'));
    }

    static didSetSubOperationCompleteWrapper(context) {
        if (libMobile.isSubOperationStatusChangeable(context)) {
            return this.didSetSubOperationComplete(context);
        } else {
            return this.didSetSubOperationConfirm(context);
        }
    }

    static didSetSubOperationComplete(context) {
        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('complete_text'));
        libCommon.enableToolBar(context, subOperationDetailsPage, 'IssuePartTbI', false);
        // Hide the toolbar items
        HideActionItems(context, 2);
        libMobile.setCompleteStatus(context);
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusSuccessMessage.action');
    }

    static didSetSubOperationConfirm(context) {
        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('unconfirm'));
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationConfirmSuccessMessage.action');
    }

    static didSetSubOperationUnconfirm(context) {
        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('confirm'));
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationUnconfirmSuccessMessage.action');
    }

    // eslint-disable-next-line consistent-return
    static subOperationStatusPopoverMenu(context) {
        var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());

        //Change sub-operation status when assignment type is at work order header level.
        if (libMobile.isHeaderStatusChangeable(context)) {
            let workOrderMobileStatus = libMobile.getMobileStatus(context.binding.WorkOrderOperation.WOHeader);
            if (workOrderMobileStatus === started) {
                return libMobile.isMobileStatusConfirmed(context, context.binding.SubOperationNo).then(result => {
                    if (result) {
                        return this.unconfirmSubOperation(context);
                    } else {
                        return this.completeSubOperation(context);
                    }
                });
            }
            context.dismissActivityIndicator();
            return libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        }

        //Change sub-operation status when assignment type is at operation level.
        if (libMobile.isOperationStatusChangeable(context)) {
            let operationMobileStatus = libMobile.getMobileStatus(context.binding.WorkOrderOperation);
            if (operationMobileStatus === started) {
                return libMobile.isMobileStatusConfirmed(context, context.binding.SubOperationNo).then(result => {
                    if (result) {
                        return this.unconfirmSubOperation(context);
                    } else {
                        return this.completeSubOperation(context);
                    }
                });
            }
            context.dismissActivityIndicator();
            return libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        }

        if (libMobile.isSubOperationStatusChangeable(context)) {
            var parent = this;
            var received = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
            var hold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
            let mobileStatus = libMobile.getMobileStatus(context.binding);
            if (mobileStatus === received || mobileStatus === hold) {
                //This sub-operation is not started. It is currently either on hold or received status.
                let isAnyOtherOperationStartedPromise = this.isAnySubOperationStarted(context);
                return isAnyOtherOperationStartedPromise.then(
                    isAnyOtherOperationStarted => {
                        if (isAnyOtherOperationStarted) {
                            var pageContext = libMobile.getPageContext(context, subOperationDetailsPage);
                            return this.transferSubOperation(pageContext);
                        } else if (mobileStatus === received || mobileStatus === hold) {
                            context.dismissActivityIndicator();
                            if (libCommon.isCurrentReadLinkLocal(context.binding['@odata.readLink'])) {
                                return parent.startSubOperation(context);
                            } else {
                                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationChangeStausReceivePopover.action');
                            }
                        } else {
                            context.dismissActivityIndicator();
                            return Promise.resolve('');
                        }
                    }
                );
            } else if (mobileStatus === started) {
                context.dismissActivityIndicator();
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationChangeStausStartPopover.action');
            }
        }

        context.dismissActivityIndicator();
        return Promise.resolve('');
    }

    static showSubOperationTransferWarningMessage(context) {
        let message = context.localizeText('transfer_suboperation');
        return libMobile.showWarningMessage(context, message).then(bool => {
            if (bool) {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationTransferNav.action');
            } else {
                return Promise.resolve(false);
            }
        });
    }

    static showSubOperationCompleteWarningMessage(context) {
        if (libMobile.isSubOperationStatusChangeable(context)) {
            return libMobile.showWarningMessage(context, context.localizeText('complete_suboperation'));
        } else {
            return libMobile.showWarningMessage(context, context.localizeText('confirm_suboperation_warning_message'));
        }
    }

    static showSubOperationHoldWarningMessage(context) {
        let message = context.localizeText('hold_suboperation_warning_message');
        return libMobile.showWarningMessage(context, message);
    }

    static showWorkOrderConfirmationMessage(context) {
        let message = context.localizeText('confirmations_add_time_message');
        return libMobile.showWarningMessage(context, message);
    }

    static showWorkOrderTimesheetMessage(context) {
        let message = context.localizeText('workorder_add_timesheet_message');
        return libMobile.showWarningMessage(context, message);
    }

    /**
     * Checks to see if at least one sub-operation has been started from all of the sub-operations of the operation.
     * Returns a Promise whose value is true if at least one sub-operation is in started status and false otherwise.
     * Also, sets state variable 'isAnySubOperationStarted' on Page 'SubOperationDetailsPage' with the same value.
     *
     * @param {*} context MDKPage context whose binding object is an operation.
     */
    static isAnySubOperationStarted(context) {
        var isAnySubOperationStarted = libCommon.getStateVariable(context, 'isAnySubOperationStarted', 'SubOperationDetailsPage');
        if (typeof isAnySubOperationStarted !== 'undefined') {
            return Promise.resolve(isAnySubOperationStarted);
        } else {
            var userGUID = libCommon.getUserGuid(context);
            let startedStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
            let queryOption = "$expand=SubOpMobileStatus_Nav&$filter=SubOpMobileStatus_Nav/MobileStatus eq '" + startedStatus + "'";
            queryOption += " and SubOpMobileStatus_Nav/CreateUserGUID eq '" + userGUID + "'"; //Only find sub-operations that we started
            isAnySubOperationStarted = false;
            // Only get sibling sub-operations, not all sub-operations.
            return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderSubOperations', [], queryOption).then(
                startedSubOperationsList => {
                    if (startedSubOperationsList) {
                        var total = startedSubOperationsList.length;
                        if (total > 0) {
                            isAnySubOperationStarted = true;
                        }
                    }
                    libCommon.setStateVariable(context, 'isAnySubOperationStarted', isAnySubOperationStarted, 'SubOperationDetailsPage');
                    return isAnySubOperationStarted;
                },
                error => {
                    // Implementing our Logger class
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySubOperations.global').getValue(), error);
                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/SubOperations/SubOperationMobileStatusFailureMessage.action');
                });
        }
    }

}
