import React from 'react'
import PropTypes from 'prop-types'
import Footer from './Footer'

const Layout = ({ preview, children }) => {
  return (
    <>
      {/* <Meta /> */}
      <div className='min-h-screen'>
        <Alert preview={preview} />
        <main>{children}</main>
      </div>
      <Footer />
    </>
  )
}

Layout.propTypes = {}

export default Layout
