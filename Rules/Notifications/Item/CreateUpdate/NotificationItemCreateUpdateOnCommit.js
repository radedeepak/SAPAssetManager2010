import ComLib from '../../../Common/Library/CommonLibrary';
import NotificationLib from '../../../Notifications/NotificationLibrary';
import lamCopy from '../../CreateUpdate/NotificationItemCreateLAMCopy';

export default function NotificationItemCreateUpdateOnCommit(clientAPI) {

    return NotificationLib.NotificationItemCreateUpdateValidation(clientAPI).then((isValid) => {
        if (isValid) {
            if (ComLib.IsOnCreate(clientAPI)) {
                if (ComLib.isOnChangeset(clientAPI)) {
                    return clientAPI.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemCreate.action').then(() => {
                        return lamCopy(clientAPI);
                    });
                }
                // If this is not already a change set, we want to make it one
                ComLib.setOnChangesetFlag(clientAPI, true);
                ComLib.resetChangeSetActionCounter(clientAPI);
                return clientAPI.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemCreateChangeSet.action').then(() => {
                    return lamCopy(clientAPI);
                });
            } else {
                return clientAPI.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemUpdate.action');
            }
        } else {
            return Promise.resolve(false);
        }
    });
}
