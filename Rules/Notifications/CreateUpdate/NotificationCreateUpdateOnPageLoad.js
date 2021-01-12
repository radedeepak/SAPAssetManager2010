import style from '../../Common/Style/StyleFormCellButton';
import hideCancel from '../../ErrorArchive/HideCancelForErrorArchiveFix';
import common from '../../Common/Library/CommonLibrary';
import Stylizer from '../../Common/Style/Stylizer';
import libNotif from '../NotificationLibrary';

export default function NotificationCreateUpdateOnPageLoad(context) {
    hideCancel(context);
    if (!context.getClientData().LOADED) {
        var caption;
        var onCreate = common.IsOnCreate(context);
        var container = context.getControls()[0];
        var binding = context.binding;

        if (onCreate) {
            caption = context.localizeText('add_notification');
        } else {
            if (!common.isCurrentReadLinkLocal(binding['@odata.readLink'])) {
                common.setEditable(container.getControl('TypeLstPkr'), false);
            }
            ///Notification type can't be edit on local notifications
            if (!onCreate && common.isCurrentReadLinkLocal(binding['@odata.readLink'])) {
                common.setEditable(container.getControl('TypeLstPkr'), false);
            }
            caption = context.localizeText('edit_notification');
            let formCellContainer = context.getControl('FormCellContainer');
            let stylizer = new Stylizer(['GrayText']);
            let typePkr = formCellContainer.getControl('TypeLstPkr');
            let flocPkr = formCellContainer.getControl('FunctionalLocationLstPkr');
            let equipPkr = formCellContainer.getControl('EquipmentLstPkr');
            stylizer.apply(typePkr, 'Value');
            stylizer.apply(flocPkr, 'Value');
            stylizer.apply(equipPkr, 'Value');

            //Malfunction date/time
            let startDate = formCellContainer.getControl('MalfunctionStartDatePicker');
            let startTime = formCellContainer.getControl('MalfunctionStartTimePicker');
            let endDate = formCellContainer.getControl('MalfunctionEndDatePicker');
            let endTime = formCellContainer.getControl('MalfunctionEndTimePicker');
            let startSwitch = formCellContainer.getControl('BreakdownStartSwitch');
            let endSwitch = formCellContainer.getControl('BreakdownEndSwitch');
            let breakdown = formCellContainer.getControl('BreakdownSwitch').getValue();

            if (breakdown) {
                startDate.setVisible(true);
                startTime.setVisible(true);
                endDate.setVisible(true);
                endTime.setVisible(true);
                startSwitch.setVisible(true);
                endSwitch.setVisible(true);
            }

            if (startSwitch.getValue()) {
                startDate.setEditable(true);
                startTime.setEditable(true);
            }

            if (endSwitch.getValue()) {
                endDate.setEditable(true);
                endTime.setEditable(true);
            }
        }
        context.setCaption(caption);
        if (libNotif.getAddFromJobFlag(context)) {
            common.setEditable(container.getControl('EquipmentLstPkr'), true);
            common.setEditable(container.getControl('FunctionalLocationLstPkr'), true);
        }
    } else {

        /* Set enabled/disabled on cascading list pickers */

        /*
            Equipment (depends on Functional Location)
            Ensure Functional Location is chosen
            If not, disable Equipment List Picker
        */
        if (container.getControl('FunctionalLocationLstPkr').getValue()[0] !== undefined) {
            common.setEditable(container.getControl('EquipmentLstPkr'), true);
        } else {
            common.setEditable(container.getControl('EquipmentLstPkr'), false);
        }

        /*
            Work Center Plant and Main Work Center
            Must be left open if on Assignment Type 1
            Must be defaulted and disabled if on Assignment Type 8
        */
        switch (common.getNotificationAssignmentType(context)) {
            case '1':
                break;
            case '5':
                // Set Value
                container.getControl('WorkCenterPlantLstPkr').setValue(common.getNotificationPlanningPlant(context));
                // Disable Picker
                common.setEditable(container.getControl('WorkCenterPlantLstPkr'), false);

                // Set Value
                container.getControl('MainWorkCenterLstPkr').setValue(common.getUserDefaultWorkCenter());
                // Disable Picker
                common.setEditable(container.getControl('MainWorkCenterLstPkr'), false);
                break;
            default:
                break;
        }
        context.getClientData().LOADED = true;
    }
    style(context, 'DiscardButton');
    common.saveInitialValues(context);
}
