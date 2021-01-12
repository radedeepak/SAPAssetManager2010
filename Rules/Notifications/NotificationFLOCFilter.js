import libCom from '../Common/Library/CommonLibrary';
import { GlobalVar } from '../Common/Library/GlobalCommon';

export default function NotificationFLOCFilter(context) {
    let notificationPlanningPlant;

    if (GlobalVar.getUserSystemInfo().get('USER_PARAM.IWK')) {
        notificationPlanningPlant = GlobalVar.getUserSystemInfo().get('USER_PARAM.IWK');
    } else {
        notificationPlanningPlant = libCom.getAppParam(context, 'NOTIFICATION', 'PlanningPlant');
    }
    
    if (notificationPlanningPlant) {
        return `$filter=PlanningPlant eq '${notificationPlanningPlant}'&$orderby=FuncLocId`;
    } else {
        return '&$orderby=FuncLocId';
    }
    
}
