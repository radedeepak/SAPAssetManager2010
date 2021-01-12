
import NotificationDetailsNavQueryOptions from '../Details/NotificationDetailsNavQueryOptions';

export default function NotificationDetailsFromMapQueryOptions(context) {
    return NotificationDetailsNavQueryOptions() + '&$filter=NotificationNumber eq \'' + context.binding.NotificationNumber + '\'';
}
