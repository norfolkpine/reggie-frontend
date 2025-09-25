interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='container min-h-screen flex flex-col items-center justify-center bg-primary-foreground px-4 sm:px-0'>
      <div className='mx-auto flex w-full max-w-md flex-col justify-center space-y-2 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl lg:p-8'>
        <div className='mb-4 flex items-center justify-center'>
          <img
            src='/opie-logo-mark-dark-purple-rgb.svg'
            alt='Opie Logo'
            className='mr-2 h-8 w-8'
          />
          {/* <h1 className='text-xl font-medium'>Opie</h1> */}
        </div>
        {children}
      </div>
    </div>
  )
}
