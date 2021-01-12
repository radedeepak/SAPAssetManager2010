
export default function TimeSheetEntryEditOperationValue(context) {
    return context.read('/SAPAssetManager/Services/AssetManager.service', context.binding['@odata.readLink'] + '/MyWOOperation', [], '').then(function(results) {
        if (results && results.length > 0) {
            let target = context.getTargetSpecifier();

            target.setDisplayValue('{{#Property:OperationNo}} - {{#Property:OperationShortText}}');
            target.setReturnValue('{@odata.readLink}');

            target.setEntitySet('MyWorkOrderOperations');
            target.setService('/SAPAssetManager/Services/AssetManager.service');
            target.setQueryOptions("$filter=OrderId eq '{{#Property:RecOrder}}'&$orderby=OperationNo asc");
            context.setTargetSpecifier(target);
            return results.getItem(0)['@odata.readLink'];
        }
        return '';
    });
}
