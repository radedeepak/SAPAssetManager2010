/**
* Describe this function...
* @param {IClientAPI} context
*/
export default function RequiredFields(context) {
    let required = ['NotificationDescription'];

    if (context.evaluateTargetPathForAPI('#Control:PartnerPicker1').visible) {
        required.push('PartnerPicker1');
    }

    if (context.evaluateTargetPathForAPI('#Control:PartnerPicker2').visible) {
        required.push('PartnerPicker2');
    }

    return required;
}
