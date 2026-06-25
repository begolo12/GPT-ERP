/**
 * Seeder: company, division, user, COA
 * Idempotent: pakai upsert
 *
 * Run: pnpm db:seed
 */
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("\u{1F331} Seeding GPT-ERP database...\n");

  // ----- Companies -----
  console.log("1/4 Seeding companies...");
  const gas = await prisma.company.upsert({
    where: { code: "GAS" },
    update: {},
    create: { code: "GAS", name: "PT. Ganendra Arsyila Semesta" },
  });
  const djp = await prisma.company.upsert({
    where: { code: "DJP" },
    update: {},
    create: { code: "DJP", name: "PT. Daniswara Jaya Perkasa" },
  });
  const group = await prisma.company.upsert({
    where: { code: "GROUP" },
    update: {},
    create: { code: "GROUP", name: "Konsolidasi Group" },
  });
  console.log(`   \u2713 3 companies: GROUP, GAS, DJP`);

  // ----- Divisions -----
  console.log("2/4 Seeding divisions...");
  const divData: { code: "OP" | "FN" | "GA" | "HR"; name: string }[] = [
    { code: "OP", name: "Operasi" },
    { code: "FN", name: "Keuangan" },
    { code: "GA", name: "General Affair" },
    { code: "HR", name: "Human Resource" },
  ];
  for (const d of divData) {
    await prisma.division.upsert({
      where: { code: d.code },
      update: { name: d.name },
      create: d,
    });
  }
  console.log(`   \u2713 4 divisions: OP, FN, GA, HR`);

  // ----- Users -----
  console.log("3/4 Seeding users...");
  const passwordHash = await argon2.hash("Admin@2026!", { type: argon2.argon2id });
  const divOp = await prisma.division.findUnique({ where: { code: "OP" } });
  const divFn = await prisma.division.findUnique({ where: { code: "FN" } });
  const divGa = await prisma.division.findUnique({ where: { code: "GA" } });
  const divHr = await prisma.division.findUnique({ where: { code: "HR" } });

  const users: { email: string; username: string; name: string; role: any; companyId: string; divisionId: string | null }[] = [
    { email: "admin@gpt-erp.local",    username: "admin",    name: "Administrator",  role: "ADMIN",    companyId: group.id, divisionId: null },
    { email: "direktur@gpt-erp.local", username: "direktur", name: "Budi Direktur",  role: "DIREKTUR", companyId: gas.id,   divisionId: null },
    { email: "manager@gpt-erp.local",  username: "manager",  name: "Andi Manager",   role: "MANAGER",  companyId: gas.id,   divisionId: null },
    { email: "spv@gpt-erp.local",      username: "spv",      name: "Citra SPV",      role: "SPV",      companyId: gas.id,   divisionId: null },
    { email: "staff.op@gpt-erp.local", username: "staffop",  name: "Dedi Staff OP",  role: "OP",       companyId: gas.id,   divisionId: divOp!.id },
    { email: "staff.fn@gpt-erp.local", username: "stafffn",  name: "Eka Staff FN",   role: "FINANCE",  companyId: gas.id,   divisionId: divFn!.id },
    { email: "staff.ga@gpt-erp.local", username: "staffga",  name: "Fani Staff GA",  role: "GA",       companyId: gas.id,   divisionId: divGa!.id },
    { email: "staff.hr@gpt-erp.local", username: "staffhr",  name: "Galih Staff HR", role: "HR",       companyId: gas.id,   divisionId: divHr!.id },
    { email: "direktur.djp@gpt-erp.local", username: "direkturdjp", name: "Hadi Dir DJP", role: "DIREKTUR", companyId: djp.id, divisionId: null },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, companyId: u.companyId, divisionId: u.divisionId, isActive: true },
      create: { ...u, passwordHash },
    });
  }
  console.log(`   \u2713 ${users.length} users (password semua: Admin@2026!)`);

  // ----- COA (sesuai golden prompt section 7) -----
  console.log("4/4 Seeding COA...");
  const coa: { code: string; name: string; type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE" }[] = [
    // Assets
    { code: "11111", name: "KAS", type: "ASSET" },
    { code: "11121", name: "BANK MANDIRI", type: "ASSET" },
    { code: "11122", name: "BANK BRI", type: "ASSET" },
    { code: "11123", name: "BANK BCA", type: "ASSET" },
    { code: "11124", name: "BANK BNI", type: "ASSET" },
    { code: "11125", name: "BANK BTN", type: "ASSET" },
    { code: "11212", name: "PIUTANG RETENSI", type: "ASSET" },
    { code: "11214", name: "PIUTANG PENJUALAN", type: "ASSET" },
    { code: "11311", name: "UANG MUKA PEMASOK", type: "ASSET" },
    { code: "11321", name: "PERSEKOT", type: "ASSET" },
    { code: "11322", name: "KASBON", type: "ASSET" },
    { code: "11411", name: "PERSEDIAAN BARANG", type: "ASSET" },
    { code: "13151", name: "ASET KENDARAAN", type: "ASSET" },
    // Liabilities
    { code: "21111", name: "HUTANG USAHA", type: "LIABILITY" },
    { code: "21121", name: "HUTANG PPh 21", type: "LIABILITY" },
    { code: "21123", name: "HUTANG PPh 23", type: "LIABILITY" },
    { code: "21142", name: "HUTANG GAJI", type: "LIABILITY" },
    // Equity
    { code: "31111", name: "MODAL", type: "EQUITY" },
    { code: "31112", name: "LABA DITAHAN", type: "EQUITY" },
    // Revenue
    { code: "51111", name: "PENDAPATAN PENJUALAN", type: "REVENUE" },
    // COGS
    { code: "51211", name: "HPP", type: "EXPENSE" },
    { code: "51212", name: "SELISIH HARGA (PPV)", type: "EXPENSE" },
    // Expenses
    { code: "41111", name: "BIAYA MATERIAL", type: "EXPENSE" },
    { code: "48141", name: "GAJI", type: "EXPENSE" },
    { code: "48161", name: "BIAYA KENDARAAN", type: "EXPENSE" },
    { code: "48191", name: "BIAYA UMUM", type: "EXPENSE" },
  ];

  for (const a of coa) {
    await prisma.account.upsert({
      where: { code: a.code },
      update: { name: a.name, type: a.type },
      create: a,
    });
  }
  console.log(`   \u2713 ${coa.length} akun COA`);

  console.log("\n\u{1F389} Seed complete!\n");
  console.log("Login credentials (all users):");
  console.log("  Email:    see CREDENTIALS.md");
  console.log("  Password: Admin@2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });