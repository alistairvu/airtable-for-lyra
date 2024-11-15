import { notFound, redirect } from "next/navigation";
import { BaseContainer } from "~/components/base/base-container";
import { BaseHeader } from "~/components/base/base-header";
import { api, HydrateClient } from "~/trpc/server";

type BaseProps = {
  baseId: string;
  tableId?: string;
};

export default async function BasePage({
  params,
  children,
}: {
  params: Promise<BaseProps>;
  children: React.ReactNode;
}) {
  const baseId = (await params).baseId;

  const base = await api.base.get({ baseId });

  return (
    <HydrateClient>
      <BaseHeader base={base} />

      <main>{children}</main>
    </HydrateClient>
  );
}
