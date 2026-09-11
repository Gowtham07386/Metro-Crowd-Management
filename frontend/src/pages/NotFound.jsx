import { Link } from "react-router-dom";
import { TrainFront } from "lucide-react";
import Button from "@/components/common/Button";
import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app-gradient px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white">
        <TrainFront className="h-7 w-7" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-slate-500">This station doesn&apos;t exist on the MetroFlow network.</p>
      <Link to={ROUTES.LOGIN} className="mt-6">
        <Button>Back to Login</Button>
      </Link>
    </div>
  );
}
