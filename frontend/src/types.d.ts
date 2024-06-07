interface IApiResponse {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;
}

interface IApiError {
  statusCode: number;
  message: string;
  success: false;
  errors: Array<Error>;
}

interface IFile {
  id: string;
  name: string;
}

interface IFolder {
  id: string;
  name: string;
  childFiles: Array<IFile>;
  childFolder: Array<IFolder>;
}

interface IUser {
  username: string;
  email: string;
  password: string;
}

interface IVolume {
  _id: string;
  volumeName: string;
  volumeLang: string;
}

interface IFolderOptions {
  changeFile: (fileId: string) => void;
  saveCurFile: () => void;
  createFile: (folderId: string) => void;
  createFolder: (folderId: string) => void;
  deleteFile: (fileId: string) => void;
  deleteFolder: (folderId: string) => void;
  renameFile: (fileId: string) => void;
  renameFolder: (folderId: string) => void;
}

export type { IApiResponse, IApiError, IFile, IFolder, IUser, IVolume, IFolderOptions }