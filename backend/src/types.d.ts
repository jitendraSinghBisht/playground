interface UserDocument{
  _id: mongooes.Schema.Types.ObjectId,
  username: string,
  email: string,
  password: string,
  session: string
}

interface VolumeDocument {
  owner: mongoose.Schema.Types.ObjectId,
  volumeName: string,
  volumeImage: string,
  volumeLang: string,
  volumeStructure: string,
}

export type { UserDocument, VolumeDocument }