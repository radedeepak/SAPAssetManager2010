import libCommon from '../../Common/Library/CommonLibrary';
import { NoteLibrary as NoteLib } from '../../Notes/NoteLibrary';
import notif from '../../Notifications/NotificationLibrary';

export default function NotificationCreateNoteCreate(context) {

    libCommon.incrementChangeSetActionCounter(context);
    
    let transactionType = NoteLib.getNoteTypeTransactionFlag(context);

    if (transactionType && transactionType.name === 'Notification' && (libCommon.getNotificationAssignmentType(context) === '1' || notif.getAddFromOperationFlag(context) || notif.getAddFromSuboperationFlag(context))) {
        if (libCommon.getNotificationAssignmentType(context) === '1') {
            libCommon.incrementChangeSetActionCounter(context);
        }
        if (notif.getAddFromOperationFlag(context)) {
            libCommon.incrementChangeSetActionCounter(context);
        } else if (notif.getAddFromSuboperationFlag(context)) {
            libCommon.incrementChangeSetActionCounter(context);
        }
    }
    

    if (libCommon.isOnChangeset(context)) {
        return context.executeAction('/SAPAssetManager/Actions/CreateUpdateDelete/CreateEntitySuccessMessage.action');
    } else {
        libCommon.setOnCreateUpdateFlag(context, '');
        return context.executeAction('/SAPAssetManager/Actions/Notes/NoteCreateSuccessMessage.action');
    }
}
