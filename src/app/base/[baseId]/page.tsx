import { notFound, redirect } from "next/navigation";
import { BaseContainer } from "~/components/base/base-container";
import { api } from "~/trpc/server";

type BaseProps = {
  baseId: string;
};

export default async function BasePage({
  params,
}: {
  params: Promise<BaseProps>;
}) {
  const baseId = (await params).baseId;
  const tableId = await api.base.getFirstTable({ baseId });

  if (tableId === undefined) {
    notFound();
  }

  redirect(`/base/${baseId}/${tableId.id}`);
}
