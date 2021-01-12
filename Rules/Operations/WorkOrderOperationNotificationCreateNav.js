import libNotif from '../Notifications/NotificationLibrary';
import notifCreateChangeSetNav from '../Notifications/CreateUpdate/NotificationCreateChangeSetNav';
import libCommon from '../Common/Library/CommonLibrary';

export default function WorkOrderOperationNotificationCreateNav(context) {

    //set the follow up flag
    libNotif.setAddFromOperationFlag(context, true);

    let bindingObject = {
        HeaderEquipment: context.binding.OperationEquipment,
        HeaderFunctionLocation: context.binding.OperationFunctionLocation,
        ExternalWorkCenterId: context.binding.MainWorkCenter,
        MainWorkCenterPlant: context.binding.MainWorkCenterPlant,
        OperationOrderId: context.binding.OrderId,
    };

    // Return the result of the change set nav
    libCommon.setStateVariable(context, 'LocalId', ''); //Reset the localid before creating a new notification
    return notifCreateChangeSetNav(context, bindingObject).then(() => {
        //Start the process of checking if we need to add this notification as an object list to the work order.
        let localId = libCommon.getStateVariable(context, 'LocalId');
        let binding = context.binding;
        if (localId) {
            if (binding.WOHeader && binding.WOHeader.OrderType && binding.WOHeader.PlanningPlant) {
                let orderType = binding.WOHeader.OrderType;
                let planningPlant = binding.WOHeader.PlanningPlant;
                return context.read('/SAPAssetManager/Services/AssetManager.service', 'OrderTypes', ['ObjectListAssignment'], "$filter=OrderType eq '" + orderType + "' and PlanningPlant eq '" + planningPlant + "'").then(function(data) {
                    if (data && data.length > 0) {
                        let row = data.getItem(0);
                        if (row.ObjectListAssignment === '2' || row.ObjectListAssignment === '3') { //Add this notification to the object list
                            //Read the new notification to make sure it exists
                            return context.read('/SAPAssetManager/Services/AssetManager.service', "MyNotificationHeaders('" + localId + "')", ['NotificationNumber'], '').then(function(notif) {
                                if (notif && notif.length > 0) {
                                    return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderObjectLists', ['ObjectListNum'], "$filter=OrderId eq '" + binding.OrderId + "' and OperationNo eq '" + binding.OperationNo + "'").then(function(object) {
                                        if (object && object.length === 0) { //Do not add an object list entry if this operation already has one
                                            binding.ObjectListNotificationID = localId;
                                            return context.executeAction('/SAPAssetManager/Actions/ObjectList/CreateUpdate/ObjectListCreateNotificationForOperation.action');
                                        }
                                        return Promise.resolve(true);
                                    });
                                }
                                return Promise.resolve(true);
                            });
                        }
                    }
                    return Promise.resolve(true);
                });
            }
        }
        return Promise.resolve(true);
    });
}
