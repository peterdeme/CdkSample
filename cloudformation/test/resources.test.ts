import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import { MobileStack } from '../stacks/mobile';

const stack = new MobileStack(new cdk.App());

test('Contains required resources', () => {
    expectCDK(stack).to(haveResource("AWS::ECS::TaskDefinition"))
    expectCDK(stack).notTo(haveResource("AWS::ECR::Repository"))
});