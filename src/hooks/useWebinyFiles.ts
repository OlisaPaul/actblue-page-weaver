import { useMutation } from "@apollo/client";
import { CREATE_FILE } from "../graphql/pages";

export const useWebinyFiles = () => {
  const [createFile] = useMutation(CREATE_FILE);

  const uploadImage = async (file: File): Promise<string> => {
    // 1. Create file entry in Webiny
    const { data } = await createFile({
      variables: {
        data: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      },
    });

    const fileData = data.fileManager.createFile.data;

    // 2. Upload directly to S3 using the presigned URL
    await fetch(fileData.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    return fileData.src;
  };

  return { uploadImage };
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
