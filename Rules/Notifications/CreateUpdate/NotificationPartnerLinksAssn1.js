import PartnerFunctionForPersonelNumber from '../../Common/Partner/PartnerFunctionForPersonelNumber';
import PartnerPersonnelNumber from '../../Common/Partner/PartnerPersonnelNumber';

/**
* Creates the navigation links for entityset MyNotificationPartners from action NotificationCreateChangesetAssn1.
* @param {IClientAPI} context
*/
export default function NotificationPartnerLinksAssn1() {
	let links = [];

	//Add the Notification nav link.
	links.push({
		'Property' : 'Notification',
		'Target':
		{
			'EntitySet': 'MyNotificationHeaders',
			'ReadLink': 'pending_1',
		},
	});
	
	//Add the partner fuction nav link.
	let personnelPartnerFunction = PartnerFunctionForPersonelNumber();
	links.push({
		'Property' : 'PartnerFunction_Nav',
		'Target':
		{
			'EntitySet': 'PartnerFunctions',
			'ReadLink': `PartnerFunctions('${personnelPartnerFunction}')`,
		},
	});

	//Add the employee nav link.
	let partnerPersonnelNumber = PartnerPersonnelNumber();
	links.push({
		'Property' : 'Employee_Nav',
		'Target':
		{
			'EntitySet': 'Employees',
			'ReadLink': `Employees('${partnerPersonnelNumber}')`,
		},
	});
	
	return links;
}
