import { Button } from "./button";

interface AppbarProps {
  user?: {
    name?: string | null;
  };
  // TODO: Change any to porper types
  onSignin: () => Promise<void>;
  onSignout: () => Promise<void>;
}

export const Appbar = ({ user, onSignin, onSignout }: AppbarProps) => {
  return (
    <div className="flex justify-between items-center border-b border-slate-300 px-6 py-3 bg-white shadow-sm">
      <div className="text-2xl font-extrabold text-blue-600">
        Pay<span className="text-slate-900">LO</span>
      </div>
      <div className="flex flex-col justify-center pt-2">
        <Button onClick={user ? onSignout : onSignin}>
          {user ? "Logout" : "Login"}
        </Button>
      </div>
    </div>
  );
};


