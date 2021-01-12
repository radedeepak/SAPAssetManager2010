export default function SubOperationsEntitySet(context) {
	let binding = context.binding;
	let odataType = binding['@odata.type']; 
	if (odataType === '#sap_mobile.MyWorkOrderOperation') {
		return binding['@odata.readLink'] + '/SubOperations';
	} else {
		return 'MyWorkOrderSubOperations';
	}
}
