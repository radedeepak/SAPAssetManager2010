import libOprMobile from './OperationMobileStatusLibrary';

export default function OperationHoldStatus(context) {
    context.showActivityIndicator('');
    return libOprMobile.holdOperation(context);
}
