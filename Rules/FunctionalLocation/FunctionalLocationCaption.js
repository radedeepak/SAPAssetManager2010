import CommonLibrary from '../Common/Library/CommonLibrary';

export default function FunctionalLocationCaption(context) {
            let count = CommonLibrary.getTargetPathValue(context, '#Page:-Previous/#ClientData/#Property:Count');
            let params=[count];
            return context.localizeText('function_location_caption',params);
}
