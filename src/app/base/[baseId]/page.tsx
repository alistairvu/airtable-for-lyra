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

  const base = await api.base.get({ baseId });

  return <BaseContainer base={base} />;
}
