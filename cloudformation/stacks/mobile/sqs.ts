import cdk = require('@aws-cdk/core');
import { Queue } from '@aws-cdk/aws-sqs';


export function createQueues(scope: cdk.Stack) {
    queue = new Queue(scope, "MyQueue", {
        queueName: "MobileQueue"
    });
}

export let queue: Queue
