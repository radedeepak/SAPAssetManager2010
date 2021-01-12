import libCommon from '../Library/CommonLibrary';

export default function ChangesetSwitchReadLink(context) {
    if (context.binding && context.binding['@odata.type'] === '#sap_mobile.MyNotificationHeader') {
        return context.binding['@odata.readLink'];
    } else if (libCommon.isOnChangeset(context))	{
        return 'pending_1';
    }
    return '';
}
