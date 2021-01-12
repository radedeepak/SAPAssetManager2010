import libCommon from '../Library/CommonLibrary';
import isAndroid from '../IsAndroid';

export default function ChangeSetCreateUpdateDoneIcon(context) {
    if (isAndroid(context) || libCommon.getStateVariable(context, 'ONCHANGESET')) {
        return '';
    } else {
        return 'Done';
    }
}
