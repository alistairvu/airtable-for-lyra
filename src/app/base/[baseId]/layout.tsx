import { BaseHeader } from "~/components/base/layout/base-header";
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
      <div className="relative">
        <BaseHeader base={base} />

        <main>{children}</main>
      </div>
    </HydrateClient>
  );
}
