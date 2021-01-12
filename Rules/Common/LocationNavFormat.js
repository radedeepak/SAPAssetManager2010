import GetGeometryInformation from '../Common/GetGeometryInformation';

export default function FunctionalLocationLocationNavFormat(context) {
    let geometryPrefix = '';

    switch (context.getPageProxy().binding['@odata.type']) {
        case '#sap_mobile.MyWorkOrderHeader':
                geometryPrefix = 'WOGeometries';
            break;
        case '#sap_mobile.MyNotificationHeader':
                geometryPrefix = 'NotifGeometries';
            break;
        case '#sap_mobile.MyFunctionalLocation':
                geometryPrefix = 'FuncLocGeometries';
            break;
        case '#sap_mobile.MyEquipment':
                geometryPrefix = 'EquipGeometries';
            break;
        default:
            return '#000000';
    }
    let geometryItem = context.getPageProxy().getClientData().geometry;

    if (geometryItem && Object.keys(geometryItem).length > 0) {
        // geometryItem is valid and defined
        return '#3678AF';
    } else {
        // geometryItem is defined, but empty
        if (geometryItem) {
            if (geometryPrefix === 'WOGeometries' || geometryPrefix === 'NotifGeometries') {
                return context.read('/SAPAssetManager/Services/AssetManager.service', context.getPageProxy().binding['@odata.readLink'] + '/FunctionalLocation', [], '').then(function(result) {
                    if (result && result.getItem(0)) {
                        return '#3678AF';
                    } else {
                        return '#000000';
                    }
                });
            } else {
                return '#000000';
            }
        } else {
            // geometryItem is invalid and needs to be read
            return GetGeometryInformation(context.getPageProxy(), geometryPrefix).then(function(value) {
                if (value && Object.keys(value).length > 0) {
                    // geometryItem is valid and defined
                    return '#3678AF';
                } else {
                    return '#000000';
                }
            });
        }
    }
}
