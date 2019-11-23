import cdk = require('@aws-cdk/core');
import { createEcsService } from "./mobile/ecs"
import { createQueues } from "./mobile/sqs"


export class MobileStack extends cdk.Stack {
    constructor(parent?: cdk.Construct, id?: string, props?: cdk.StackProps) {
        super(parent, id, props);

        createQueues(this);
        createEcsService(this);        
    }   
}
