

import NotificationDetailsNavQueryOptions from './Details/NotificationDetailsNavQueryOptions';
import libVal from '../Common/Library/ValidationLibrary';
export default function NotificationsListViewQueryOption(context) {
    if (!libVal.evalIsEmpty(context.binding) && context.binding['@odata.type'] === '#sap_mobile.MyEquipment') {
        let equipment = context.binding.EquipId;
        return `$filter=HeaderEquipment eq '${equipment}'&` + NotificationDetailsNavQueryOptions() + '&$orderby=Priority';
    } else {
        return NotificationDetailsNavQueryOptions() + '&$orderby=Priority,ObjectKey,NotificationNumber,OrderId,NotifDocuments/DocumentID,NotifMobileStatus_Nav/MobileStatus';
    }
}
