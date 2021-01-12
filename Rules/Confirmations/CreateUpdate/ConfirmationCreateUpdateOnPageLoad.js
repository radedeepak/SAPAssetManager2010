import style from '../../Common/Style/StyleFormCellButton';
import libCom from '../../Common/Library/CommonLibrary';
import Stylizer from '../../Common/Style/Stylizer';
import hideCancel from '../../ErrorArchive/HideCancelForErrorArchiveFix';
import LaborTimeMinuteInterval from '../CreateUpdate/LaborTimeMinuteInterval';
import ODataDate from '../../Common/Date/ODataDate';
import onUpdate from '../../Confirmations/CreateUpdate/IsOnUpdate';

export default function ConfirmationCreateUpdateOnPageLoad(context) {
    hideCancel(context);
    let stylizer = new Stylizer(['GrayText']);
    const formCellContainerProxy = context.getControl('FormCellContainer');
    if (!context.getBindingObject().IsOnCreate) {
        style(context, 'DiscardButton');
    }

    if (!context.getBindingObject().IsWorkOrderChangable) {
        let woPicker = formCellContainerProxy.getControl('WorkOrderLstPkr');
        stylizer.apply(woPicker, 'Value');

        if (onUpdate(context)) { //Only do this during edit, or MDK puts the wrong caption on the last screen field
            let confirmationId = formCellContainerProxy.getControl('ConfirmationIdProperty');
            stylizer.apply(confirmationId, 'Value');
        }

        if (!context.getBindingObject().IsOperationChangable) {
            let opPicker = formCellContainerProxy.getControl('OperationPkr');
            stylizer.apply(opPicker, 'Value');
            if (!context.getBindingObject().IsSubOperationChangable) {
                let subOpPicker = formCellContainerProxy.getControl('SubOperationPkr');
                stylizer.apply(subOpPicker, 'Value');
            }
        }

    }
    let workOrderValue = libCom.getControlValue(formCellContainerProxy.getControl('WorkOrderLstPkr'));
    let operationValue = libCom.getControlValue(formCellContainerProxy.getControl('OperationPkr'));
    let subOperationValue = libCom.getControlValue(formCellContainerProxy.getControl('SubOperationPkr'));

    return LaborTimeMinuteInterval(context, workOrderValue, operationValue, subOperationValue).then(duration => { //Handle clock in/out processing if necessary
        let durationControl = formCellContainerProxy.getControl('DurationPkr');
        durationControl.setValue(duration);

        if (context.binding.IsOnCreate) {
            let startDateTime;

            if (libCom.isDefined(context.binding.PostingDate)) {
                startDateTime = new ODataDate(context.binding.PostingDate);
            } else {
                startDateTime = new ODataDate();
            }

            startDateTime.date().setMinutes(startDateTime.date().getMinutes() - duration);

            let startDateControl = formCellContainerProxy.getControl('StartDatePicker');
            startDateControl.setValue(startDateTime.date());

            let startTimeControl = formCellContainerProxy.getControl('StartTimePicker');
            startTimeControl.setValue(startDateTime.date());
        }

        libCom.saveInitialValues(context);
        return true;
    });
}
