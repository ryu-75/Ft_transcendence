export interface IMe {
  email: string
  login: string
  accessToken: string
  refreshToken: string
  image: {
    link: string
    versions: {
      large: string
      medium: string
      small: string
      micro: string
    }
  }
}
