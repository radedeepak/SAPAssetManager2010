import toolbarCaption from './MobileStatus/OperationMobileStatusToolBarCaption';

export default function WorkOrderOperationDetailsOnReturning(context) {
    let caption = toolbarCaption(context);
    context.setToolbarItemCaption('IssuePartTbI', context.localizeText(caption));
}
