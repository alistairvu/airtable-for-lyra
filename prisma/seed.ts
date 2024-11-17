// Generate a base and 100_000 data points
import { PrismaClient, ColumnType } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
async function main() {
  // TODO: Replace with the original table ID.
  const tableId = `9a8a1a9f-c866-4c5f-a09d-25641cf48319`;

  console.log("Generating columns");
  const table = await prisma.table.findUnique({
    where: {
      id: tableId,
    },
    include: {
      columns: true,
    },
  });

  if (table === null) {
    return;
  }

  // Delete all cells of the table
  await prisma.cell.deleteMany({
    where: {
      row: {
        tableId,
      },
    },
  });

  const columns = table.columns;
  const nameId = columns.find((x) => x.name === "Name")?.id;
  const ageId = columns.find((x) => x.name === "Age")?.id;

  // Generate the 100k rows
  const limit = 15;
  console.log("Generating data...");
  const data = Array.from(Array(limit).keys()).map((_, index) => ({
    tableId: table.id,
    index,
  }));

  // Adding the 100k rows
  const rows = await prisma.row.createManyAndReturn({
    data,
  });
  console.log(`Added ${limit} rows`);

  const rowIds = rows.map((x) => x.id);

  const nameColumns = rowIds.map((rowId) => ({
    columnId: `${nameId}`,
    rowId,
    intValue: null,
    textValue: faker.person.fullName(),
  }));

  const ageColumns = rowIds
    .map((rowId) => ({
      rowId,
      age: Math.round(Math.random() * 100),
    }))
    .map(({ rowId, age }) => ({
      columnId: `${ageId}`,
      rowId,
      intValue: age,
      textValue: `${age}`,
    }));

  await prisma.cell.createMany({
    data: [...nameColumns, ...ageColumns],
  });
  console.log(`Filled ${limit} rows`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
