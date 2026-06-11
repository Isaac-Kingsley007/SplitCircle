import {createBrowserRouter} from 'react-router'
import App from './App'    
import SignIn from './pages/SignIn'
import Signup from './pages/SignUp'
import Split from './pages/Split'

export default createBrowserRouter([
    {
        path: '/',
        children: [
            {index: true, Component: App},
            {path: 'signin', Component: SignIn},
            {path: 'signup', Component: Signup},
            {path: 'split/:split_id', Component: Split}
        ]
    }
]);