"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const redirect = setTimeout(() => {
      router.back();
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#f6fbf5]">
      <h2 className="text-3xl font-extrabold text-[#1F2421] mb-2">404 - Not Found</h2>
      <p className="text-[#606863]">Could not find the requested resource.</p>
      <p className="text-[#606863] font-medium mt-4">
        Redirecting to the previous page in {countdown} seconds...
      </p>
    </div>
  );
}
