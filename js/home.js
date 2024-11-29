import { getNavBar } from '../components/navbar.js'

$(document).ready(() => {
    $('header').append(getNavBar())
})