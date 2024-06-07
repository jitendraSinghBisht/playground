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

export type { IApiResponse, IApiError, IFile, IFolder, IUser, IVolume }