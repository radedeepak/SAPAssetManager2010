export default function FormCellNoteValidation(context) {
    const noteValue = context.getValue();
    if (noteValue !== '') {
        context.clearValidationOnValueChange();
    }
         
}
