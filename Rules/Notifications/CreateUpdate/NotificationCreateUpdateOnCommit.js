import ComLib from '../../Common/Library/CommonLibrary';
import valLib from '../../Common/Library/ValidationLibrary';
import Logger from '../../Log/Logger';

export default function NotificationCreateUpdateOnCommit(clientAPI) {
    //Determine if we are on edit vs. create
    let onCreate = ComLib.IsOnCreate(clientAPI);

    if (onCreate)	{
        // If we're creating a Notification, we will always be doing a ChangeSet
        var type = ComLib.getListPickerValue(clientAPI.getControls()[0].getControl('TypeLstPkr').getValue());
        var floc = ComLib.getListPickerValue(clientAPI.getControls()[0].getControl('FunctionalLocationLstPkr').getValue());
        var equipment = ComLib.getListPickerValue(clientAPI.getControls()[0].getControl('EquipmentLstPkr').getValue());
        var descr = clientAPI.getControls()[0].getControl('NotificationDescription').getValue();
        ComLib.setStateVariable(clientAPI, 'Notification', {'ItemText': descr, 'HeaderEquipment' : equipment, 'HeaderFunctionLocation' : floc, 'NotificationType' : type});
        if (!valLib.evalIsEmpty(type) && !valLib.evalIsEmpty(descr)) {
            ComLib.setStateVariable(clientAPI, 'Notification', {'ItemText': descr, 'HeaderEquipment' : equipment, 'HeaderFunctionLocation' : floc, 'NotificationType' : type});
            return clientAPI.executeAction('/SAPAssetManager/Actions/Notifications/CreateUpdate/NotificationCreate.action'); 
        } else {
            Logger.error(clientAPI.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryNotifications.global').getValue(), 'One of the required controls did not return a value OnCreate');
        }
    } else {
        return clientAPI.executeAction('/SAPAssetManager/Actions/Notifications/CreateUpdate/NotificationUpdate.action');
    }
}
