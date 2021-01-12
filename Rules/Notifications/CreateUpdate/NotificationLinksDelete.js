import common from '../../Common/Library/CommonLibrary';

export default function NotificationLinksDelete(context) {

    var flocValue = common.getListPickerValue(common.getTargetPathValue(context, '#Control:FunctionalLocationLstPkr/#Value'));
    var equipmentValue = common.getListPickerValue(common.getTargetPathValue(context, '#Control:EquipmentLstPkr/#Value'));

    // Edge cases require a re-read of the Functional Location and Equipment since the $expand query does not auto-update
    return context.read('/SAPAssetManager/Services/AssetManager.service', context.binding['@odata.readLink'], [], '$expand=Equipment,FunctionalLocation').then(function(result) {
        let binding = {};
        var links = [];
        if (result && (binding = result.getItem(0))) {
            if (!flocValue && binding.FunctionalLocation) {
                links.push({
                    'Property': 'FunctionalLocation',
                    'Target':
                    {
                        'EntitySet': 'MyFunctionalLocations',
                        'ReadLink': binding.FunctionalLocation['@odata.readLink'],
                    },
                });
            }
            if (!equipmentValue && binding.Equipment) {
                links.push({
                    'Property': 'Equipment',
                    'Target':
                    {
                        'EntitySet': 'MyEquipments',
                        'ReadLink': binding.Equipment['@odata.readLink'],
                    },
                });
            }
            return links;
        } else {
            return [];
        }
    });
    
}
