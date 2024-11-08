import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { auth, signIn } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Login() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <HydrateClient>
      <main className="min-w-screen flex min-h-screen items-center justify-center">
        <div className="flex min-w-64 flex-col items-center justify-center gap-y-2">
          <h2 className="text-2xl font-medium">Airtable</h2>

          <h1 className="mt02 text-4xl font-semibold">
            Get started with Airtable
          </h1>
          {/* <p className="text-lg">
            or{" "}
            <Link href="/" className="text-blue-500 underline">
              create an account
            </Link>
          </p> */}

          <div className="mt-4">
            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
            >
              <Button
                size="lg"
                variant="outline"
                className="w-96 text-2xl font-normal"
              >
                Sign in with <span className="font-semibold">Google</span>
              </Button>
            </form>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
