import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const command = new PutCommand({
    TableName: "test",
    Key: {
        "my-parition-key": "Shiba Inu"
    },
    Item: {
        "my-parition-key": "Shiba Inu",
        "other thing": "asdf"
    },
});

const response = await docClient.send(command);
console.log(response);