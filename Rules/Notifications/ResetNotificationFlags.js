import notif from './NotificationLibrary';

export default function ResetNotificationFlags(context) {
    if (notif.getAddFromOperationFlag(context)) {
        notif.setAddFromOperationFlag(context, false);
    }

    if (notif.getAddFromSuboperationFlag(context)) {
        notif.setAddFromSuboperationFlag(context, false);
    }
    return context.executeAction('/SAPAssetManager/Actions/Page/CancelPage.action');
}
