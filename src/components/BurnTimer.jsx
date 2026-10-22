import { useEffect, useState } from "react";

export default function BurnTimer({
  expiresAt
}) {
  const calculateRemaining = () => {
    const difference =
      new Date(expiresAt).getTime() -
      Date.now();

    return Math.max(0, difference);
  };

  const [remaining, setRemaining] =
    useState(calculateRemaining);

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setRemaining(
          calculateRemaining()
        );
      }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [expiresAt]);

  const totalSeconds =
    Math.floor(remaining / 1000);

  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  return (
    <div className="burn-timer">
      <span>⏳</span>

      <span>
        Expires in{" "}
        <strong>
          {minutes}:
          {seconds
            .toString()
            .padStart(2, "0")}
        </strong>
      </span>
    </div>
  );
}