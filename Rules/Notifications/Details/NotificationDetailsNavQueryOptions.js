
export default function NotificationDetailsNavQueryOptions() {
    return '$select=NotificationDescription,NotificationNumber,NotificationType,PlanningPlant,OrderId,RequiredEndDate,PriorityType,Priority,BreakdownIndicator,HeaderFunctionLocation,HeaderEquipment,NotifPriority/PriorityDescription,'
    + 'NotifPriority/Priority,FunctionalLocation/FuncLocDesc,ObjectKey,NotifDocuments/DocumentID,NotifMobileStatus_Nav/MobileStatus,NotifMobileStatus_Nav/ObjectKey,'
    + 'MalfunctionStartDate,MalfunctionStartTime,MalfunctionEndDate,MalfunctionEndTime'
    + '&$expand=WorkOrder,NotifPriority,NotifMobileStatus_Nav,NotifDocuments,NotifDocuments/Document,HeaderLongText,FunctionalLocation,Equipment';
}
