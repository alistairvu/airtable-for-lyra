"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { type BaseWithTables } from "~/@types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

type BaseRenameProps = {
  initialBase: BaseWithTables;
};

export const BaseRename = ({ initialBase }: BaseRenameProps) => {
  const utils = api.useUtils();

  const { data: base } = api.base.get.useQuery(
    { baseId: initialBase.id },
    {
      initialData: initialBase,
    },
  );

  // Mutation for optimistic base rename
  const renameBase = api.base.rename.useMutation({
    onMutate: async ({ baseId, name }) => {
      // Cancel query
      await utils.base.get.cancel();

      // Snapshot previous value
      const previousBase = utils.base.get.getData({
        baseId,
      });

      // Edit current cached value
      utils.base.get.setData({ baseId }, (data) =>
        data
          ? {
              ...data,
              name,
            }
          : undefined,
      );

      return { baseId, previousBase };
    },

    onError: (_err, params, context) => {
      utils.base.get.setData(
        { baseId: params.baseId },
        context?.previousBase ?? undefined,
      );
    },

    onSettled: async (_data, _error, params) => {
      await utils.base.get.invalidate({ baseId: params.baseId });
    },
  });

  // Section: Form setup
  const baseRenameSchema = z.object({
    name: z.string().min(0, {
      message: "A base must have a name.",
    }),
  });

  const baseRenameForm = useForm<z.infer<typeof baseRenameSchema>>({
    resolver: zodResolver(baseRenameSchema),
    defaultValues: {
      name: initialBase.name,
    },
  });

  const onSubmit = (values: z.infer<typeof baseRenameSchema>) => {
    if (values.name !== initialBase.name) {
      renameBase.mutate({
        baseId: initialBase.id,
        name: values.name,
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="hover:bg-rose-800 hover:text-white">
          <div className="flex items-center justify-center gap-1">
            <h1 className="truncate text-[17px] font-medium">{base.name}</h1>

            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px]">
        <Form {...baseRenameForm}>
          <form
            onSubmit={baseRenameForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={baseRenameForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base name</FormLabel>
                  <FormControl>
                    <Input placeholder="Base name..." {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name of your base
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Edit</Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};
