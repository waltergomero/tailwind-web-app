'use client'

import React from 'react'
import Link from 'next/link'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="w-full px-4 py-4 mx-auto sm:px-6 lg:px-8">
          {/* Copyright */}
            <p className="text-sm text-center text-gray-300 dark:text-gray-400">
              &copy; {currentYear} Your Company. All rights reserved.
            </p>   
        </div>
    </footer>
  )
}

export default Footer
