import libCom from '../../Common/Library/CommonLibrary';

let propertyMap = {
    'ActivityTypePkr': 'ActivityType',
    'SubOperationPkr': 'SubOperation',
    'VarianceReasonPkr': 'VarianceReason',
    'AcctIndicatorPkr': 'AccountingIndicator',
};

export default function OnListPickerValueChanged(context) {
    let binding = context.getBindingObject();
    let controlName = context.getName();

    let propertyKey = propertyMap[controlName];
    if (propertyKey === undefined) {
        return '';
    }

    let selection = context.getValue()[0] ? context.getValue()[0].ReturnValue : '';
    binding[propertyKey] = selection;
    context.getPageProxy()._context.binding = binding;

    if (controlName === 'SubOperationPkr' && selection) { //Get the default activity type for this sub-operation
        let pageProxy = context.getPageProxy();
        let operation = libCom.getControlProxy(pageProxy, 'OperationPkr').getValue()[0].ReturnValue;
        let order = libCom.getControlProxy(pageProxy, 'WorkOrderLstPkr').getValue()[0].ReturnValue;
        return context.read('/SAPAssetManager/Services/AssetManager.service','MyWorkOrderSubOperations', ['ActivityType'], "$filter=OrderId eq '" + order + "' and OperationNo eq '" + operation + "' and SubOperationNo eq '" + selection + "'").then(function(result) {
            if (result && result.length > 0) {
                let row = result.getItem(0);
                if (row.ActivityType) {
                    let control = libCom.getControlProxy(pageProxy, 'ActivityTypePkr');
                    control.setValue(row.ActivityType);
                    binding.ActivityType = row.ActivityType;
                }
            }
            return Promise.resolve(true);
        });
    }
}
