import common from '../../Common/Library/CommonLibrary';

export default function NotificationItemDefaultName(context) {
    if (common.isOnChangeset(context)) {
        return common.getStateVariable(context, 'Notification').ItemText;
    } else {
        return common.isDefined(context.binding.ItemText) ? context.binding.ItemText : '';
    }
}


