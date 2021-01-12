/**
* Describe this function...
* @param {IClientAPI} context
*/
import libCom from '../Common/Library/CommonLibrary';

export default function MobileStatusLocalNotificationID(context) {
    //return the local notification id state variable set in rule GenerateNotificationID.js when a new notification is created.
    let localNotificationID = libCom.getStateVariable(context, 'LocalId');
    if (localNotificationID && localNotificationID !== '') {
        return localNotificationID;
    }
    return '';
}
