"use client";

import { useState } from "react";
import { Card } from "@paylo/ui/Card";
import { TextInput } from "@paylo/ui/TextInput";
import { Select } from "@paylo/ui/Select";
import { Button } from "@paylo/ui/button";
import { createOnRampTransaction } from "../lib/actions/createOnRampTxn";

const SUPPORTED_BANKS = [
  {
    name: "HDFC Bank",
    redirectUrl: "https://netbanking.hdfcbank.com",
  },
  {
    name: "Axis Bank",
    redirectUrl: "https://www.axisbank.com/",
  },
];

export const AddMoney = () => {
  const [redirectUrl, setRedirectUrl] = useState(
    // This Redirect url shold have came from the bank
    SUPPORTED_BANKS[0]?.redirectUrl
  );
  const [amount, setAmount] = useState(0);
  const [provider, setProvider] = useState(SUPPORTED_BANKS[0]!.name);
  const [error, setError] = useState<string | null>(null);
  return (
    <Card title="Add Money">
      <div className="w-full">
        <TextInput
          label={"Amount"}
          placeholder={"Amount"}
          onChange={(value) => {
            const num = Number(value);
            if (Number.isNaN(num)) {
              setAmount(0);
              setError("Amount must be a number");
              return;
            }

            if (num < 100) {
              setAmount(num);
              setError("Minimum amount is 100");
              return;
            }

            setAmount(num);
            setError(null);
          }}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="py-4 text-left">Bank</div>
        <Select
          onSelect={(value) => {
            setRedirectUrl(
              SUPPORTED_BANKS.find((x) => x.name === value)?.redirectUrl || ""
            );
            setProvider(
              SUPPORTED_BANKS.find((x) => x.name === value)?.name || ""
            );
          }}
          options={SUPPORTED_BANKS.map((x) => ({
            key: x.name,
            value: x.name,
          }))}
        />
        <div className="flex justify-center pt-4">
          <button
            disabled={!!error || amount === 0}
            onClick={async () => {
              await createOnRampTransaction(amount * 100, provider);
              window.location.href = redirectUrl || "";
            }}
            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            type="button"
          >
            Add Money
          </button>
        </div>
      </div>
    </Card>
  );
};
