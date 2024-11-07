import { LandingHeader } from "~/components/landing/landing-header";
import { Button } from "~/components/ui/button";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  // if (session?.user) {
  //   void api.post.getLatest.prefetch();
  // }

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
            <Button size="lg">Sign up for free</Button>

            <Button variant="outline" size="lg">
              Log in
            </Button>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
