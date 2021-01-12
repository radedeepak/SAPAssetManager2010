import libCommon from '../../Common/Library/CommonLibrary';
import lamCopy from './NotificationCreateLAMCopy';

export default function NotificationCreateChangeSetNav(context, bindingParams) {
    libCommon.setOnChangesetFlag(context, true);
    libCommon.resetChangeSetActionCounter(context);
    libCommon.setOnCreateUpdateFlag(context, 'CREATE');
    var assnType = libCommon.getNotificationAssignmentType(context);
    if (assnType !== '1' && assnType !== '5') {
        assnType = 'Default';
    }

    return context.read('/SAPAssetManager/Services/AssetManager.service', 'NotificationTypes', [], "$select=PriorityType&$filter=NotifType eq '" + libCommon.getAppParam(context, 'NOTIFICATION', 'NotificationType') + "'").then(function(data) {
        let binding = {'NotifPriority' : {}, 'PriorityType' : data.getItem(0).PriorityType};
        if (bindingParams) {
            Object.assign(binding, bindingParams);
        }
        if (context.binding['@odata.type'] === '#sap_mobile.MyFunctionalLocation') {
            binding.HeaderFunctionLocation = context.binding.FuncLocIdIntern;
        } else if (context.binding['@odata.type'] === '#sap_mobile.MyEquipment') {
            binding.HeaderEquipment = context.binding.EquipId;
            binding.HeaderFunctionLocation = context.binding.FuncLocIdIntern;
        }
        context.setActionBinding(binding);
        let action = '/SAPAssetManager/Actions/Notifications/ChangeSet/NotificationCreateChangesetAssnDefault.action';
        if (assnType === '1') {
            action = '/SAPAssetManager/Actions/Notifications/ChangeSet/NotificationCreateChangesetAssn1.action';
        } else if (assnType === '5') {
            action = '/SAPAssetManager/Actions/Notifications/ChangeSet/NotificationCreateChangesetAssn5.action';
        }
        libCommon.setStateVariable(context, 'LocalId', ''); //Reset before starting create
        libCommon.setStateVariable(context, 'lastLocalItemNumber', '');
        return context.executeAction(action).then(() => {
            return lamCopy(context);
        });
    });
}
