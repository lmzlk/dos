import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// A short, shareable family code. Whoever has the link is in the family.
function newRoom(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

// Opening the root creates a fresh family room and sends you to its link.
export default function Home() {
  redirect(`/f/${newRoom()}`);
}
