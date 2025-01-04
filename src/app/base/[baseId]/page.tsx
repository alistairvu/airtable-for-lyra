import { notFound, redirect } from "next/navigation";
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
  const firstTable = await api.base.getFirstTable({ baseId });

  if (firstTable === undefined) {
    notFound();
  }

  const firstView = await api.view.getFirstView({ tableId: firstTable.id });

  if (!firstView) {
    notFound();
  }

  redirect(`/base/${baseId}/${firstTable.id}/${firstView.id}`);
}
