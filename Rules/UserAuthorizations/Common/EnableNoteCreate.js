/**
* Show/hide Note add button based on parent object and user authorization
* @param {IClientAPI} context
*/
import editNotificaitonEnabled from '../Notifications/EnableNotificationEdit';
import editWorkOrderEnabled from '../WorkOrders/EnableWorkOrderEdit';

export default function EnableNoteCreate(context) {
     // Types of Entity which will have Note Objects 
     const notification = 'MyNotification';
     const myWorkOrder = 'MyWorkOrder';
 
     const entityName = context.binding['@odata.type'].split('.')[1];
     // For Notification
     if (entityName.includes(notification)) {
         return (editNotificaitonEnabled(context));
     } else if (entityName.includes(myWorkOrder)) {
         return (editWorkOrderEnabled(context));
     } else {
         return true;
     }
}
