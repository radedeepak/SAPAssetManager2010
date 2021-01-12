import CompleteMobileStatusAction from '../../MobileStatus/CompleteMobileStatusAction';

export default class CompleteWorkOrderMobileStatusAction extends CompleteMobileStatusAction {

    name() {
        return 'CompleteMobileStatusAction_WorkOrder';
    }

    entitySet() {
        return 'MyWorkOrderHeaders';
    }

    identifier() {
        // Needs to be in single quotes for fetch request
        return `'${this.args.WorkOrderId}'`;
    }

    setActionQueue(actionQueue) {
        // Put this action at the front of the queue
        actionQueue.unshift(this.setMobileStatusComplete); 
        super.setActionQueue(actionQueue);
    }

    /**
     * You need an operation to create a confirmation. Thus, this should return false.
     */
    didSetFinalConfirmationParams() {
        return false;
    }

    setMobileStatusComplete(context, instance) {
        if (context.binding.WorkOrderHeader || context.binding.WOHeader) {
            context._context.binding = context.binding.WorkOrderHeader ? context.binding.WorkOrderHeader : context.binding.WOHeader;
        }
        return super.setMobileStatusComplete(context, instance);
    }

}
