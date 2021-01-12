import libVal from '../../Common/Library/ValidationLibrary';
import signatureDetails from './SignatureObjectDetails';
/**
* Name of the file for Signature Control
* @param {IClientAPI} context
*/
export default function SignatureOnCreateFileName(context) {
    let contentType = context.evaluateTargetPath('#Control:SignatureCaptureFormCell/#Value').contentType;
    let fileType = contentType.split('/')[1];
    let fileName = [context.localizeText('signature')];
    let parent  = libVal.evalIsEmpty(context.evaluateTargetPathForAPI('#Page:-Previous').getClientData().currentObject) ? context.evaluateTargetPathForAPI('#Page:-Previous').binding : context.evaluateTargetPathForAPI('#Page:-Previous').getClientData().currentObject;
    if (libVal.evalIsEmpty(parent['@odata.type']) && !libVal.evalIsEmpty(parent.WorkOrderHeader)) {
        parent = parent.WorkOrderHeader;
    }
    context._context.binding = parent;
    fileName.push(signatureDetails(context));
    return fileName.join(' ') + '.' + fileType;
}
