import libCommon from '../Common/Library/CommonLibrary';

export default function NotificationTypeLstPkrDefault(context) {

    let bindingObject = context.binding;

    if (bindingObject && bindingObject.NotificationType) {
        return bindingObject.NotificationType;
    } else {
        return libCommon.getAppParam(context, 'NOTIFICATION', 'NotificationType');
    }
}
