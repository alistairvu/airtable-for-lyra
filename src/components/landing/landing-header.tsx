import { auth, signOut } from "~/server/auth";
import { Button } from "../ui/button";
import Link from "next/link";

export const LandingHeader = async () => {
  const session = await auth();

  return (
    <div className="flex items-center justify-between px-4 py-2 shadow-md">
      <div className="">
        <h1>Airtable</h1>
      </div>

      <div className="flex gap-2">
        {session?.user ? (
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button variant="outline">Log out</Button>
          </form>
        ) : (
          <Link href="/login">
            <Button size="lg">Get started </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
