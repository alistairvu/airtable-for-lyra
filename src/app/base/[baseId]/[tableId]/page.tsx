import { notFound, redirect } from "next/navigation";
import { api } from "~/trpc/server";

type BaseProps = {
  baseId: string;
  tableId: string;
};

export default async function TablePage({
  params,
}: {
  params: Promise<BaseProps>;
}) {
  const baseId = (await params).baseId;
  const tableId = (await params).tableId;

  const firstView = await api.view.getFirstView({ tableId });

  if (!firstView) {
    notFound();
  }

  redirect(`/base/${baseId}/${tableId}/${firstView.id}`);
}
