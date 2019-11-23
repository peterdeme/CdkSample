import cdk = require('@aws-cdk/core');
import { ParameterType } from "./parametertype"
import { ParameterName } from "./parametername"

const parameterProps: Map<ParameterName, cdk.CfnParameterProps> = new Map([
    [
        ParameterName.AppVersion,
        {
            type: ParameterType.String,
            description: "My app version."
        }
    ],
    [   ParameterName.EnvironmentName,
        {
            type: ParameterType.String,
            description: "The name of the environment to attach this stack to."            
        }
    ],
    [
        ParameterName.ClusterName,
        {
            type: ParameterType.String,
            description: "The name of the ECS cluster.",            
        }
    ]
]);

const registeredParameters: Map<ParameterName, cdk.CfnParameter> = new Map()

export function cfParameter(scope: cdk.Stack, key: ParameterName): cdk.IResolvable {
    let cfnParam = registeredParameters.get(key)
    
    if (!cfnParam) {
        cfnParam = new cdk.CfnParameter(scope, key, parameterProps.get(key));
        registeredParameters.set(key, cfnParam)
    }

    return cfnParam.value
}
