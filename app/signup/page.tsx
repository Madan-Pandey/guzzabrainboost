"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { playerContext } from "../context/playerContext";

function SignUp() {
  const router = useRouter();
  const { AssignPlayerData, tempScore, setTempScore} = useContext(playerContext)
  
  // Form state variables
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Show/hide password toggle
  const [showPassword, setShowPassword] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle sign-up form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("tiggered")
    setError("");
    setLoading(true);
    try {
      
      const reponse = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          name,
          password,
          tempScore,
        }),
      });

      if (reponse.ok) {
        const data = await reponse.json()
        AssignPlayerData(data.player)
        setTempScore(0)
        router.push("/quiz");
        console.log("User created successfully!");
      } else {
        const errorData = await reponse.json();
        console.log(errorData.message);
      }

      setUsername("");
      setPassword("");
      setName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="px-8 my-32 rounded py-8 border-2 mx-auto w-fit bg-white">
        <form onSubmit={handleSignUp}>
          <h1 className="title mb-5">Create New Account</h1>

          {error && <p className="text-red-600 mb-3">{error}</p>}

          {/* Username Field */}
          <div>
            <label>Username</label>
            <div>
              <input
                placeholder="@YourUsername"
                type="text"
                className="border-2 rounded px-2 py-4 w-96"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field with Toggle */}
          <div className="mt-3">
            <label>Password</label>
            <div className="relative">
              <input
                placeholder="Enter Password here"
                type={showPassword ? "text" : "password"}
                className="border-2 rounded px-2 py-4 w-96"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div className="mt-3">
            <label>Name</label>
            <div>
              <input
                placeholder="Enter Your Name Here"
                type="text"
                className="border-2 rounded px-2 py-4 w-96"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <button
              className="quizPbtn mt-5 w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="mt-4">
          <p>Already have an account?</p>
          <Link href={"/"} className="text-blue-600">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
