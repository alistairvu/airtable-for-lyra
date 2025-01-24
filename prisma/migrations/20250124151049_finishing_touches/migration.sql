-- RenameForeignKey
ALTER TABLE "accounts" RENAME CONSTRAINT "accounts_userId_fkey" TO "accounts_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "bases" RENAME CONSTRAINT "bases_userId_fkey" TO "bases_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "cells" RENAME CONSTRAINT "cells_columnId_fkey" TO "cells_column_id_fkey";

-- RenameForeignKey
ALTER TABLE "cells" RENAME CONSTRAINT "cells_rowId_fkey" TO "cells_row_id_fkey";

-- RenameForeignKey
ALTER TABLE "columns" RENAME CONSTRAINT "columns_tableId_fkey" TO "columns_table_id_fkey";

-- RenameForeignKey
ALTER TABLE "rows" RENAME CONSTRAINT "rows_tableId_fkey" TO "rows_table_id_fkey";

-- RenameForeignKey
ALTER TABLE "sessions" RENAME CONSTRAINT "sessions_userId_fkey" TO "sessions_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "tables" RENAME CONSTRAINT "tables_baseId_fkey" TO "tables_base_id_fkey";

-- RenameForeignKey
ALTER TABLE "views" RENAME CONSTRAINT "views_tableId_fkey" TO "views_table_id_fkey";

-- RenameIndex
ALTER INDEX "accounts_provider_providerAccountId_key" RENAME TO "accounts_provider_provider_account_id_key";

-- RenameIndex
ALTER INDEX "sessions_sessionToken_key" RENAME TO "sessions_session_token_key";
