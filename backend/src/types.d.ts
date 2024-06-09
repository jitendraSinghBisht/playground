interface IUserDocument{
  _id: mongooes.Schema.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  session: string;
}

interface IVolumeDocument {
  _id: mongooes.Schema.Types.ObjectId;
  owner: mongoose.Schema.Types.ObjectId;
  volumeName: string;
  volumeLang: string;
  volumeStructure: string;
}

interface IReqBody {
  username?: string;
  email: string;
  password: string;
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

interface IWSResponse {
  success: boolean;
  message: string;
  data?: any;
}

type workDir = "node" | "java" | "python" | "ccpp";

export type { IUserDocument, IVolumeDocument, IReqBody, IFile, IFolder, workDir, IWSResponse }