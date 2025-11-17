interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='container min-h-screen flex flex-col items-center justify-center px-4 sm:px-0'>
      <div className='mx-auto flex w-full max-w-md flex-col justify-center space-y-2 lg:p-8'>
        {children}
      </div>
    </div>
  )
}
