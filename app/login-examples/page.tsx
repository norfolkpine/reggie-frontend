import { Login01 } from "@/components/login-01"
import { Login03 } from "@/components/login-03"

export default function LoginExamplesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8 text-center">Login Examples</h1>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Login Example 01</h2>
          <div className="mx-auto max-w-sm">
            <Login01 />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Login Example 03</h2>
          <Login03 />
        </div>
      </div>
    </div>
  )
}

