/**
 * Returns the correct query options for the material and serial number for an equipment.
 * If there is a notification on this object list row, get the equipment material from that object
 * @param {IClientAPI} context
 */
export default function ObjectListMaterialQueryOptions(context) {

    let binding = context.getPageProxy().binding;

    if (binding.Material_Nav) { //No Notification
        return '$expand=WOObjectList_Nav';
    }
    return '$expand=Equipment,Equipment/SerialNumber,Equipment/SerialNumber/Material&$select=Equipment/EquipId'; //Using Notification's equipment

}
