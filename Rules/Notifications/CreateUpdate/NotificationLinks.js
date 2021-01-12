import common from '../../Common/Library/CommonLibrary';
import libNotif from '../NotificationLibrary';

export default function NotificationLinks(context) {
    var links = [{
        'Property': 'NotifPriority',
        'Target':
        {
            'EntitySet': 'Priorities',
            'ReadLink': `Priorities(PriorityType='${context.binding.PriorityType}',Priority='${context.evaluateTargetPath('#Control:PrioritySeg/#Value/#First/#Property:ReturnValue')}')`,
        },
    }];

    var flocValue = common.getListPickerValue(common.getTargetPathValue(context, '#Control:FunctionalLocationLstPkr/#Value'));
    var equipmentValue = common.getListPickerValue(common.getTargetPathValue(context, '#Control:EquipmentLstPkr/#Value'));

    if (flocValue) {
        links.push({
            'Property': 'FunctionalLocation',
            'Target':
            {
                'EntitySet': 'MyFunctionalLocations',
                'ReadLink': `MyFunctionalLocations('${flocValue}')`,
            },
        });
    }

    if (equipmentValue) {
        links.push({
            'Property': 'Equipment',
            'Target':
            {
                'EntitySet': 'MyEquipments',
                'ReadLink': `MyEquipments('${equipmentValue}')`,
            },
        });
    }

    let woKey;
    if (context.binding['@odata.readLink'] === '#sap_mobile.MyWorkOrderHeader' || libNotif.getAddFromJobFlag(context)) {
        woKey = context.binding.OrderId;
        return context.read('/SAPAssetManager/Services/AssetManager.service', "MyWorkOrderHeaders('" + woKey + "')", ['OrderId','Notification/NotificationNumber'], '$expand=Notification').then(function(order) {
            if (order && order.length > 0) {
                let wo = order.getItem(0);
                if (!wo.Notification) { //If order does not already have a notification link, tie this notif to it
                    links.push({
                        'Property': 'WOHeader_Nav',
                        'Target':
                        {
                            'EntitySet': 'MyWorkOrderHeaders',
                            'ReadLink': `MyWorkOrderHeaders('${woKey}')`,
                        },
                    });
                }
            }
            return links;
        });
    }

    return links;
}
