import { exit } from "process";
require("dotenv").config();




const { 
    GOOGLE_APPLICATION_CREDENTIALS, 
    KMS_PROJECT_ID, 
    KMS_LOCATION_ID, 
    KMS_KEYRING_ID,
    KMS_KEY_ID,
    KMS_KEY_VERSION,
} = process.env;
if (GOOGLE_APPLICATION_CREDENTIALS === undefined) {
    console.error("GOOGLE_APPLICATION_CREDENTIALS env var not set.");
    exit(-1);
}
if (KMS_PROJECT_ID === undefined)  {
    console.error("KMS_PROJECT_ID env var not set.");
    exit(-1);
}
if (KMS_LOCATION_ID === undefined)  {
    console.error("KMS_LOCATION_ID env var not set.");
    exit(-1);
}
if (KMS_KEYRING_ID === undefined)  {
    console.error("KMS_KEYRING_ID env var not set.");
    exit(-1);
}

interface KmsCredentials {
    projectId: string,
    locationId: string,
    keyRingId: string,
    keyId: string,
    keyVersion: string,
}

export default function getKmsCredentials(): KmsCredentials {
    return {
        projectId: KMS_PROJECT_ID!,
        locationId: KMS_LOCATION_ID!,
        keyRingId: KMS_KEYRING_ID!,
        keyId: KMS_KEY_ID!,
        keyVersion: KMS_KEY_VERSION!,
    }
}
