interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='container min-h-screen flex flex-col items-center justify-center bg-primary-foreground px-4 sm:px-0'>
      <div className='mx-auto flex w-full max-w-md flex-col justify-center space-y-2 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl lg:p-8'>
        <div className='mb-4 flex items-center justify-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          <h1 className='text-xl font-medium'>Opie - Operational Intelligence Engine</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
