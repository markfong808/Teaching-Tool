import React, { useState } from "react"
import Signup from "../components/Signup"
import Login from "../components/Login"

export default function LoginSignup() {
    const [currentForm, setCurrentForm] = useState("login");

    return (
        <div>
            {
                currentForm === "login" ? <Login /> : <Signup />
            }
        </div>

    )
}