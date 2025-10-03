"use client";
// use client to use useState and other React components

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/user";


function LogOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const handleLogOut = async () => {
    setLoading(true);
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    // const errorMessage = null;
    const { errorMessage } = await logoutAction();
    if (!errorMessage) {
    toast.success("Logged out", {
        description: "You have been successfully logged out",
        style: {
            backgroundColor: "#2b9e7d",
        }
        },);
        router.push('/')
    }
    else {
        toast.error("Error", {
            description:errorMessage,
            style: {
                backgroundColor: "#d95556",
            }
        },);
        }

    setLoading(false);
    console.log("Logging out...");
  };
  return (
    <Button
      className="w-24"
      variant="outline"
      onClick={() => {
        handleLogOut();
      }}
    >
      {loading ? <Loader2 className="animate-spin" /> : "Log Out"}
    </Button>
  );
}

export default LogOutButton;
