
import { TransactionNoteType as TransactionNoteType } from '../../Notes/NoteLibrary';
import NoteUtils from '../Utils/NoteUtils';
import libCommon from '../../Common/Library/CommonLibrary';
import libNotif from '../NotificationLibrary';
import DocLib from '../../Documents/DocumentLibrary';

export default function NotificationCreateSuccess(pageProxy) {
    // Store created notification somewhere
    libCommon.setStateVariable(pageProxy, 'CreateNotification', JSON.parse(pageProxy.evaluateTargetPath('#ActionResults:CreateNotification').data));

    return pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'NotifPartnerDetProcs', [], `$orderby=PartnerFunction&$expand=PartnerFunction_Nav&$top=2&$filter=NotifType eq '${pageProxy.evaluateTargetPath('#Control:TypeLstPkr/#SelectedValue')}' and PartnerIsMandatory eq 'X' and sap.entityexists(PartnerFunction_Nav)`).then(data => {
        if (data.length > 0) {
            pageProxy.getClientData().PartnerFunction = data.getItem(0).PartnerFunction_Nav.PartnerFunction;
            pageProxy.getClientData().PartnerNum = pageProxy.evaluateTargetPath('#Control:PartnerPicker1/#SelectedValue');
            return pageProxy.executeAction('/SAPAssetManager/Actions/Notifications/CreateUpdate/NotificationPartnerCreate.action').then((actionResult) => {
                if (data.length > 1) {
                    pageProxy.getClientData().PartnerFunction = data.getItem(1).PartnerFunction_Nav.PartnerFunction;
                    pageProxy.getClientData().PartnerNum = pageProxy.evaluateTargetPath('#Control:PartnerPicker2/#SelectedValue');
                    return pageProxy.executeAction('/SAPAssetManager/Actions/Notifications/CreateUpdate/NotificationPartnerCreate.action');
                } else {
                    return actionResult;
                }
            });
        } else {
            return Promise.resolve();
        }
    }).then(() => {
        let descriptionCtrl = pageProxy.getControl('FormCellContainer').getControl('AttachmentDescription').getValue();
        let attachmentCtrl = pageProxy.getControl('FormCellContainer').getControl('Attachment').getClientData().AddedAttachments;
        libCommon.setStateVariable(pageProxy, 'DocDescription', descriptionCtrl);
        libCommon.setStateVariable(pageProxy, 'Doc', attachmentCtrl);
        libCommon.setStateVariable(pageProxy, 'Class', 'Notification');
        libCommon.setStateVariable(pageProxy, 'ObjectKey', 'NotificationNumber');
        libCommon.setStateVariable(pageProxy, 'entitySet', 'MyNotifDocuments');
        libCommon.setStateVariable(pageProxy, 'parentEntitySet', 'MyNotificationHeaders');
        libCommon.setStateVariable(pageProxy, 'parentProperty', 'NotifHeader');
        libCommon.setStateVariable(pageProxy, 'attachmentCount', DocLib.validationAttachmentCount(pageProxy));

        if (libNotif.getAddFromOperationFlag(pageProxy)) {
            return pageProxy.executeAction('/SAPAssetManager/Actions/Notifications/RelatedNotifications/RelatedNotificationCreate.action').then(function() {
                return NoteUtils.createNoteIfDefined(pageProxy, TransactionNoteType.notification());
            });
        } else if (libNotif.getAddFromSuboperationFlag(pageProxy)) {
            return pageProxy.executeAction('/SAPAssetManager/Actions/Notifications/RelatedNotifications/RelatedNotificationCreate.action').then(function() {
                return NoteUtils.createNoteIfDefined(pageProxy, TransactionNoteType.notification());
            });
        } else {
            return NoteUtils.createNoteIfDefined(pageProxy, TransactionNoteType.notification());
        }
    });
}
