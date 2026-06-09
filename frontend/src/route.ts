import {createBrowserRouter} from 'react-router'
import App from './App'    
import SignIn from './pages/SignIn'
import Signup from './pages/SignUp'

export default createBrowserRouter([
    {
        path: '/',
        children: [
            {index: true, Component: App},
            {path: 'signin', Component: SignIn},
            {path: 'signup', Component: Signup}
        ]
    }
]);