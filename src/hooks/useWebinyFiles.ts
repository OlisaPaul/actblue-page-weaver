const fs = require("fs");
const fetch = require("node-fetch");
const FormData = require("form-data");

// This is the Webiny API token, described in the previous section of the article.
const TOKEN = "YOUR_WEBINY_API_TOKEN"; // <---- Make sure you replace this value with your own!

// This is your Webiny GraphQL API endpoint.
const API_URL = "YOUR_WEBINY_API_URL/graphql"; // <---- Make sure you replace this value with your own!

// For demo purposes, this contains the path to a physical file which we'll be uploading.
const FILE_PATH = __dirname + "/video.mp4";


// This GraphQL query is used to create pre-signed POST payloads using the basic file information (name, type, and size).
const GetPreSignedPostPayload = `
  query GetPreSignedPostPayload($data: PreSignedPostPayloadInput!) {
    fileManager {
      getPreSignedPostPayload(data: $data) {
        data {
          data
          file {
            id
            name
            type
            size
            key
          }
        }
        error {
          code
          data
          message
        }
      }
    }
  }
`;

// This GraphQL mutation is used to store file information in the File Manager, after the file is uploaded to the S3 bucket.
const CreateFile = `
  mutation CreateFile($data: FmFileCreateInput!) {
    fileManager {
      createFile(data: $data) {
        data {
          id
          createdOn
          savedOn
          src
          name
          key
          type
          size
          tags
          location {
            folderId
          }
        }
        error {
          code
          message
          data
        }
      }
    }
  }
`;

async function getPreSignedPostPayload(data) {
  console.log("Getting pre-signed POST payload...");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      query: GetPreSignedPostPayload,
      variables: {
        data
      }
    })
  }).then(r => r.json());

  return response.data.fileManager.getPreSignedPostPayload.data;
}

async function createFileInFileManager(file) {
  console.log("Creating file record in the File Manager...");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      query: CreateFile,
      variables: {
        data: file
      }
    })
  }).then(r => r.json());

  return response.data.fileManager.createFile.data;
}

function uploadFileToS3(buffer, preSignedPostPayload) {
  console.log("Uploading file to S3...");
  // Create a form object, which we'll send to the AWS S3.
  const formData = new FormData();
  // Add all pre-signed payload fields to "FormData".
  Object.keys(preSignedPostPayload.fields).forEach(key => {
    formData.append(key, preSignedPostPayload.fields[key]);
  });
  // Add file content to "FormData".
  formData.append("file", buffer);

  // Finally make the upload request to S3.
  return fetch(preSignedPostPayload.url, {
    method: "POST",
    body: formData
  });
}

(async () => {
  // Read the size of the file, so we can request a pre-signed POST payload.
  const { size } = fs.statSync(FILE_PATH);

  // `data` represents S3 related data; `file` represents File Manager related information.
  const { data, file } = await getPreSignedPostPayload({
    name: "video.mp4",
    type: "video/mp4",
    size
  });

  // Read the file from the filesystem.
  const buffer = fs.readFileSync(FILE_PATH);

  // Upload the file binary data to AWS S3, using the pre-signed POST payload.
  await uploadFileToS3(buffer, data);

  const fileInput = {
    ...file,
    // Optionally, set file aliases. This allows you to set SEO friendly file paths.
    aliases: ["/videos/promo.mp4"],
    // Optionally, tag your file with some tags, for easier filtering in the File Manager UI.
    tags: ["programmatic"],
    // Optionally, specify an exact `folderId` to store the file into a specific folder.
    location: {
      folderId: "root"
    }
  };

  const createdFile = await createFileInFileManager(fileInput);

  console.log(`Your file is now accessible at the following URL:\n${createdFile.src}`);
})();