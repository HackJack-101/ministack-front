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
import { IAM } from "./pages/IAM";
import { IAMCreatePolicy } from "./pages/IAMCreatePolicy";
import { IAMCreateRole } from "./pages/IAMCreateRole";
import { ToastProvider } from "./hooks/useToast";
import { ToastContainer } from "./components/ui/ToastContainer";

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
            <Route path="/iam" element={<IAM />} />
            <Route path="/iam/policies/create" element={<IAMCreatePolicy />} />
            <Route path="/iam/roles/create" element={<IAMCreateRole />} />
          </Routes>
        </AppLayout>
      </Router>
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;
