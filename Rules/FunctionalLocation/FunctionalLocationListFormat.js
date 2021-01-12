import planningPlant from './FormatPlanningPlant';
import location from './FormatLocation';
import workcenter from './FormatWorkCenter';
import {ValueIfExists} from '../Common/Library/Formatter';
export default function FunctionalLocationListFormat(context) {
    var property = context.getProperty();
    var value = '-';
    switch (property) {
        case 'Title':
            return ValueIfExists(context.binding.FuncLocDesc, '-');
        case 'Subhead':
            return planningPlant(context).then(plant => {
                let result = plant;
                if (plant === '-') {
                    return  value;  
                } else {
                    return workcenter(context).then(center => {
                        if (center === '-') {
                            return  result;  
                        } else {
                            return  result + ', ' + center;
                        }
                    });
                }
            });
        case 'Footnote':
            return location(context).then(loc => {
                if (loc === '-') {
                    return  context.binding.FuncLocId;
                } else {
                    return  context.binding.FuncLocId + ', ' + loc;
                }
            });
        default:
            return value;
    }
}

