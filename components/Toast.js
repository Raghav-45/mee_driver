import React, { useState, useRef } from 'react'

const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
)
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
)
const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
)
const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M11.484 2.17a.75.75 0 011.032 0 11.209 11.209 0 007.877 3.08.75.75 0 01.722.515 12.74 12.74 0 01.635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 01-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.223-2.73.635-3.985a.75.75 0 01.722-.516l.143.001c2.996 0 5.718-1.17 7.734-3.08zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zM12 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H12z" clipRule="evenodd" />
  </svg>
)

export const Toast = (props) => {
  const title = props.Details.title
  const description = props.Details.description
  const status = props.Details.status
  const duration = props.Details.duration
  const isClosable = props.Details.isClosable

  const ToastRef = useRef(null)

  return (
    <div id="toast-warning" className={`relative flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800`} role="alert">

      {status == 'success' && <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500/80 bg-green-50 rounded-lg dark:bg-green-700 dark:text-green-200/80`}>
        <SuccessIcon />
        <span className="sr-only">{status} icon</span>
      </div>}
      {status == 'info' && <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500/80 bg-blue-50 rounded-lg dark:bg-blue-700 dark:text-blue-200/80`}>
        <InfoIcon />
        <span className="sr-only">{status} icon</span>
      </div>}
      {status == 'warning' && <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500/80 bg-orange-50 rounded-lg dark:bg-orange-700 dark:text-orange-200/80`}>
        <WarningIcon />
        <span className="sr-only">{status} icon</span>
      </div>}
      {status == 'error' && <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500/80 bg-red-50 rounded-lg dark:bg-red-700 dark:text-red-200/80`} >
        <ErrorIcon />
        <span className="sr-only">{status} icon</span>
      </div>}

      <div className="ml-3 text-sm font-normal">{description}</div>
      {isClosable && <button type="button" onClick={() => ToastRef?.current?.remove()} className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-warning" aria-label="Close" style={{animation: `HeightFullToZero 0.26s ${duration/1000 - 0.25}s, PaddingFullToZero 0.26s ${duration/1000 - 0.25}s`}}>
        <span className="sr-only">Close</span>
        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>}
      {/* <div className='absolute bottom-0 left-0 bg-green-400 h-1 w-0' style={{animation: `ZeroToFull ${duration/1000 - 0.25}s`, 'animation-timing-function': 'linear'}} ></div> */}
    </div>
  )
}