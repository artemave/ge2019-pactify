import hyperdom from 'hyperdom'
import {router} from 'hyperdom/router'
import './vendor.sass'
import App from './app'

hyperdom.append(document.body, new App(), { router: router({ baseUrl: window.location.pathname }) })
