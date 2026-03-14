import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { Authprovider } from "./features/auth/auth.context.jsx"

function App() {
  return (
    <Authprovider>
    <RouterProvider router={router} />
    </Authprovider>
  )
}

export default App
