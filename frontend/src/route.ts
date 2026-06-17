import { createBrowserRouter } from 'react-router'
import App from './App'    
import SignIn from './pages/SignIn'
import Signup from './pages/SignUp'
import Split from './pages/Split'

const basename = import.meta.env.BASE_URL === '/'
    ? '/'
    : import.meta.env.BASE_URL.replace(/\/$/, '');

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
], {
    basename
});
