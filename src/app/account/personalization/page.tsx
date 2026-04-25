import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function PersonalizationPage() {
  redirect('/account/preferences#personalization');
}
