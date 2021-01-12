import common from '../../Common/Library/CommonLibrary';

export default function NotificationHistoryLinks(context) {
    var links = [{
        'Property': 'HistoryPriority_Nav',
        'Target':
        {
            'EntitySet': 'Priorities',
            'ReadLink': `Priorities(PriorityType='${context.binding.PriorityType}',Priority='${context.evaluateTargetPath('#Control:PrioritySeg/#Value/#First/#Property:ReturnValue')}')`,
        },
    }];

    var flocValue = common.getListPickerValue(common.getTargetPathValue(context, '#Control:FunctionalLocationLstPkr/#Value'));
    var equipmentValue = common.getListPickerValue(common.getTargetPathValue(context, '#Control:EquipmentLstPkr/#Value'));
    if (equipmentValue) {
        links.push({
            'Property': 'Equipment_Nav',
            'Target':
            {
                'EntitySet': 'MyEquipments',
                'ReadLink': `MyEquipments('${equipmentValue}')`,
            },
        });
    } else if (flocValue) {
        links.push({
            'Property': 'FuncLoc_Nav',
            'Target':
            {
                'EntitySet': 'MyFunctionalLocations',
                'ReadLink': `MyFunctionalLocations('${flocValue}')`,
            },
        });
    }
    return links;
}
