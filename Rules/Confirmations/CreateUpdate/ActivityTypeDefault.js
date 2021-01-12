

export default function ActivityTypeDefault(context) {

    let binding = context.binding;
    if (binding.ActivityType) {
        return binding.ActivityType;
    }
    if (binding.OperationActivityType) { //Default from the operation or sub-operation
        binding.ActivityType = binding.OperationActivityType;
        return binding.OperationActivityType;
    }
    return '';
}
