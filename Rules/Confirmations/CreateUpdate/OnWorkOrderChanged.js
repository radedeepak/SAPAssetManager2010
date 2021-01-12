import libCom from '../../Common/Library/CommonLibrary';
import operationQueryOptions from './OperationPickerQueryOptions';
import libVal from '../../Common/Library/ValidationLibrary';

export default function OnWorkOrderChanged(context) {
    let binding = context.getBindingObject();
    let orderId = context.getValue()[0] ? context.getValue()[0].ReturnValue : '';
    let pageProxy = context.getPageProxy();
    
    let woLstPicker = libCom.getControlProxy(pageProxy, 'WorkOrderLstPkr');
     /* Clear the validation if the field is not empty */
     if (!libVal.evalIsEmpty(woLstPicker.getValue())) {
        woLstPicker.clearValidation();
     }

    if (orderId.length === 0) {
        // Unselected, clear dependent controls
        return onNoWorkOrder(pageProxy, binding);
    }

    return context.read('/SAPAssetManager/Services/AssetManager.service', 'MyWorkOrderHeaders', [], `$expand=OrderMobileStatus_Nav&$filter=OrderId eq '${orderId}'&$top=1`).then(result => {
        if (!result || result.length === 0) {
            return onNoWorkOrder(pageProxy, binding);
        }
        let workOrder = result.getItem(0);
        return onWorkOrderReceived(pageProxy, workOrder, binding);
    });
}

function onWorkOrderReceived(pageProxy, workOrder, binding) {
    
    binding.WorkOrderHeader = workOrder;
    binding.OrderID = workOrder.OrderId;
    binding.SubOperation = '';
    binding.ActivityType = '';
    binding.VarianceReason = '';
    
    pageProxy._context.binding = binding;

    return Promise.all([operationQueryOptions(pageProxy)]).then(function(results) {
        redrawListControl(pageProxy, 'OperationPkr', results[0], true);
        redrawListControl(pageProxy, 'SubOperationPkr', '', false);
        redrawListControl(pageProxy, 'ActivityTypePkr', '', false);
        redrawListControl(pageProxy, 'VarianceReasonPkr', '', false);
    });
}


function onNoWorkOrder(pageProxy, binding) {
    binding.OrderID = '';
    binding.WorkOrderHeader = undefined;
    binding.Operation = '';
    binding.SubOperation = '';
    binding.ActivityType = '';
    pageProxy._context.binding = binding;

    redrawListControl(pageProxy, 'OperationPkr', '', false);
    redrawListControl(pageProxy, 'SubOperationPkr', '', false);
    redrawListControl(pageProxy, 'ActivityTypePkr', '', false);
    redrawListControl(pageProxy, 'VarianceReasonPkr', '', false);
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
    control.setTargetSpecifier(specifier);

    control.redraw();
}
