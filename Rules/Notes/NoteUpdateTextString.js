import NewTextString from './NoteUpdateNewTextString';
import RemoteTextString from './NoteRemoteTextString';

export default function NoteUpdateTextString(pageClientAPI) {

    let noteText = RemoteTextString(pageClientAPI) + '\n\n' + NewTextString(pageClientAPI);
    return noteText.trim();
}
