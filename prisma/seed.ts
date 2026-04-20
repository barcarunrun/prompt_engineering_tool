import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. チーム作成
  const team = await prisma.team.upsert({
    where: { name: "Default Team" },
    update: {},
    create: {
      name: "Default Team",
      password: await bcrypt.hash("team-password-123", 12),
    },
  });
  console.log("✅ Team created:", team.name);

  // 2. 管理者ユーザー作成
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      isRegistered: true,
      teamId: team.id,
    },
  });
  console.log("✅ Admin user created:", adminUser.email);

  // 3. メンバーユーザー作成
  const memberUser = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: {
      name: "Member User",
      email: "member@example.com",
      role: "member",
      isRegistered: true,
      teamId: team.id,
    },
  });
  console.log("✅ Member user created:", memberUser.email);

  // 4. サンプルプロンプト作成
  const prompt1 = await prisma.prompt.create({
    data: {
      name: "文章要約プロンプト",
      description: "入力テキストを簡潔に要約するプロンプト",
      content: "以下の文章を3行以内で要約してください。\n\n{input}",
      modelId: "gpt-4o",
      status: "published",
      latestVersion: 1,
      userId: adminUser.id,
    },
  });

  const prompt2 = await prisma.prompt.create({
    data: {
      name: "英日翻訳プロンプト",
      description: "英語を自然な日本語に翻訳するプロンプト",
      content: "以下の英文を自然な日本語に翻訳してください。\n\n{input}",
      modelId: "gpt-4o-mini",
      status: "published",
      latestVersion: 2,
      userId: adminUser.id,
    },
  });

  const prompt3 = await prisma.prompt.create({
    data: {
      name: "コードレビュープロンプト",
      description: "コードの改善点を指摘するプロンプト",
      content: "以下のコードをレビューし、改善点をリストアップしてください。\n\n```\n{input}\n```",
      modelId: "llama-3.3-70b-versatile",
      status: "draft",
      latestVersion: 1,
      userId: memberUser.id,
    },
  });
  console.log("✅ Prompts created:", [prompt1.name, prompt2.name, prompt3.name]);

  // 5. プロンプトバージョン作成
  await prisma.promptVersion.createMany({
    data: [
      {
        promptId: prompt1.id,
        version: 1,
        content: prompt1.content,
        description: "初期バージョン",
        userId: adminUser.id,
      },
      {
        promptId: prompt2.id,
        version: 1,
        content: "以下の英文を日本語に翻訳してください。\n\n{input}",
        description: "初期バージョン",
        userId: adminUser.id,
      },
      {
        promptId: prompt2.id,
        version: 2,
        content: prompt2.content,
        description: "より自然な翻訳を指示するよう改善",
        userId: adminUser.id,
      },
      {
        promptId: prompt3.id,
        version: 1,
        content: prompt3.content,
        description: "初期バージョン",
        userId: memberUser.id,
      },
    ],
  });
  console.log("✅ Prompt versions created");

  // 6. ターゲットテキストセット作成
  await prisma.targetTextSet.createMany({
    data: [
      {
        name: "要約テスト用テキスト",
        texts: JSON.stringify([
          "人工知能（AI）は、機械が人間の知能を模倣する技術です。近年、深層学習の発展により、画像認識や自然言語処理などの分野で目覚ましい進歩を遂げています。",
          "気候変動は地球規模の課題であり、各国が温室効果ガスの削減に取り組んでいます。再生可能エネルギーの導入が加速しており、太陽光発電や風力発電のコストは大幅に低下しています。",
        ]),
        userId: adminUser.id,
      },
      {
        name: "翻訳テスト用テキスト",
        texts: JSON.stringify([
          "The rapid advancement of artificial intelligence is transforming industries worldwide.",
          "Climate change poses significant challenges that require global cooperation and innovative solutions.",
        ]),
        userId: adminUser.id,
      },
    ],
  });
  console.log("✅ Target text sets created");

  console.log("\n🎉 Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
