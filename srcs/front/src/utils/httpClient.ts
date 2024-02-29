import axios, { AxiosRequestConfig } from 'axios'

const httpInstance = (axiosOptions: AxiosRequestConfig = {}) => {
  const baseURL = process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:3000'
  const options: AxiosRequestConfig = {
    ...axiosOptions,
    baseURL,
    withCredentials: true,
  }

  return axios.create(options)
}

export default httpInstance
