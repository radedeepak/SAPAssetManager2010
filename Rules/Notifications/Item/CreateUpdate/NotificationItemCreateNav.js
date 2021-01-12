import libCommon from '../../../Common/Library/CommonLibrary';

export default function NotificationItemCreateNav(context) {
    libCommon.setOnCreateUpdateFlag(context, 'CREATE');
    context.executeAction('/SAPAssetManager/Actions/Notifications/Item/NotificationItemCreateUpdateNav.action');
}
