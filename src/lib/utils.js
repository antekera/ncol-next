import axios from 'axios'
import { PLACEHOLDER_API_URL } from './constants'

export const getAllPostsFromServer = async () => {
  try {
    const { data } = await axios.get(PLACEHOLDER_API_URL)
    return data
  } catch (error) {
    console.log(error)
  }
}
