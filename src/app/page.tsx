import { LandingHeader } from "~/components/landing/landing-header";
import { Button } from "~/components/ui/button";
import Link from "next/link";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="">
        <LandingHeader />

        <div className="mt-36 p-4">
          <h1 className="text-4xl font-semibold">
            Digital operations for the AI era
          </h1>

          <h2 className="mt-2 text-lg">
            Create modern business apps to manage and automate critical
            processes.
          </h2>

          <div className="mt-4 flex flex-col gap-2 lg:flex-row">
            {session?.user ? (
              <Link href="/dashboard">
                <Button size="lg">Go to dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg">Get started </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
