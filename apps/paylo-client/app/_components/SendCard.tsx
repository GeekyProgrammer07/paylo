"use client";

import { Button } from "@paylo/ui/button";
import { Card } from "@paylo/ui/Card";
import { Center } from "@paylo/ui/Center";
import { TextInput } from "@paylo/ui/TextInput";
import { useState } from "react";
import { p2pTransfer } from "../lib/actions/p2pTransfer";

export function SendCard() {
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState(0);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSend = async () => {
    const res = await p2pTransfer(number, amount);

    if (!res.ok) {
      setIsError(!res.ok);
      setMsg(res.message);
      return;
    }

    setMsg("Money sent successfully!");
  };

  return (
    <div className="h-[90vh]">
      <Center>
        <Card title="Send">
          <div className="min-w-72 pt-2">
            <TextInput
              placeholder="Number"
              label="Number"
              onChange={(value) => setNumber(value)}
            />

            <TextInput
              placeholder="Amount"
              label="Amount"
              onChange={(value) => setAmount(Number(value))}
            />

            <div className="pt-4 flex justify-center">
              <Button onClick={handleSend}>Send</Button>
            </div>

            {msg && (
              <p
                className={`text-center pt-3 ${
                  isError ? "text-red-500" : "text-green-500"
                }`}
              >
                {msg}
              </p>
            )}
          </div>
        </Card>
      </Center>
    </div>
  );
}
