import CascadingAction from '../Common/Action/CascadingAction';

export default class MobileStatusAction extends CascadingAction {

    entitySet() {
        return '';
    }

    identifier() {
        return '';
    }

    executeCreateBlankConfirmationIfMissing(context, instance) {
        if (instance.didSetConfirmationParams(context)) {
            // Execute the blank confirmation create action
            return context.executeAction('/SAPAssetManager/Actions/Confirmations/ConfirmationCreateBlank.action');
        }
        return Promise.resolve(true);
    }

    setActionQueue(actionQueue) {
        // Put this action at the front of the queue
        actionQueue.unshift(this.executeCreateBlankConfirmationIfMissing);        
        super.setActionQueue(actionQueue);
    }
}
