interface IUserDocument{
  _id: mongooes.Schema.Types.ObjectId,
  username: string,
  email: string,
  password: string,
  session: string
}

interface IVolumeDocument {
  owner: mongoose.Schema.Types.ObjectId,
  volumeName: string,
  volumeImage: string,
  volumeLang: string,
  volumeStructure: string,
}

interface IReqBody {
  username?: string;
  email: string;
  password: string;
}

export type { IUserDocument, IVolumeDocument, IReqBody }