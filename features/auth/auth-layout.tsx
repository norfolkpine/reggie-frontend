interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='container min-h-screen flex flex-col items-center justify-center bg-primary-foreground px-4 sm:px-0'>
      <div className='mx-auto flex w-full max-w-md flex-col justify-center space-y-2 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl lg:p-8'>
        {children}
      </div>
    </div>
  )
}
