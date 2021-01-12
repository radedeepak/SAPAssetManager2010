import ConfirmationCreateUpdateAction from './ConfirmationCreateUpdateAction';
import OnSuccess from './OnSuccess';
import libCom from '../../../Common/Library/CommonLibrary';
import CascadingAction from '../../../Common/Action/CascadingAction';

export default function CreateUpdateConfirmation(context) {

    let confirmation = context.getBindingObject();
    let isFinalConfirmation = libCom.getControlProxy(context,'IsFinalConfirmation').getValue();

    let previousClientData = context.evaluateTargetPath('#Page:-Previous/#ClientData');
    let mobileStatusAction = previousClientData.mobileStatusAction;
    let confirmationArgs = previousClientData.confirmationArgs;
    let isOnCreate = confirmation.IsOnCreate;
    let args = {
        isOnCreate: isOnCreate,
        isFinalConfirmation: isFinalConfirmation,
        WorkOrderId: confirmation.OrderID,
        OperationId: confirmation.Operation,
        doCheckOperationComplete: confirmation.doCheckOperationComplete,
        doCheckSubOperationComplete: confirmation.doCheckSubOperationComplete,
    };

    if (confirmation.SubOperation.length > 0) {
        args.SubOperationId = confirmation.SubOperation;
    }

    if (confirmationArgs !== undefined) {
        // Inject all of the confirmation args
        for (const [key, value] of Object.entries(confirmationArgs)) {
            if (args[key] === undefined) {
                args[key] = value;
            }
        }
    }

    let action = new ConfirmationCreateUpdateAction(args);
    if (mobileStatusAction !== undefined && mobileStatusAction instanceof CascadingAction) {
        mobileStatusAction.args.didCreateFinalConfirmation = isFinalConfirmation;
        action.pushLinkedAction(mobileStatusAction);
    }

    return action.execute(context).then(() => {
        return OnSuccess(context, isOnCreate);
    });
}
