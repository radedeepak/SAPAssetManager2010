import libCommon from '../Common/Library/CommonLibrary';
import Constants from '../Common/Library/ConstantsLibrary';

export default function NoteUpdateNewTextString(pageClientAPI) {

    let updatedLocalNote = libCommon.getFieldValue(pageClientAPI, 'LongTextNote', '', null, true);
    let newTextString = updatedLocalNote.trim();

    if (!libCommon.getStateVariable(pageClientAPI, Constants.stripNoteNewTextKey)) {
        // Should not strip previous text
        let note = libCommon.getStateVariable(pageClientAPI, Constants.noteStateVariable);
        if (note && note.NewTextString) {
            newTextString = note.NewTextString + '\n\n' + newTextString;
            newTextString = newTextString.trim();
        }
    }

    return newTextString;
}
