import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
import Logger from '../../Log/Logger';
import HideActionItems from '../../Common/HideActionItems';
import isTimeSheetsEnabled from '../../TimeSheets/TimeSheetsIsEnabled';
import isConfirmationsEnabled from '../../Confirmations/ConfirmationsIsEnabled';
import confirmationsCreateUpdateNav from '../../Confirmations/CreateUpdate/ConfirmationCreateUpdateNav';
import CompleteOperationMobileStatusAction from './CompleteOperationMobileStatusAction';
import UnconfirmOperationMobileStatusAction from './UnconfirmOperationMobileStatusAction';
import {ChecklistLibrary as libChecklist} from '../../Checklists/ChecklistLibrary';
import libClock from '../../ClockInClockOut/ClockInClockOutLibrary';
import authorizedConfirmationCreate from '../../UserAuthorizations/Confirmations/EnableConfirmationCreate';
import authorizedTimeSheetCreate from '../../UserAuthorizations/TimeSheets/EnableTimeSheetCreate';
import libWOStatus from '../../WorkOrders/MobileStatus/WorkOrderMobileStatusLibrary';
import isSignatureControlEnabled from '../../SignatureControl/SignatureControlViewPermission';
const workOrderOperationDetailsPage = 'WorkOrderOperationDetailsPage';

export default class {

    static showTimeCaptureMessage(context, isFinalRequired=false) {

        if (isConfirmationsEnabled(context) && authorizedConfirmationCreate(context)) {
            return this.showConfirmationsCaptureMessage(context, isFinalRequired);
        } else if (isTimeSheetsEnabled(context) && authorizedTimeSheetCreate(context)) {
            return this.showTimeSheetCaptureMessage(context);
        }
        // Default resolve true
        return Promise.resolve(true);
    }

    static showConfirmationsCaptureMessage(context, isFinalRequired=false) {
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
                'OrderID': binding.OrderId,
                'WorkOrderHeader': binding.WOHeader,
                'Operation': binding.OperationNo,
                'MobileStatus': binding.MobileStatus,
                'IsFinalChangable': false,
                'Plant' : binding.MainWorkCenterPlant,
                'doCheckOperationComplete' : false,
                'OperationActivityType': binding.ActivityType,
            };

            if (isFinalRequired) {
                overrides.IsFinal = true;
            }

            return confirmationsCreateUpdateNav(context, overrides, startDate, endDate).then(() => {
                return Promise.resolve(true);
            }, error => {
                context.dismissActivityIndicator();
                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryOperations.global').getValue(), error);
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
            });
        });
    }

    static showTimeSheetCaptureMessage(context) {
        return this.showWorkOrderTimesheetMessage(context).then(
            bool => {
                if (bool) {
                    return context.executeAction('/SAPAssetManager/Actions/TimeSheets/TimeSheetEntryCreateForWONav.action').then(function() {
                        if (libMobile.isOperationStatusChangeable(context)) {
                            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusSuccessMessage.action').then(function() {
                            });
                        } else {
                            return Promise.resolve();
                        }
                    },
                   error => {
                       /**Implementing our Logger class*/
                       context.dismissActivityIndicator();
                       Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryOperations.global').getValue(), error);
                       return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
                   });
                } else {
                    return Promise.resolve();
                }
            });
    }

    static startOperation(context) {

        let pageContext = context;
        if (typeof context.setToolbarItemCaption !== 'function') {
            pageContext = context.getPageProxy();
        }

        var opStarted = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
        return libClock.setInterimMobileStatus(context, opStarted).then(() => { //Handle clock in/out logic
            libMobile.setStartStatus(context);
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationStartUpdate.action').then(function() {
                libClock.setClockInOperationODataValues(context); //Handle clock in for operation
                return context.executeAction('/SAPAssetManager/Actions/ClockInClockOut/WorkOrderClockInOut.action').then(() => {
                    pageContext.setToolbarItemCaption('IssuePartTbI', libClock.isCICOEnabled(context) ? context.localizeText('clock_out') : context.localizeText('end_operation'));
                    return libClock.reloadUserTimeEntries(context).then(() => {
                        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusSuccessMessage.action');
                    });
                });
            },
            () => {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
            });
        });
    }

    static holdOperation(context) {
        var parent = this;
        return this.showOperationHoldWarningMessage(context).then(
            result => {
                if (result) {
                    var opHold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
                    return libClock.setInterimMobileStatus(context, opHold).then(() => { //Handle clock in/out logic
                        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationHoldUpdate.action').then(function() {
                            libMobile.setHoldStatus(context);
                            libClock.setClockOutOperationODataValues(context); //Handle clock out create for operation
                            return context.executeAction('/SAPAssetManager/Actions/ClockInClockOut/WorkOrderClockInOut.action').then(() => {
                                context.setToolbarItemCaption('IssuePartTbI', libClock.isCICOEnabled(context) ? context.localizeText('clock_in') : context.localizeText('start_operation'));
                                parent.showTimeCaptureMessage(context);
                                return libClock.reloadUserTimeEntries(context).then(() => {
                                    context.dismissActivityIndicator();
                                    return Promise.resolve(true);
                                });
                            });
                        },
                            () => {
                                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
                            });
                        });
                    } else {
                    return Promise.resolve();
                }
        });
    }

    static transferOperation(context) {
        if (libCommon.getWorkOrderAssignmentType(context)!=='4' && libCommon.getWorkOrderAssignmentType(context)!=='A') {
                return this.showOperationTransferWarningMessage(context);
        } else {
            context.dismissActivityIndicator();
            return Promise.resolve();
        }
    }

    static completeOperation(context) {
        let pageContext = libMobile.getPageContext(context, workOrderOperationDetailsPage);
        let parent = this;
        let promises = [];
        const pageBinding = pageContext.getBindingObject();
        const equipment = pageBinding.OperationEquipment;
        const functionalLocation = pageBinding.OperationFunctionLocation;
        return libChecklist.allowWorkOrderComplete(context, equipment, functionalLocation).then(results => { //Check for non-complete checklists and ask for confirmation
            if (results === true) {
                return this.showOperationCompleteWarningMessage(context).then(
                    doMarkComplete => {
                        if (!doMarkComplete) {
                            // User elected not to mark this operation as complete
                            return '';
                        }
                        if (libMobile.isOperationStatusChangeable(context)) {
                            promises.push(isSignatureControlEnabled(context));
                        }
                        return Promise.all(promises).then(() => {
                            let binding = pageContext.getBindingObject();
                            let actionArgs = {
                                OperationId: binding.OperationNo,
                                WorkOrderId: binding.OrderId,
                                isOperationStatusChangeable: libMobile.isOperationStatusChangeable(context),
                                isHeaderStatusChangeable: libMobile.isHeaderStatusChangeable(context),
                            };
                            return libWOStatus.NotificationUpdateMalfunctionEnd(context, binding.WOHeader).then(() => { //Capture malfunction end date if breakdown set
                                return parent.showTimeCaptureMessage(pageContext, true).then(() => {
                                    // Action did execute, update UI accordingly
                                    if (libMobile.isOperationStatusChangeable(context)) { //Handle clock out create for operation
                                        libClock.setClockOutOperationODataValues(context);
                                        promises.push(context.executeAction('/SAPAssetManager/Actions/ClockInClockOut/WorkOrderClockInOut.action'));
                                    }
                                    return Promise.all(promises).then(() => {
                                        actionArgs.didCreateFinalConfirmation = libCommon.getStateVariable(context, 'IsFinalConfirmation', libCommon.getPageName(context));
                                        let action = new CompleteOperationMobileStatusAction(actionArgs);
                                        pageContext.getClientData().confirmationArgs = {
                                            doCheckOperationComplete: false,
                                        };
                                        // Add this action to client data for retrieval as needed
                                        pageContext.getClientData().mobileStatusAction = action;
                                        return action.execute(pageContext).then((result) => {
                                            if (result) {
                                                return libClock.reloadUserTimeEntries(context).then(() => {
                                                    return parent.didSetOperationCompleteWrapper(pageContext);
                                                });
                                            }
                                            return false;
                                        });
                                    }, () => {
                                        return pageContext.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
                                    });
                                });
                            });
                        });
                    });
            } else {
                context.dismissActivityIndicator();
                return Promise.resolve(true);
            }
        });
    }
    static unconfirmOperation(context) {
        let pageContext = libMobile.getPageContext(context, workOrderOperationDetailsPage);
        let parent = this;

        return this.showUnconfirmOperationWarningMessage(context).then(
            doMarkUnconfirm => {
                if (!doMarkUnconfirm) {
                    //User chose not to unconfirm operation
                    return '';
                }

                let binding = pageContext.getBindingObject();
                let actionArgs = {
                    OperationId: binding.OperationNo,
                    WorkOrderId: binding.OrderId,
                };

                let action = new UnconfirmOperationMobileStatusAction(actionArgs);
                // Add this action to client data for retrieval as needed
                pageContext.getClientData().mobileStatusAction = action;

                return action.execute(pageContext).then(() => {
                    return parent.didSetOperationUnconfirm(pageContext);
                }, () => {
                    return pageContext.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationUnconfirmFailureMessage.action');
                });

            }
        );
    }

    static didSetOperationCompleteWrapper(context) {
        if (libMobile.isOperationStatusChangeable(context)) {
            return this.didSetOperationComplete(context);
        } else if (libMobile.isHeaderStatusChangeable(context)) {
            return this.didSetOperationConfirm(context);
        } else {
            return Promise.resolve();
        }
    }

    static didSetOperationComplete(context) {

        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('complete_text'));
        libCommon.enableToolBar(context, workOrderOperationDetailsPage, 'IssuePartTbI', false);
        // Hide the action items
        HideActionItems(context, 2);

        libMobile.setCompleteStatus(context);
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusSuccessMessage.action');
    }

    static didSetOperationConfirm(context) {
        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('unconfirm'));
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationConfirmSuccessMessage.action');
    }

    static didSetOperationUnconfirm(context) {
        context.setToolbarItemCaption('IssuePartTbI', context.localizeText('confirm'));
        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationUnconfirmSuccessMessage.action');
    }

    static operationStatusPopoverMenu(context) {

        var parent = this;
        let started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());

        //Change operation status when assignment type is at work order header level.
        if (libMobile.isHeaderStatusChangeable(context)) {
            let workOrderMobileStatus = libMobile.getMobileStatus(context.binding.WOHeader);
            if (workOrderMobileStatus === started) {
                return libMobile.isMobileStatusConfirmed(context).then(result => {
                    if (result) {
                        return this.unconfirmOperation(context);
                    } else {
                        return this.completeOperation(context);
                    }
                });
            }
            context.dismissActivityIndicator();
            return libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
        }

        //Return the appropriate pop-over operation statuses when assignment type is at operation level.
        if (libMobile.isOperationStatusChangeable(context)) {
            let received = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
            let hold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
            let mobileStatus = libMobile.getMobileStatus(context.binding);

            if (libClock.isBusinessObjectClockedIn(context)) {
                context.dismissActivityIndicator();
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationChangeStausStartPopover.action');
            } else {
                if (mobileStatus === received || mobileStatus === hold) {
                    //This operation is not started. It is currently either on hold or received status.
                    let isAnyOtherOperationStartedPromise = this.isAnyOperationStarted(context);
                    return isAnyOtherOperationStartedPromise.then(
                        isAnyOtherOperationStarted => {
                            if (isAnyOtherOperationStarted) {
                                let pageContext = libMobile.getPageContext(context, workOrderOperationDetailsPage);
                                return this.transferOperation(pageContext);
                            } else if (mobileStatus === received) {
                                context.dismissActivityIndicator();
                                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationChangeStausReceivePopover.action');
                            } else if (mobileStatus === hold) {
                                context.dismissActivityIndicator();
                                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationChangeStausHoldPopover.action');
                            } else {
                                context.dismissActivityIndicator();
                                return Promise.resolve('');
                            }
                        }
                    );
                } else if (mobileStatus === started) {
                    context.dismissActivityIndicator();
                    if (libClock.isCICOEnabled(context)) { //Handle clock in/out feature
                        if (context.binding.clockMobileUserGUID && context.binding.clockMobileUserGUID === libCommon.getUserGuid(context)) {
                            //This op was started by current user
                            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationChangeStausStartPopover.action');
                        } else {
                            //This op was started by someone else, so clock current user in and adjust mobile status
                            return parent.startOperation(context);
                        }
                    } else {
                        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationChangeStausStartPopover.action');
                    }
                }
            }
        }

        //If assignment level is at sub-operation level, then operation mobile status cannot be changed.
        if (libMobile.isSubOperationStatusChangeable(context)) {
            return context.executeAction('/SAPAssetManager/Actions/MobileStatus/MobileStatusNotChangeable.action');
        }

        context.dismissActivityIndicator();
        return Promise.resolve('');
    }


    static showOperationTransferWarningMessage(context) {
        return libMobile.showWarningMessage(context, context.localizeText('transfer_operation_warning_message')).then(bool => {
            if (bool) {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/Operations/OperationTransferNav.action').then(function() {
                    libMobile.setTransferStatus(context);
                    libCommon.SetBindingObject(context);
                });
            } else {
                return Promise.resolve(false);
            }
        });
    }

    static showOperationHoldWarningMessage(context) {
        return libMobile.showWarningMessage(context, context.localizeText('hold_operation_warning_message'));
    }

    static showOperationCompleteWarningMessage(context) {
        if (libMobile.isOperationStatusChangeable(context)) {
            return libMobile.showWarningMessage(context, context.localizeText('complete_operation_warning_message'));
        } else {
            return libMobile.showWarningMessage(context, context.localizeText('confirm_operation_warning_message'));
        }
    }

    static showUnconfirmOperationWarningMessage(context) {
        return libMobile.showWarningMessage(context, context.localizeText('unconfirm_operation_warning_message'));
    }

    static operationRollUpMobileStatus(context, entitySet) {
        let currentReadLink = libCommon.getTargetPathValue(context, '#Property:@odata.readLink');
        let isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
        var status = '';
        if (!isLocal) {
            var orderID = libMobile.getOrderId(context);
            var started = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
            var hold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
            var complete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
            return context.read('/SAPAssetManager/Services/AssetManager.service', entitySet, ['OperationNo','OrderId', 'ObjectKey'], "$filter=(OrderId eq '" + orderID + "')&$orderby=OrderId")
                .then(function(results) {
                    if (results) {
                        var oprCount = results.length;
                        if (oprCount > 0) {
                            var oprStartQueryOption = '$select=ObjectKey,MobileStatus&$orderby=ObjectKey,MobileStatus&$filter=';
                            var oprHoldQueryOption = '$select=ObjectKey,MobileStatus&$orderby=ObjectKey,MobileStatus&$filter=';
                            var oprCompleteQueryOption = '$select=ObjectKey,MobileStatus&$orderby=ObjectKey,MobileStatus&$filter=';
                            for (var i = 0; i < oprCount; i++) {
                                if (i > 0) {
                                    oprStartQueryOption = oprStartQueryOption + ' or ';
                                    oprHoldQueryOption = oprHoldQueryOption + ' or ';
                                    oprCompleteQueryOption = oprCompleteQueryOption + ' or ';
                                }
                                var item = results.getItem(i);
                                oprStartQueryOption = oprStartQueryOption + "(ObjectKey eq '" + item.ObjectKey + "' and MobileStatus eq '" + started + "')";
                                oprHoldQueryOption = oprHoldQueryOption + "(ObjectKey eq '" + item.ObjectKey + "' and MobileStatus eq '" + hold + "')";
                                oprCompleteQueryOption = oprCompleteQueryOption + "(ObjectKey eq '" + item.ObjectKey + "' and MobileStatus eq '" + complete + "')";
                            }
                            return context.count('/SAPAssetManager/Services/AssetManager.service', 'PMMobileStatuses', oprStartQueryOption)
                                .then(oprStartCount => {
                                    if (oprStartCount > 0) {
                                        return started;
                                    }
                                    return context.count('/SAPAssetManager/Services/AssetManager.service', 'PMMobileStatuses', oprHoldQueryOption)
                                        .then(oprHoldCount => {
                                            if (oprHoldCount > 0) {
                                                return hold;
                                            }
                                            return context.count('/SAPAssetManager/Services/AssetManager.service', 'PMMobileStatuses', oprCompleteQueryOption)
                                                .then(oprCompleteCount => {
                                                    if (oprCompleteCount === oprCount) {
                                                        return complete;
                                                    }
                                                    return Promise.resolve(libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue()));

                                                }).catch(() => {
                                                    return Promise.resolve(libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue()));
                                                });
                                        }).catch(() => {
                                            return Promise.resolve(libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue()));

                                        });
                                }).catch(() => {
                                    return Promise.resolve(libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue()));

                                });
                        }
                    }
                    return Promise.resolve(libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue()));

                });
        } else {
            status = libCommon.getAppParam(context,'APPLICATION', 'LocalIdentifier');
        }
        return Promise.resolve(status);
    }

    static getOperationMobileStatus(context) {
        var pageContext = context.evaluateTargetPathForAPI('#Page:WorkOrderOperationDetailsPage');
        return new Promise((resolve, reject) => {
            try {
                libMobile.mobileStatus(pageContext, pageContext.binding).then(status => {
                    resolve(status);
                });
            } catch (error) {
                reject('');
            }
        });
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
     * Checks to see if at least one operation has been started from all of the operations of the work order.
     * Returns a Promise whose value is true if at least one operation is in started status and false otherwise.
     * Also, sets state variable 'isAnyOperationStarted' on Page 'WorkOrderOperationDetailsPage' with the same value.
     *
     * @param {*} context MDKPage context whose binding object is an operation.
     */
    static isAnyOperationStarted(context) {
        var isAnyOperationStarted = libCommon.getStateVariable(context, 'isAnyOperationStarted', 'WorkOrderOperationDetailsPage');
        if (typeof isAnyOperationStarted !== 'undefined') {
            return Promise.resolve(isAnyOperationStarted);
        } else {
            var userGUID = libCommon.getUserGuid(context);
            let startedStatus = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
            let queryOption = "$expand=OperationMobileStatus_Nav&$filter=OperationMobileStatus_Nav/MobileStatus eq '" + startedStatus + "'";
            queryOption += " and OperationMobileStatus_Nav/CreateUserGUID eq '" + userGUID + "'"; //Only find operations that we started
            isAnyOperationStarted = false;
            // Only get sibling operations, not all operations.
            return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderOperations', [], queryOption).then(
                startedOperationsList => {
                    if (startedOperationsList) {
                        var total = startedOperationsList.length;
                        if (total > 0) {
                            isAnyOperationStarted = true;
                        }
                    }
                    if (!isAnyOperationStarted) {
                        return libClock.isUserClockedIn(context).then(clockedIn => { //Check if user is clocked in
                            if (clockedIn) {
                                isAnyOperationStarted = true;
                            }
                            libCommon.setStateVariable(context, 'isAnyOperationStarted', isAnyOperationStarted, 'WorkOrderOperationDetailsPage');
                            return isAnyOperationStarted;
                        });
                    } else {
                        libCommon.setStateVariable(context, 'isAnyOperationStarted', isAnyOperationStarted, 'WorkOrderOperationDetailsPage');
                        return isAnyOperationStarted;
                    }
                },
                error => {
                    // Implementing our Logger class
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryOperations.global').getValue(), error);
                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/OperationMobileStatusFailureMessage.action');
                });
        }
    }

}
