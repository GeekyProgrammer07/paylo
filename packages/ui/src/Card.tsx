import React, { JSX } from "react";

type Card = {
  title: string;
  children: React.ReactNode;
};

export function Card({ title, children }: Card): JSX.Element {
  return (
    <div className="max-w-4/5 border p-6 bg-white rounded-xl">
      <h1 className="text-xl border-b pb-2">{title}</h1>
      <div>{children}</div>
    </div>
  );
}
