import ComLib from './Library/CommonLibrary';

export default function EntityIsLocal(context) {
    const bindingObject = context.binding;
    if (bindingObject && bindingObject['@odata.readLink']) {
        return ComLib.isEntityLocal(bindingObject);
    }
    return true;
}
