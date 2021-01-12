import common from '../../Common/Library/CommonLibrary';
import OffsetODataDate from '../../Common/Date/OffsetODataDate';
import libMobile from '../../MobileStatus/MobileStatusLibrary';

export default function NotificationsListViewFormat(context) {
    var section = context.getName();
    var property = context.getProperty();
    var binding = context.binding;
    var value = '';

    switch (section) {
        case 'NotificationsList':
            switch (property) {
                case 'Footnote':
                    if (binding.RequiredEndDate) {
                        let odataDate = OffsetODataDate(context, binding.RequiredEndDate);
                        value = context.formatDate(odataDate.date());
                        break;
                    } else {
                        value = context.localizeText('no_due_date');
                        break;
                    }
                case 'StatusText':
                    var priority = binding.NotifPriority;
                    value = common.isDefined(priority) ? priority.PriorityDescription : context.localizeText('none');
                    break;
                case 'SubstatusText':
                    value = context.localizeText(libMobile.getMobileStatus(context.binding));    
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
    return value;
}
