/*
  Warnings:

  - Added the required column `createdBy` to the `DinnerRecord` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DinnerRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "memo" TEXT,
    "totalAmount" INTEGER,
    "headcount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "teamId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "DinnerRecord_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DinnerRecord_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DinnerRecord_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DinnerRecord" ("createdAt", "date", "headcount", "id", "memo", "restaurantId", "teamId", "totalAmount", "updatedAt", "createdBy") SELECT "createdAt", "date", "headcount", "id", "memo", "restaurantId", "teamId", "totalAmount", "updatedAt", (SELECT id FROM User LIMIT 1) FROM "DinnerRecord";
DROP TABLE "DinnerRecord";
ALTER TABLE "new_DinnerRecord" RENAME TO "DinnerRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
