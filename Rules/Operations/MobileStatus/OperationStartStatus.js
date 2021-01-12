import libOprMobile from './OperationMobileStatusLibrary';

export default function OperationStartStatus(context) {
    context.showActivityIndicator('');
    return libOprMobile.startOperation(context);
}
