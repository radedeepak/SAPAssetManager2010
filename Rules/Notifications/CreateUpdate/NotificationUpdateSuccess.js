import DocumentCreateDelete from '../../Documents/Create/DocumentCreateDelete';

/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function NotificationUpdateSuccess(context) {

    let readNotifPartnerDetProcs = context.read('/SAPAssetManager/Services/AssetManager.service', 'NotifPartnerDetProcs', [], `$orderby=PartnerFunction&$expand=PartnerFunction_Nav&$top=2&$filter=NotifType eq '${context.evaluateTargetPath('#Control:TypeLstPkr/#SelectedValue')}' and PartnerIsMandatory eq 'X' and sap.entityexists(PartnerFunction_Nav)`).then(data => {
        let notifPartnerDetProcsArray = [];
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                notifPartnerDetProcsArray.push(data.getItem(i));
            }
        }
        return notifPartnerDetProcsArray;
    });

    let readPartnerFunction = context.read('/SAPAssetManager/Services/AssetManager.service', `${context.binding['@odata.readLink']}/Partners`, [], '$orderby=PartnerFunction&$expand=PartnerFunction_Nav').then(data => {
        let partnerFunctionArray = [];
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                partnerFunctionArray.push(data.getItem(i));
            }
        }
        return partnerFunctionArray;
    });

    return Promise.all([readNotifPartnerDetProcs, readPartnerFunction]).then((results) => {
        let intersection = results[1].filter(function(obj) {
            for (var i = 0; i < results[0].length; i++) {
                if (obj.PartnerFunction_Nav.PartnerFunction === results[0][i].PartnerFunction_Nav.PartnerFunction) {
                    return true;
                }
            }
            return false;
        });

        if (intersection.length > 0) {
            let newPartnerNum1 = context.evaluateTargetPath('#Control:PartnerPicker1/#SelectedValue') || '';
            let newPartnerNum2 = context.evaluateTargetPath('#Control:PartnerPicker2/#SelectedValue') || '';

            if (newPartnerNum1 !== context.getClientData().OldPartner1 || newPartnerNum2 !== context.getClientData().OldPartner2) { //only proceed if either of the business partners have changed
                context.getClientData().PartnerFunction = intersection[0].PartnerFunction_Nav.PartnerFunction;
                context.getClientData().PartnerReadLink = intersection[0]['@odata.readLink'];
                context.getClientData().PartnerNum = newPartnerNum1;
                context.getClientData().OldPartnerNum = context.getClientData().OldPartner1;
                return context.executeAction('/SAPAssetManager/Actions/Notifications/CreateUpdate/NotificationPartnerUpdate.action').then((actionResult) => {
                    if (intersection.length > 1) {
                        context.getClientData().PartnerFunction = intersection[1].PartnerFunction_Nav.PartnerFunction;
                        context.getClientData().PartnerReadLink = intersection[1]['@odata.readLink'];
                        context.getClientData().PartnerNum = newPartnerNum2;
                        context.getClientData().OldPartnerNum = context.getClientData().OldPartner2;
                        return context.executeAction('/SAPAssetManager/Actions/Notifications/CreateUpdate/NotificationPartnerUpdate.action');
                    } else {
                        return actionResult;
                    }
                });
            }
        }
        return Promise.resolve();
    }).then(() => {
        return DocumentCreateDelete(context);
    });
}
