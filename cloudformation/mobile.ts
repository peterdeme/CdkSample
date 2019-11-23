#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { MobileStack } from './stacks/mobile';

const app = new cdk.App();
new MobileStack(app, "MobileStack");
