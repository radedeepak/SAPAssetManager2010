import notificationCount from './NotificationsCountOnOverviewPage';
export default function NotificationsSearchEnabled(context) {
    var queryOptions = '';
    if (context.binding.binding['@odata.type'] === '#sap_mobile.MyEquipment') {
        let equipment = context.binding.binding.EquipId;
        queryOptions = `$filter=HeaderEquipment eq '${equipment}'`;
    }

    return notificationCount(context, queryOptions).then(count => {
        return count !==0;
    });
}
