export default function WorkOrderOperationMobileStatusFilter(context) {
    return { name: 'OperationMobileStatus_Nav/MobileStatus', values: [{ReturnValue: 'RECEIVED', DisplayValue: context.localizeText('received')},{ReturnValue: 'STARTED', DisplayValue: context.localizeText('started')},{ReturnValue: 'HOLD', DisplayValue: context.localizeText('hold')},{ReturnValue: 'TRANSFER', DisplayValue: context.localizeText('transfer')},{ReturnValue: 'COMPLETED', DisplayValue: context.localizeText('completed')}]};
}
