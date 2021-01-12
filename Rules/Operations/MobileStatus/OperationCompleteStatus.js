import libOprMobile from './OperationMobileStatusLibrary';

export default function OperationCompleteStatus(context) {
    context.showActivityIndicator('');
    return libOprMobile.completeOperation(context);
}
