'use client'

import { signOutHandler } from "../signout.action"

export default function LogoutButton() {
  return (
    <button
      onClick={() => {
        signOutHandler()
      }}
      className="quizPbtn"
    >
      Logout
    </button>
  )
}

