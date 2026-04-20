import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { SecretsManager } from "./pages/SecretsManager";
import { S3 } from "./pages/S3";
import { S3CreateBucket } from "./pages/S3CreateBucket";
import { DynamoDB } from "./pages/DynamoDB";
import { DynamoDBCreateTable } from "./pages/DynamoDBCreateTable";
import { SQS } from "./pages/SQS";
import { SQSCreateQueue } from "./pages/SQSCreateQueue";
import SNS from "./pages/SNS";
import Lambda from "./pages/Lambda";
import { LambdaCreateFunction } from "./pages/LambdaCreateFunction";
import { CloudWatchLogs } from "./pages/CloudWatchLogs";
import { SSM } from "./pages/SSM";
import { SES } from "./pages/SES";
import { EventBridge } from "./pages/EventBridge";
import { Route53 } from "./pages/Route53";
import { KMS } from "./pages/KMS";
import { IAM } from "./pages/IAM";
import { IAMCreatePolicy } from "./pages/IAMCreatePolicy";
import { IAMCreateRole } from "./pages/IAMCreateRole";
import { CloudFormation } from "./pages/CloudFormation";
import { EC2 } from "./pages/EC2";
import { RDS } from "./pages/RDS";
import { ECS } from "./pages/ECS";
import Cognito from "./pages/Cognito";
import WAFv2 from "./pages/WAFv2";
import ACM from "./pages/ACM";
import Kinesis from "./pages/Kinesis";
import StepFunctions from "./pages/StepFunctions";
import CloudWatch from "./pages/CloudWatch";
import APIGatewayV2 from "./pages/APIGatewayV2";
import APIGatewayV1 from "./pages/APIGatewayV1";
import ELBv2 from "./pages/ELBv2";
import CloudFront from "./pages/CloudFront";
import ElastiCache from "./pages/ElastiCache";
import Firehose from "./pages/Firehose";
import ECR from "./pages/ECR";
import AppSync from "./pages/AppSync";
import CloudMap from "./pages/CloudMap";
import AutoScaling from "./pages/AutoScaling";
import CodeBuild from "./pages/CodeBuild";
import AppConfig from "./pages/AppConfig";
import { ToastProvider } from "./hooks/useToast";
import { ToastContainer } from "./components/ui/ToastContainer";

import { DesignSystem } from "./pages/DesignSystem";

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/secrets-manager" element={<SecretsManager />} />
            <Route path="/secrets-manager/:secretName" element={<SecretsManager />} />
            <Route path="/s3" element={<S3 />} />
            <Route path="/s3/create" element={<S3CreateBucket />} />
            <Route path="/s3/:bucketName/*" element={<S3 />} />
            <Route path="/dynamodb" element={<DynamoDB />} />
            <Route path="/dynamodb/create" element={<DynamoDBCreateTable />} />
            <Route path="/dynamodb/:tableName" element={<DynamoDB />} />
            <Route path="/sqs" element={<SQS />} />
            <Route path="/sqs/create" element={<SQSCreateQueue />} />
            <Route path="/sqs/:queueName" element={<SQS />} />
            <Route path="/sns" element={<SNS />} />
            <Route path="/sns/:topicArn" element={<SNS />} />
            <Route path="/lambda" element={<Lambda />} />
            <Route path="/lambda/create" element={<LambdaCreateFunction />} />
            <Route path="/lambda/:functionName" element={<Lambda />} />
            <Route path="/logs" element={<CloudWatchLogs />} />
            <Route path="/logs/*" element={<CloudWatchLogs />} />
            <Route path="/ssm" element={<SSM />} />
            <Route path="/ses" element={<SES />} />
            <Route path="/eventbridge" element={<EventBridge />} />
            <Route path="/route53" element={<Route53 />} />
            <Route path="/kms" element={<KMS />} />
            <Route path="/iam" element={<IAM />} />
            <Route path="/iam/policies/create" element={<IAMCreatePolicy />} />
            <Route path="/iam/roles/create" element={<IAMCreateRole />} />
            <Route path="/cloudformation" element={<CloudFormation />} />
            <Route path="/ec2" element={<EC2 />} />
            <Route path="/rds" element={<RDS />} />
            <Route path="/ecs" element={<ECS />} />
            <Route path="/cognito" element={<Cognito />} />
            <Route path="/cognito/user-pools/:poolId" element={<Cognito />} />
            <Route path="/wafv2" element={<WAFv2 />} />
            <Route path="/design-system" element={<DesignSystem />} />
            <Route path="/acm" element={<ACM />} />
            <Route path="/kinesis" element={<Kinesis />} />
            <Route path="/states" element={<StepFunctions />} />
            <Route path="/cloudwatch-metrics" element={<CloudWatch />} />
            <Route path="/apigw-v2" element={<APIGatewayV2 />} />
            <Route path="/apigw-v1" element={<APIGatewayV1 />} />
            <Route path="/elbv2" element={<ELBv2 />} />
            <Route path="/cloudfront" element={<CloudFront />} />
            <Route path="/elasticache" element={<ElastiCache />} />
            <Route path="/firehose" element={<Firehose />} />
            <Route path="/ecr" element={<ECR />} />
            <Route path="/appsync" element={<AppSync />} />
            <Route path="/cloud-map" element={<CloudMap />} />
            <Route path="/autoscaling" element={<AutoScaling />} />
            <Route path="/codebuild" element={<CodeBuild />} />
            <Route path="/appconfig" element={<AppConfig />} />
          </Routes>
        </AppLayout>
      </Router>
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;
