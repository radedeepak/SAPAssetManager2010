import libCommon from '../Library/CommonLibrary';
import isAndroid from '../IsAndroid';

export default function ChangeSetCreateUpdateButtonText(clientAPI) {
    if (!isAndroid(clientAPI)) {
        return libCommon.getStateVariable(clientAPI, 'ONCHANGESET') ? clientAPI.localizeText('next'): '';
    } else {
        return libCommon.getStateVariable(clientAPI, 'ONCHANGESET') ? clientAPI.localizeText('next'): clientAPI.localizeText('apply');
    }
}
