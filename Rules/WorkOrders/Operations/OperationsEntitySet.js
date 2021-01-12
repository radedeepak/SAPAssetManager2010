export default function OperationsEntitySet(context) {
	let binding = context.binding;
	let odataType = binding['@odata.type']; 
	if (odataType === '#sap_mobile.MyWorkOrderHeader') {
		return binding['@odata.readLink'] + '/Operations';
	} else {
		return 'MyWorkOrderOperations';
	}
}
