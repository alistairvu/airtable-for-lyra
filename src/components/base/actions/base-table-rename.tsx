"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Table } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover";
import { api } from "~/trpc/react";

type BaseTableRenameProps = {
  table: Table;
};

export function BaseTableRename({ table }: BaseTableRenameProps) {
  const utils = api.useUtils();

  const renameTable = api.table.rename.useMutation({
    onMutate: async ({ name, tableId }) => {
      await utils.base.getAllTables.cancel();

      const previousTables = utils.base.getAllTables.getData();
      utils.base.getAllTables.setData({ baseId: table.baseId! }, (old) => {
        if (!old) return [];
        return old.map((table) => {
          if (table.id === tableId) {
            return { ...table, name };
          }
          return table;
        });
      });

      return { previousTables };
    },

    onError: (_err, _params, context) => {
      utils.base.getAllTables.setData(
        { baseId: table.baseId! },
        context?.previousTables ?? [],
      );
    },

    onSettled: async (_data, _error, _params) => {
      await utils.base.getAllTables.invalidate({ baseId: table.baseId! });
    },
  });

  // Form logic
  const tableRenameSchema = z.object({
    name: z.string().min(0, {
      message: "A table must have a name.",
    }),
  });

  const tableRenameForm = useForm<z.infer<typeof tableRenameSchema>>({
    resolver: zodResolver(tableRenameSchema),
    defaultValues: {
      name: table.name,
    },
  });

  const onSubmit = (values: z.infer<typeof tableRenameSchema>) => {
    if (values.name !== table.name) {
      renameTable.mutate({
        tableId: table.id,
        name: values.name,
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex">
          <div className="height-full flex flex-auto cursor-pointer items-center rounded-t bg-white p-1 px-3 font-medium text-black">
            {table.name} <ChevronDown className="ml-1 h-4 w-4" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[360px]">
        <Form {...tableRenameForm}>
          <form
            onSubmit={tableRenameForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={tableRenameForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Table name..."
                      data-1p-ignore
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the name of your table.
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
}
