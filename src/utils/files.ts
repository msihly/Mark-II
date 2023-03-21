import { promises as fs, constants as fsc } from "fs";

export const checkFileExists = async (path: string) => !!(await fs.stat(path).catch(() => false));

export const copyFile = async (dirPath: string, fileBuffer: Buffer, newPath: string) => {
  if (await checkFileExists(newPath)) return false;
  await fs.mkdir(dirPath, { recursive: true });
  await fs.copyFile(fileBuffer, newPath, fsc.COPYFILE_EXCL);
  return true;
};

export const deleteFile = async (path: string, copiedPath?: string) => {
  try {
    if (!(await checkFileExists(path)))
      throw new Error(`Failed to delete ${path}. File does not exist.`);
    if (copiedPath && !(await checkFileExists(copiedPath)))
      throw new Error(
        `Failed to delete ${path}. File does not exist at copied path ${copiedPath}.`
      );

    await fs.unlink(path);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
