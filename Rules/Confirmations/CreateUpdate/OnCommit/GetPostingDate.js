import ODataDate from '../../../Common/Date/ODataDate';
import GetStartDateTime from './GetStartDateTime';

export default function GetPostingDate(context) {
    let date = new Date(GetStartDateTime(context));
    let odataDate = new ODataDate(date);
    return odataDate.toDBDateString(context);
}
