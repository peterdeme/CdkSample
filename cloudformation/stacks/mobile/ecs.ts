import cdk = require('@aws-cdk/core');
import { TaskDefinition, Compatibility,  ContainerImage, CfnService } from '@aws-cdk/aws-ecs';
import { GenericLogDriver } from "@aws-cdk/aws-ecs/lib/log-drivers/generic-log-driver"
import { Repository, IRepository } from '@aws-cdk/aws-ecr';
import { PolicyStatement, Effect } from '@aws-cdk/aws-iam';
import { cfParameter } from "../../parameters/parameters"
import { ParameterName } from '../../parameters/parametername';
import { CfnLoadBalancer, CfnTargetGroup, CfnListener, Protocol } from '@aws-cdk/aws-elasticloadbalancingv2';
import { queue } from "./sqs"

export function createEcsService(scope: cdk.Stack) {
    const svc = setupEcsService(scope);   

    setupLoadBalancer(scope, svc);
}

function setupEcsService(scope: cdk.Stack) {
    const taskDefinition = new TaskDefinition(scope, "mobile-taskdefinition", {
        compatibility: Compatibility.EC2
    });

    const role = taskDefinition.obtainExecutionRole();

    role.addToPolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sqs:*"],
        resources: [queue.queueArn]
    }));

    const appVersion = cfParameter(scope, ParameterName.AppVersion);

    taskDefinition.addContainer("MobileContainer", {
        image: ContainerImage.fromEcrRepository(getRepository(scope), appVersion.toString()),
        memoryReservationMiB: 512,
        environment: {
            "EnvironmentName": cfParameter(scope, ParameterName.EnvironmentName).toString()
        },
        logging: new GenericLogDriver({
            logDriver: 'sumologic',
            options: {
                "sumo-source-category": 'example-tag',
                "sumo-url": "https://myurl."
            }
        })
    });

    const svc = new CfnService(scope, "MobileService", {
        taskDefinition: taskDefinition.taskDefinitionArn,
        cluster: cfParameter(scope, ParameterName.ClusterName).toString()
    });

    return svc;
}

function setupLoadBalancer(scope: cdk.Stack, svc: CfnService) {
    const targetGroup = new CfnTargetGroup(scope, "TargetGroup", {
        targetType: "instance",
        protocol: "HTTP",
        vpcId: cfParameter(scope, ParameterName.VpcId).toString()
    });
    const loadBalancer = new CfnLoadBalancer(scope, "LoadBalancer", {
        name: "MobileLoadBalancer",
        scheme: "internet-facing"
    });
    new CfnListener(scope, "listener", {
        loadBalancerArn: loadBalancer.ref,
        defaultActions: [{ targetGroupArn: targetGroup.ref, type: "forward" }],
        port: 443,
        protocol: Protocol.HTTPS
    });
    svc.loadBalancers = [{
        targetGroupArn: targetGroup.ref,
        containerPort: 5000
    }];
}

function getRepository(scope: cdk.Stack): IRepository {
    return Repository.fromRepositoryAttributes(scope, "existingrepo", {
        "repositoryName": "mobilerepository",
        "repositoryArn": "arn:aws:ecr:eu-central-1:123456789012:repository/mobilerepository"
    });
}