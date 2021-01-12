export default function MarkerSize(context) {
    let priority = context.binding.Priority;
    if (priority === '1' || priority === '2') {
        if (context.nativescript.platformModule.isAndroid) {
            return 28;
        } else {
            return 33; 
        }    
    }
    if (context.nativescript.platformModule.isAndroid) {
        return 28;
    } else {
        return 28;
    }
}
