import { Button } from "../ui/button";

export const LandingHeader = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 shadow-md">
      <div className="">
        <h1>Airtable</h1>
      </div>

      <div className="flex gap-2">
        <Button>Sign up for free</Button>

        <Button variant="outline">Log in</Button>
      </div>
    </div>
  );
};
