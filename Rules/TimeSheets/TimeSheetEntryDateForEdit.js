
export default function TimeSheetEntryDateForEdit(context) {
    let dt = context.binding.Date;
    let offset = new Date().getTimezoneOffset() * 60 * 1000; 
    let date = new Date(new Date(dt).getTime() + offset);
    return date;
}
