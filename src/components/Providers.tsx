"use client";
import React from "react";
import { QueryClient } from "@tanstack/react-query"

const Providers = () => {
    const [queryClient] = React.useState(() => new QueryClient())
     
}

export default Providers