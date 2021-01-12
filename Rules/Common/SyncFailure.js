import libCom from './Library/CommonLibrary';
import Logger from '../Log/Logger';

export default function SyncFailure(context) {
    let error = '';
    try {
        error = + '\n' + libCom.getActionResultError(context, 'result');
    } catch (actionResultError) {
        // do nothing
    }
    var message = '';
    if (error !== '0not allowed') {
        message = error;
    }
    Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategorySync.global').getValue() , message);
    return (context.localizeText('service_unavailable_message'));
}
