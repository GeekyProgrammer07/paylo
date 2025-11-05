"use client";

import { useState } from "react";
import { Card } from "@paylo/ui/Card";
import { TextInput } from "@paylo/ui/TextInput";
import { Select } from "@paylo/ui/Select";
import { Button } from "@paylo/ui/button";

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
    SUPPORTED_BANKS[0]?.redirectUrl
  );
  return (
    <Card title="Add Money">
      <div className="w-full">
        {/* TODO: Add type validation for amount */}
        <TextInput
          label={"Amount"}
          placeholder={"Amount"}
          onChange={() => {}}
        />
        <div className="py-4 text-left">Bank</div>
        <Select
          onSelect={(value) => {
            setRedirectUrl(
              SUPPORTED_BANKS.find((x) => x.name === value)?.redirectUrl || ""
            );
          }}
          options={SUPPORTED_BANKS.map((x) => ({
            key: x.name,
            value: x.name,
          }))}
        />
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => {
              window.location.href = redirectUrl || "";
            }}
          >
            Add Money
          </Button>
        </div>
      </div>
    </Card>
  );
};
