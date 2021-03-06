import { IAuthActions } from '../actions/auth-actions'
import { authActions } from '../actions/constants-actions'

export default function(state = {}, action: IAuthActions) {
  if (action.type === authActions.login) {
    const token = action.token
    if (token) {
      localStorage.setItem('token', token)
    }
    return { token, status: action.status }
  }
  if (action.type === authActions.logout) {
    localStorage.removeItem('token')
    return { token: '' }
  }
  return state
}
