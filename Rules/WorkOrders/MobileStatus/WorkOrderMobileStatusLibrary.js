import libMobile from '../../MobileStatus/MobileStatusLibrary';
import libOprMobile from '../../Operations/MobileStatus/OperationMobileStatusLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
import {PartnerFunction} from '../../Common/Library/PartnerFunction';
import Logger from '../../Log/Logger';
import isTimeSheetsEnabled from '../../TimeSheets/TimeSheetsIsEnabled';
import isConfirmationsEnabled from '../../Confirmations/ConfirmationsIsEnabled';
import confirmationsCreateUpdateNav from '../../Confirmations/CreateUpdate/ConfirmationCreateUpdateNav';
import WorkOrderOperationsCount from '../Operations/WorkOrderOperationsCount';
import CompleteWorkOrderMobileStatusAction from './CompleteWorkOrderMobileStatusAction';
import libClock from '../../ClockInClockOut/ClockInClockOutLibrary';
import WorkOrderStartStatus from '../MobileStatus/WorkOrderStartStatus';
import authorizedConfirmationCreate from '../../UserAuthorizations/Confirmations/EnableConfirmationCreate';
import authorizedTimeSheetCreate from '../../UserAuthorizations/TimeSheets/EnableTimeSheetCreate';
import isSignatureControlEnabled from '../../SignatureControl/SignatureControlViewPermission';
const workOrderDetailsPage = 'WorkOrderDetailsPage';

export default class {

    static startWorkOrder(context) {
        var woStarted = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
        return libClock.setInterimMobileStatus(context, woStarted).then(() => { //Handle clock in/out logic
            if (context.getPageProxy) {
                libMobile.setStartStatus(context.getPageProxy());
            } else {
                libMobile.setStartStatus(context);
            }
            libCommon.SetBindingObject(context);
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderStartUpdate.action').then(() => {
                //Set toolbar caption.
                this.setCaption(context, 'Start');
                //Set context binding object mobile status to started.
                context.getBindingObject().OrderMobileStatus_Nav.MobileStatus = woStarted;
                //Set WorkOrderDetailsPage state variable isAnyWorkOrderStarted = true
                libCommon.setStateVariable(context, 'isAnyWorkOrderStarted', true, 'WorkOrderDetailsPage');
                
                libClock.setClockInWorkOrderODataValues(context); //Handle clock in create for work order
                return context.executeAction('/SAPAssetManager/Actions/ClockInClockOut/WorkOrderClockInOut.action').then(() => {
                    return libClock.reloadUserTimeEntries(context).then(() => {
                        this.setCaption(context, 'Start');
                        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusSuccessMessage.action');
                    });
                }).catch(err => {
                    context.dismissActivityIndicator();
                    /**Implementing our Logger class*/
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), err);
                    return '';
                });
            },
            () => {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
            });
        });
    }


    static showTimeCaptureMessage(context, isFinalRequired=false) {

        if (isConfirmationsEnabled(context) && authorizedConfirmationCreate(context)) {
            return libMobile.getStatusForOperations(context, context.binding.OrderId).then(query => {
                return WorkOrderOperationsCount(context, query).then(count => {
                    // Check to make sure the count for Confirmation Operations > 0
                    if (count > 0) {
                        // Display the confirmations message
                        return this.showConfirmationMessage(context, isFinalRequired);
                    }
                    // If operation count = 0, do nothing
                    return true;
                });
            });
        } else if (isTimeSheetsEnabled(context) && authorizedTimeSheetCreate(context)) {
            // If time sheets is enabled, display time sheet message
            return this.showTimeSheetMessage(context);
        }
        // Default resolve true
        return Promise.resolve(true);
    }

    static showTimeSheetMessage(context) {
        return this.showWorkOrderTimesheetMessage(context).then(bool => {
            if (bool) {
                libCommon.setOnCreateUpdateFlag(context, 'CREATE');
                return context.executeAction('/SAPAssetManager/Actions/TimeSheets/TimeSheetEntryCreateForWONav.action').then(() => {
                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusSuccessMessage.action');
                }, error => {
                    /**Implementing our Logger class*/
                    context.dismissActivityIndicator();
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), error);
                });
            }
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusSuccessMessage.action');
        });
    }

    static showConfirmationMessage(context, isFinalRequired=false) {
        return this.showWorkOrderConfirmationsMessage(context).then(didSelectOk => {
            if (!didSelectOk) {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusSuccessMessage.action');
            }
            let startDate = libCommon.getStateVariable(context, 'StatusStartDate');
            let endDate = libCommon.getStateVariable(context, 'StatusEndDate');
            let binding = context.binding;

            // Override page values as shown
            let overrides = {
                'IsWorkOrderChangable': false,
                'WorkOrderHeader': binding,
                'OrderID': binding.OrderId,
                'IsFromWorkOrderHold': binding.IsFromWorkOrderHold,
                'Plant' : binding.MainWorkCenterPlant,
            };

            if (isFinalRequired) {
                overrides.IsFinalChangable = false;
                overrides.IsFinal = true;
            }

            return confirmationsCreateUpdateNav(context, overrides, startDate, endDate).then(() => {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusSuccessMessage.action');
            }, error => {
                /**Implementing our Logger class*/
                context.dismissActivityIndicator();
                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), error);
            });

        });
    }

    static holdWorkOrder(context) {
        var parent = this;
        var woHold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
        
        return libClock.setInterimMobileStatus(context, woHold).then(() => { //Handle clock in/out logic
            libMobile.setHoldStatus(context);
            libCommon.SetBindingObject(context);
            /*
            * Set WorkOrderDetailsPage state variable isAnyWorkOrderStarted to undefined to run the db query again.
            * because we don't know if it was this order that was started or if it was another order.
            */
            libCommon.setStateVariable(context, 'isAnyWorkOrderStarted', undefined, 'WorkOrderDetailsPage');
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderHoldUpdate.action').then(() => {
                //Set context binding object mobile status to hold.
                context.getBindingObject().OrderMobileStatus_Nav.MobileStatus = woHold;
                context.getBindingObject().IsFromWorkOrderHold = true;
                //Handle clock out create for work order
                libClock.setClockOutWorkOrderODataValues(context);
                return context.executeAction('/SAPAssetManager/Actions/ClockInClockOut/WorkOrderClockInOut.action').then(() => {
                    parent.showTimeCaptureMessage(context);
                    return libClock.reloadUserTimeEntries(context).then(() => {
                        context.dismissActivityIndicator();
                        parent.setCaption(context, 'Hold');
                        return Promise.resolve(true);
                    });
                }).catch(err => {
                    context.dismissActivityIndicator();
                    /**Implementing our Logger class*/
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), err);
                });
            }, () => {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
            });
        });
    }

    static showTransferWarningMessage(context) {
        return this.showWorkOrderTransferWarningMessage(context).then(bool => {
            if (bool) {
                libMobile.setTransferStatus(context);
                libCommon.SetBindingObject(context);
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/WorkOrderTransferNav.action');
            } else {
                return Promise.resolve(false);
            }
        });
    }

    static transferWorkOrder(context) {
        return this.showTransferWarningMessage(context);
    }

    static updateCompleteStatus(context) {

        let binding = context.binding;
        let actionArgs = {
            WorkOrderId: binding.OrderId,
        };
        let action = new CompleteWorkOrderMobileStatusAction(actionArgs);
        context.getClientData().confirmationArgs = {
            doCheckWorkOrderComplete: false,
        };
        // Add this action to the binding
        context.getClientData().mobileStatusAction = action;
        // Hold the previous state of the context
        let pageContext = context;
        // eslint-disable-next-line consistent-return
        return this.showTimeCaptureMessage(context, true).then(() =>{
            return action.execute(context).then(() => {
                return this.didSetWorkOrderComplete(pageContext);
            });
        }, () => {
            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
        });

    }

    // Called after the work order has been set to complete
    static didSetWorkOrderComplete(context) {
        this.setCaption(context, 'Complete');
        libCommon.enableToolBar(context, workOrderDetailsPage, 'IssuePartTbI', false);
        try {
            context.setActionBarItemVisible(0, false);
            context.setActionBarItemVisible(1, false);
        } catch (exception) {
            /**Implementing our Logger class*/
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), `workOrdersListViewPage refresh error: ${exception}`);
        }
        //remove the marked job related if theres any
        if (context.binding.MarkedJob) {
            context.executeAction('/SAPAssetManager/Actions/WorkOrders/MarkedJobDelete.action');
        }
        context.getControl('SectionedTable').redraw();
    }

    
    /**
     * When completing work order, operation or sub-operation, capture the notification malfunction end date on associated parent notification if breakdown is set
     * @param {*} context 
     */
    
    static NotificationUpdateMalfunctionEnd(context, woBinding) {

        if (woBinding.NotificationNumber) {
            let binding = context.getBindingObject();
            let readLink = woBinding['@odata.readLink'] + '/Notification';
            return context.read('/SAPAssetManager/Services/AssetManager.service', readLink, [], '$expand=NotifMobileStatus_Nav').then(results => {
                if (results && results.length > 0) {
                    let notif = results.getItem(0);
                    let complete = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
                    if (notif.BreakdownIndicator && notif.NotifMobileStatus_Nav.MobileStatus !== complete && !notif.MalfunctionEndDate) {  //Breakdown is set and end date is not set and notification is not already complete
                        let oldBinding = binding;
                        context.getPageProxy().setActionBinding(notif);
                        return context.executeAction('/SAPAssetManager/Actions/Notifications/NotificationUpdateMalfunctionEndNav.action').then(() => {
                            context.getPageProxy().setActionBinding(oldBinding);
                            return Promise.resolve();
                        });
                    }
                }
                return Promise.resolve();
            });
        }
        return Promise.resolve();
    }

    static completeWorkOrder(context) {
        let parent = this;
        return this.showWorkOrderCompleteWarningMessage(context).then(bool => {
            if (bool) {
                return isSignatureControlEnabled(context).then(() => {
                    libMobile.setCompleteStatus(context); // set the status to complete when user clicks "Yes" on the Work Order complete warning message
                    return parent.NotificationUpdateMalfunctionEnd(context, context.getBindingObject()).then(() => { //Capture malfunction end date if breakdown set
                        if (libMobile.isHeaderStatusChangeable(context)) { //Handle clock out create for work order
                            libClock.setClockOutWorkOrderODataValues(context);
                            return context.executeAction('/SAPAssetManager/Actions/ClockInClockOut/WorkOrderClockInOut.action').then(() => {
                                return this.updateCompleteStatus(context).then(() => {
                                    this.setCaption(context, 'Complete');
                                    return libClock.reloadUserTimeEntries(context);
                                });
                            }).catch(err => {
                                context.dismissActivityIndicator();
                                /**Implementing our Logger class*/
                                Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), err);
                                return '';
                            });
                        }
                        return Promise.resolve();
                    }).catch(err => {
                    context.dismissActivityIndicator();
                    /**Implementing our Logger class*/
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), err);
                    return '';
                    });
                });
            } else {
                return Promise.resolve(false);
            }
        });
    }

    static setCaption(context, status) {
        switch (status) {
            case 'Start':
                if (typeof context.setToolbarItemCaption !== 'function') {
                    context = context.getPageProxy();
                }
                if (libClock.isCICOEnabled(context)) { //Handle clock in/out feature
                    context.setToolbarItemCaption('IssuePartTbI', context.localizeText('clock_out'));
                } else {
                    context.setToolbarItemCaption('IssuePartTbI', context.localizeText('end_workorder'));
                }
                break;
            case 'Hold':
                if (libClock.isCICOEnabled(context)) { //Handle clock in/out feature
                    context.setToolbarItemCaption('IssuePartTbI', context.localizeText('clock_in'));
                } else {
                    context.setToolbarItemCaption('IssuePartTbI', context.localizeText('start_workorder'));
                }
                break;
            case 'Transfer':
                context.setToolbarItemCaption('IssuePartTbI', context.localizeText('transferred'));
                break;
            case 'Complete':
                context.setToolbarItemCaption('IssuePartTbI', context.localizeText('completed'));
                break;
            default:
                context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
                break;
        }
    }

    static workOrderStatusPopoverMenu(context) {
        context.dismissActivityIndicator();
        if (libMobile.isHeaderStatusChangeable(context)) {
            let mobileStatus = libMobile.getMobileStatus(context.binding);
            let woReceived = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/ReceivedParameterName.global').getValue());
            let woHold = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/HoldParameterName.global').getValue());
            var woStarted = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());

            //User may be clocked in to this WO locally regardless of what mobile status is set to
            //Status may have been changed by another user, so trap that here
            if (libClock.isBusinessObjectClockedIn(context)) {
                return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderChangeStausStartPopover.action');
            } else {
                if (mobileStatus === woReceived || mobileStatus === woHold) {
                    //This order is not started. It is currently either on hold or received status.
                    let isAnyOtherWorkOrderStartedPromise = this.isAnyWorkOrderStarted(context);
                    return isAnyOtherWorkOrderStartedPromise.then(
                        isAnyOtherWorkOrderStarted => {
                            if (isAnyOtherWorkOrderStarted) {
                                if (libCommon.isCurrentReadLinkLocal(context.binding['@odata.readLink'])) {
                                    return Promise.resolve();
                                } else {
                                    var pageContext = libMobile.getPageContext(context, 'WorkOrderDetailsPage');
                                    return this.transferWorkOrder(pageContext).then(function(result) {
                                        if (result) {
                                            this.setCaption(context.getPageProxy(), 'Transfer');
                                        }
                                    });
                                }
                            } else if (mobileStatus === woReceived) {
                                if (libCommon.isCurrentReadLinkLocal(context.binding['@odata.readLink'])) {
                                    return this.startWorkOrder(context);
                                } else {
                                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderChangeStausReceivePopover.action');
                                }
                            } else if (mobileStatus === woHold) {
                                if (libCommon.isCurrentReadLinkLocal(context.binding['@odata.readLink'])) {
                                    return this.startWorkOrder(context);
                                } else {
                                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderChangeStausHoldPopover.action');
                                }
                            } else {
                                return Promise.resolve('');
                            }
                        }
                    );
                } else if (mobileStatus === woStarted) {
                    if (libClock.isCICOEnabled(context)) { //Handle clock in/out feature
                        if (context.binding.clockMobileUserGUID === libCommon.getUserGuid(context)) {
                            //This WO was started by current user, or user is clocked into this WO
                            return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderChangeStausStartPopover.action');
                        } else {
                            //This WO was started by someone else, so clock current user in and adjust mobile status
                            return WorkOrderStartStatus(context);
                        }
                    } else {
                        return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderChangeStausStartPopover.action');
                    }
                }
            }
        }
        return Promise.resolve('');
    }

    static showWorkOrderTransferWarningMessage(context) {
        let message = context.localizeText('transfer_workorder');
        return libMobile.showWarningMessage(context, message);
    }

    static showWorkOrderCompleteWarningMessage(context) {
        let message = context.localizeText('complete_workorder');
        return libMobile.showWarningMessage(context, message);
    }

    static showWorkOrderTimesheetMessage(context) {
        let message = context.localizeText('workorder_add_timesheet_message');
        let caption = context.localizeText('time_entry');
        return libMobile.showWarningMessage(context, message, caption);
    }

    static showWorkOrderConfirmationsMessage(context) {
        let message = context.localizeText('confirmations_add_time_message');
        let caption = context.localizeText('time_entry');
        return libMobile.showWarningMessage(context, message, caption);
    }

    static headerMobileStatus(context) {
        if (libMobile.isHeaderStatusChangeable(context)) {
            return libMobile.mobileStatus(context, context.binding);
        } else if (libMobile.isOperationStatusChangeable(context)) {
            return libOprMobile.operationRollUpMobileStatus(context, 'MyWorkOrderOperations');
        } else if (libMobile.isSubOperationStatusChangeable(context)) {
            return libOprMobile.operationRollUpMobileStatus(context, 'MyWorkOrderSubOperations');
        }
        return libMobile.mobileStatus(context, context.binding);
    }

    static isOrderComplete(context) {
        var pageContext = context;
        try {
            pageContext = context.evaluateTargetPathForAPI('#Page:' + workOrderDetailsPage);
        } catch (error) {
            /**Implementing our Logger class*/
            Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), `isOrderComplete error: ${error}`);
        }
        return new Promise((resolve, reject) => {
            try {
                var woComplete = libCommon.getAppParam(pageContext, 'MOBILESTATUS', pageContext.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/CompleteParameterName.global').getValue());
                let entitySet = pageContext.binding['@odata.readLink'];
                if (pageContext.binding['@odata.type'] === '#sap_mobile.MyWorkOrderOperation') {
                    entitySet = pageContext.binding.WOHeader['@odata.readLink'];
                }
                 /**
                 * This read needs a  work order readLink to verify if the workorder has been completed or not.
                 */
                return context.read('/SAPAssetManager/Services/AssetManager.service', entitySet, [], '$expand=OrderMobileStatus_Nav').then(function(woHeader) {
                    if (woHeader) {
                        return  libMobile.mobileStatus(pageContext, woHeader.getItem(0)).then(status => {
                            if (status === woComplete) {
                                return resolve(true);
                            } else {
                                return resolve(false);
                            }
                        });
                    }
                    return resolve(false);
                });
            } catch (error) {
                return reject(false);
            }
        });
    }

    /**
     * Gets the mobile status of the work order.
     * @param {*} context Context.binding needs to be the work order object.
     */
    static getWorkOrderMobileStatus(context) {
        return libMobile.getMobileStatus(context.binding);
    }

    static getPartnerNumber(context) {
        var OrderId = libCommon.getTargetPathValue(context, '#Property:OrderId');
        var partnerFunction = PartnerFunction.getPersonnelPartnerFunction();
        var queryOptions = "$filter=(OrderId eq '" + OrderId + "' and PartnerFunction eq '" + partnerFunction + "')";
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderPartners', [], queryOptions).then(results => {
            if (results && results.length > 0) {
                return results.getItem(0).Partner;
            }
            return '';
        });
    }

    /**
     * Checks to see if at least one work order has been started from all the work orders.
     * Returns a Promise whose value is true if at least one order is in started status and false otherwise.
     * Also, sets state variable 'isAnyWorkOrderStarted' on Page 'WorkOrderDetailsPage' with the same value.
     * @param {*} context MDKPage context
     */
    static isAnyWorkOrderStarted(context) {
        var isAnyWorkOrderStarted = libCommon.getStateVariable(context, 'isAnyWorkOrderStarted', 'WorkOrderDetailsPage');
        if (typeof isAnyWorkOrderStarted !== 'undefined') {
            return Promise.resolve(isAnyWorkOrderStarted);
        } else {
            var userGUID = libCommon.getUserGuid(context);
            let woStarted = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
            let queryOption = "$expand=OrderMobileStatus_Nav&$filter=OrderMobileStatus_Nav/MobileStatus eq '" + woStarted + "'";
            queryOption += " and OrderMobileStatus_Nav/CreateUserGUID eq '" + userGUID + "'"; //Only find work orders that we started
            isAnyWorkOrderStarted = false;
            return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderHeaders', [], queryOption).then(
                startedOrdersList => {
                    if (startedOrdersList) {
                        var total = startedOrdersList.length;
                        if (total > 0) {
                            isAnyWorkOrderStarted = true;
                        }
                    }
                    if (!isAnyWorkOrderStarted) {
                        return libClock.isUserClockedIn(context).then(clockedIn => { //Check if user is clocked in
                            if (clockedIn) {
                                isAnyWorkOrderStarted = true;
                            }
                            libCommon.setStateVariable(context, 'isAnyWorkOrderStarted', isAnyWorkOrderStarted, 'WorkOrderDetailsPage');
                            return isAnyWorkOrderStarted;
                        });
                    } else {
                        libCommon.setStateVariable(context, 'isAnyWorkOrderStarted', isAnyWorkOrderStarted, 'WorkOrderDetailsPage');
                        return isAnyWorkOrderStarted;
                    }
                },
                error => {
                    // Implementing our Logger class
                    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryWorkOrders.global').getValue(), error);
                    return context.executeAction('/SAPAssetManager/Actions/WorkOrders/MobileStatus/WorkOrderMobileStatusFailureMessage.action');
                });
        }
    }
}
