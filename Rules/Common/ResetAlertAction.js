import libCom from './Library/CommonLibrary';

export default function ResetAlertAction(clientAPI) {
    return clientAPI.executeAction('/SAPAssetManager/Actions/User/ShowResetWarningDialog.action').then( result => {
        if (result.data === true) {
            let pageProxy = clientAPI.evaluateTargetPathForAPI('#Page:OverviewPage');
            let sectionedTable = pageProxy.getControls()[0];
            let mapSection = sectionedTable.getSections()[0];
            let mapViewExtension = mapSection.getExtensions()[0];
            if (libCom.isDefined(mapViewExtension)) {
                mapViewExtension.clearUserDefaults();
            }

            // Changing the flag back to false to execute Update action again on subsequent reset
            clientAPI.nativescript.appSettingsModule.setBoolean('didSetUserGeneralInfos', false);
 
            clientAPI.executeAction('/SAPAssetManager/Actions/User/ResetUser.action');
        }
    });
}
