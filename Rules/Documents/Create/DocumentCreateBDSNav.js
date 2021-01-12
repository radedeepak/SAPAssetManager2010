import libDocument from '../DocumentLibrary';
import libWOStatus from '../../WorkOrders/MobileStatus/WorkOrderMobileStatusLibrary';
import libNotifStatus from '../../Notifications/MobileStatus/NotificationMobileStatusLibrary';

export default function DocumentCreateBDSNav(context) {

    switch (libDocument.getParentObjectType(context)) {
        case libDocument.ParentObjectType.WorkOrder:
            return libWOStatus.isOrderComplete(context).then(status => {
                if (!status) {
                    return context.executeAction('/SAPAssetManager/Actions/Documents/DocumentCreateBDSNav.action');
                }
                return '';
            });
        case libDocument.ParentObjectType.Notification:
            return libNotifStatus.isNotificationComplete(context).then(status => {
                if (!status) {
                    return context.executeAction('/SAPAssetManager/Actions/Documents/DocumentCreateBDSNav.action');
                }
                // Need to send this because linter expected to return a value at the end of arrow function
                return ''; 
            });
        case libDocument.ParentObjectType.Equipment:
            return context.executeAction('/SAPAssetManager/Actions/Documents/DocumentCreateBDSNav.action');
        case libDocument.ParentObjectType.FunctionalLocation:
            return context.executeAction('/SAPAssetManager/Actions/Documents/DocumentCreateBDSNav.action');
        default:
            break;
    }
}
