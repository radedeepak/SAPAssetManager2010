import libWoMobile from '../MobileStatus/WorkOrderMobileStatusLibrary';
import libClock from '../../ClockInClockOut/ClockInClockOutLibrary';
import libCommon from '../../Common/Library/CommonLibrary';
export default function WorkOrderDetailsObjectHeaderTags(context) {
    let binding = context.getBindingObject();
    var tags = [];
    tags.push(context.getBindingObject().OrderType);
   
    if (context.getPageProxy().getClientData().isWOSigned) {
        tags.push(context.localizeText('SIGNED'));
    } 
    if (binding.MarkedJob && binding.MarkedJob.PreferenceValue && binding.MarkedJob.PreferenceValue === 'true') {
        tags.push(context.localizeText('FAVORITE'));
    }
    return libWoMobile.headerMobileStatus(context).then((mStatus) => {
        if (libClock.isBusinessObjectClockedIn(context)) { //Clock in/out feature enabled and user is clocked in to this WO, regardless of mobile status
            var woStarted = libCommon.getAppParam(context, 'MOBILESTATUS', context.getGlobalDefinition('/SAPAssetManager/Globals/MobileStatus/ParameterNames/StartParameterName.global').getValue());
            tags.push(context.localizeText(woStarted) + '-' + context.localizeText('clocked_in'));
            return tags;
        } else {
            tags.push(context.localizeText(mStatus));
            return tags;
        }
    });
}
