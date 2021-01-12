import libCommon from '../../Common/Library/CommonLibrary';
import libNotif from '../NotificationLibrary';
import GenerateLocalID from '../../Common/GenerateLocalID';

export default function GenerateNotificationItemID(context) {
    // If adding from a Job, our context will not be right
    if (context.binding && !(libNotif.getAddFromJobFlag(context) || libNotif.getAddFromOperationFlag(context) || libNotif.getAddFromSuboperationFlag(context) || libNotif.getAddFromMapFlag(context))) {
        if (context.binding.ItemNumber) {
            libCommon.setStateVariable(context, 'lastLocalItemNumber', context.binding.ItemNumber);
            return context.binding.ItemNumber;
        } else if (context.binding['@odata.readLink']) {
            // There is a notification in the context with a readlink
            return GenerateLocalID(context, context.binding['@odata.readLink'] + '/Items', 'ItemNumber', '0000', '', '').then(function(result) {
                libCommon.setStateVariable(context, 'lastLocalItemNumber', result);
                return result;
            });
        }
    }
    if (libCommon.isOnChangeset(context)) {
        libCommon.setStateVariable(context, 'lastLocalItemNumber', '0001');
        return '0001';
    }
    return '';
}
