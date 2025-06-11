import { auth } from "@/auth";
import LoginButton from "./components/buttons/loginBtn";
import LogoutButton from "./components/buttons/logoutBtn";

async function Login() {
  const session = await auth();
  if (session) {
    const user = session.user;
    const name = user?.firstName == null  ? "Anonymous" : user?.firstName
    return (
      <div className="flex h-full">
        <div className="px-8 my-32 rounded py-8 border-2 mx-auto w-fit bg-white">
          <div className="">
            <h1 className="title mb-5 w-32">Welcome</h1>
            <p>Hello, {name} </p>
            <p>
              You are already loged in, if you want to loginto another account
              please logout
            </p>
            <div className="mt-5 w-full">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full">
      <div className="px-8 my-32 rounded py-8 border-2 mx-auto w-fit bg-white">
        <div className="">
          <h1 className="title mb-5 w-32">Log in</h1>
          <p>
            Hello, Welcome to Guhuza’s Brain Boost , The authentication is handled by
            Guhuza
          </p>

          <div>
            <div className="mt-5 w-full">
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
