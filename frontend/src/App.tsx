import {
  RouterProvider,
  createRoutesFromElements,
  createBrowserRouter,
  Route,
  Outlet
} from "react-router-dom";
import { Login } from "./components/pages/login";
import { Home } from "./components/pages/home";
import { Playground } from "./components/pages/playground";

export default function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Outlet />}>
        <Route path="" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="playground" element={<Playground />} />
      </Route>
    )
  );

  return (
    <div className="bg-black text-white h-screen w-full">
      <RouterProvider router={router} />
    </div>
  );
}