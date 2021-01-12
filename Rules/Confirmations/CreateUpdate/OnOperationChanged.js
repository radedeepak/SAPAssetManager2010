import libCom from '../../Common/Library/CommonLibrary';
import libVal from '../../Common/Library/ValidationLibrary';
import actPickerQueryOptions from './ActivityPickerQueryOptions';
import variancePickerQueryOptions from './VariancePickerQueryOptions';


import SubOperationQueryOptions from './SubOperationPickerQueryOptions';

export default function OnOperationChanged(context) {
    let binding = context.getBindingObject();
    let selection = context.getValue()[0] ? context.getValue()[0].ReturnValue : '';
    binding.Operation = selection;
    let pageProxy = context.getPageProxy();
    pageProxy._context.binding = binding;

     let opControl = libCom.getControlProxy(pageProxy, 'OperationPkr');

    /* Clear the validation if the field is not empty */
    if (!libVal.evalIsEmpty(opControl.getValue())) {
        opControl.clearValidation();
    }
    
    if (selection.length === 0) {
        // Clear Sub Operation Picker
        binding.ActivityType = '';
        binding.VarianceReason = '';
        return redrawListControl(pageProxy, 'SubOperationPkr', '', false).then(() => {
            return redrawListControl(pageProxy, 'ActivityTypePkr', '', false).then(() => {
                return redrawListControl(pageProxy, 'VarianceReasonPkr', '', false);
            });
        });
    } else {
        return Promise.all([SubOperationQueryOptions(pageProxy), actPickerQueryOptions(pageProxy), variancePickerQueryOptions(pageProxy)]).then(function(results) {
            return pageProxy.count('/SAPAssetManager/Services/AssetManager.service','MyWorkOrderSubOperations', results[0]).then(count => { //Check for existence of sub-operations
                return redrawListControl(pageProxy, 'SubOperationPkr', results[0], count > 0).then(() => {
                    return redrawListControl(pageProxy, 'ActivityTypePkr', results[1], true).then(() => {
                        binding.ActivityType = '';
                        if (pageProxy.getClientData().DefaultActivityType) {  //Default the activity type to the operation's activity type
                            let control = libCom.getControlProxy(pageProxy, 'ActivityTypePkr');
                            control.setValue(pageProxy.getClientData().DefaultActivityType);
                            binding.ActivityType = pageProxy.getClientData().DefaultActivityType;
                        }
                        return redrawListControl(pageProxy, 'VarianceReasonPkr', results[2], true).then(() => {
                            binding.VarianceReason = '';
                        });
                    });
                });
            });
        });
    }
}

/**
 * Redraw a page control
 * @param {*} pageProxy 
 * @param {*} controlName 
 * @param {*} queryOptions 
 * @param {*} isEditable 
 */
function redrawListControl(pageProxy, controlName, queryOptions, isEditable=true) {
    let control = libCom.getControlProxy(pageProxy,controlName);
    let specifier = control.getTargetSpecifier();

    specifier.setQueryOptions(queryOptions);
    specifier.setService('/SAPAssetManager/Services/AssetManager.service');
    control.setEditable(isEditable);

    return control.setTargetSpecifier(specifier).then(() => {
        control.redraw();
        return Promise.resolve(true);
    });
}
